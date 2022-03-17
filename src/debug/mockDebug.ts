/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import {
	LoggingDebugSession,
	InitializedEvent, TerminatedEvent, StoppedEvent,
	Thread, Scope, Handles, Breakpoint,
	StackFrame, Source,
} from 'vscode-debugadapter';
import { DebugProtocol } from 'vscode-debugprotocol';
// import { FileAccessor } from './mockRuntime';
const { Subject } = require('await-notify');
import * as Net from 'net';
/*+\NEW\czm\2021.05.8\调试控制台输出日志*/
import * as vscode from "vscode";
import * as fs from 'fs';
import * as path from 'path'; // 导入fs库和path库


// import { PluginJsonParse } from '../plugConfigParse';
// import { ProjectJsonParse } from "../project/projectConfigParse";


import * as ndkProject from "../ndk/ndkProject";
import * as tsQueue from "../tsQueue";

import { getPluginConfigActivityProject } from '../plugConfigParse';
import { getProjectConfigAppFile, getProjectConfigModuleModel, getProjectConfigType, setProjectConfigModuleModel } from '../project/projectConfigParse';
// import { getAirSimulatorSkinConfigPath } from '../variableInterface';


// 获取当前时间戳，并解析后格式化输出
function formatConsoleDate(date: any) {
	var year = date.getFullYear();  // 获取完整的年份(4位,1970-????)
	var month = date.getMonth();    // 获取当前月份(0-11,0代表1月)
	var day = date.getDate();
	var hour = date.getHours();
	var minutes = date.getMinutes();
	var seconds = date.getSeconds();
	return year +
		'-' + (month + 1) +
		'-' + day +
		'_' +
		((hour < 10) ? '0' + hour : hour) +
		'-' +
		((minutes < 10) ? '0' + minutes : minutes) +
		'-' +
		((seconds < 10) ? '0' + seconds : seconds);
}


let queue = new tsQueue.Queue();//实例化队列
// 定义输出日志到输出
let _outputChannel = vscode.window.createOutputChannel("LuatIDE_log");

// let configDataPath: any = process.env['APPDATA'];

/**
 * This interface describes the mock-debug specific launch attributes
 * (which are not part of the Debug Adapter Protocol).
 * The schema for these attributes lives in the package.json of the mock-debug extension.
 * The interface should always match this schema.
 */
interface ILaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
	/** An absolute path to the "program" to debug. */
	program: string;
	/** Automatically stop target after launch. If not specified, target does not stop. */
	stopOnEntry?: boolean;
	/** enable logging the Debug Adapter Protocol */
	trace?: boolean;
	/** run without debugging */
	noDebug?: boolean;
}

export class MockDebugSession extends LoggingDebugSession {
	// we don't support multiple threads, so we can use a hardcoded ID for the default thread
	private static threadID = 1;

	private _variableHandles = new Handles<any>();

	private _configurationDone = new Subject();

	private _breakAddDone = new Subject();
	private _breakDelDone = new Subject();
	private _breakClrDone = new Subject();
	private _varsDone = new Subject();
	private _gvarsDone = new Subject();
	private _watchvarsDone = new Subject();


	/*+\NEW\czm\2021.05.21\VS code 插件开发 / vscode端需要支持table的展开显示*/
	private dbgJvarsArray = new Array();
	private dbgVarsArray = new Array();
	private dbgGvarsArray = new Array();
	/*-\NEW\czm\2021.05.21\VS code 插件开发 / vscode端需要支持table的展开显示*/
	private _stackDone = new Subject();
	private _stateChanged = new Subject();
	private _socketReady = new Subject();
	// private _socket_connect_ok = new Subject();
	private dbgInputBuffer = Buffer.from("");

	private btLock = true;
	private btLockDone = new Subject();

	private download_success = new Subject();
	protected _socket: any = null;

	private timesleep = new Subject();

	protected dbg_state: Number = 0;
	protected download_state: Number = 0;

	protected sourceMaping = new Map();
	/*+\NEW\czm\2021.05.21\VS code 插件开发 / vscode端需要支持table的展开显示*/
	protected varsDataRecvStartFlag: boolean = false;//开始接收vars的body
	protected varsData: string = "";
	protected varsDataRecvLen: number = 0;//接收到的body
	protected varsDataLen: number = 0;//body全长
	protected varsHands: string[] = [];//vars的hands
	/*-\NEW\czm\2021.05.21\VS code 插件开发 / vscode端需要支持table的展开显示*/

	/*+\NEW\czm\2021.05.26\进入调试时未删除激活工程以外的断点*/
	public activeWorkspace: string = "";

	/*-\NEW\czm\2021.05.26\进入调试时未删除激活工程以外的断点*/

	public current_messagearr: any;

	private dataReceiveFlag: number = 1;
	private current_logfilename: string = "";
	// private configDataPath: any = process.env['APPDATA'];

	// private pluginJsonParse: any = new PluginJsonParse();
	// private projectJsonParse: any = new ProjectJsonParse();
	// dbg_dispatcher元素隐式具有 "any" 类型，因为类型为 "any" 的表达式不能用于索引类型 "MockDebugSession"。
	[key: string]: any;
	// 分发器
	public dbg_dispatcher(heads: any, exts: any) {

		var key: any = "dbg_" + heads[0] + "_" + heads[1];
		if (typeof this[key] === "function") {

			this[key](heads, exts);
			return;
		}
		if (heads.length > 2) {
			key += "_" + heads[2];
			if (typeof this[key] === "function") {
				this[key](heads, exts);
				return;
			}
		}
	}
	// 准备下载确认类
	public dbg_download_state() {
		this.download_state = 1;
	}

	/*+\NEW\czm\2021.05.8\调试控制台输出日志*/
	public dbg_luat_log(heads: any, exts: any) {
		vscode.debug.activeDebugConsole.append(exts);
		_outputChannel.append(exts);
		// 增加lua运行日志文件下载到本地活动工程目录
		fs.appendFile(this.activeWorkspace + "\\.luatide"  + "\\LuatIDE_log" + "\\" + this.current_logfilename, exts + "\r\n", () => { });
	}
	/*-\NEW\czm\2021.05.8\调试控制台输出日志*/

	//---------------------------------------------------------------
	//                State 状态类
	public dbg_state_changed(heads: any) {
		this.dbg_state = parseInt(heads[3]);
		this._stateChanged.notify();
	}

	public dbg_event_waitc() {
		this.dbg_state = 1;
	}

	public dbg_event_waitt() {
		this.dbg_state = 0;
		this.sendEvent(new TerminatedEvent());
		this._stateChanged.notify();
	}
	//---------------------------------------------------------------
	//                事件类
	public dbg_event_stopped(heads: any) {
		this.dbg_state = 3;
		this.sendEvent(new StoppedEvent(heads[2], 1));
	}
	//---------------------------------------------------------------
	//                断点配置响应
	public dbg_resp_break_add() {
		this._breakAddDone.notify();
	}

	public dbg_resp_break_del() {
		this._breakDelDone.notify();
	}

	public dbg_resp_break_clear() {
		this._breakClrDone.notify();
	}
	// /*+\NEW\zhw\2021.06.28\获取用户所选下载配置文件列表*/
	private userSourceList: string[] = new Array();
	// /*+\NEW\zhw\2021.07.12\修复调试模式部分文件无法加载源文件bug*/
	private userSourceListPath: string[] = [];
	public fileDisplay(filePath: string) {
		// 根据文件路径读取文件，返回一个文件列表
		const userSourceListTmp = fs.readdirSync(filePath);
		// 遍历读取到的文件列表
		for (let i = 0; i < userSourceListTmp.length; i++) {
			// path.join得到当前文件的绝对路径
			const filepath = path.join(filePath, userSourceListTmp[i]);
			// 根据文件路径获取文件信息
			const stats = fs.statSync(filepath);
			const isFile = stats.isFile(); // 是否为文件
			const isDir = stats.isDirectory(); // 是否为文件夹
			if (isFile) {
				if (userSourceListTmp[i].lastIndexOf('.lua') !== -1) {
					console.log(filePath);
					this.userSourceList.push(userSourceListTmp[i]);
					this.userSourceListPath.push(path.join(filePath, userSourceListTmp[i]));
					console.log("当前文件：", userSourceListTmp[i]);
				}
			} else if (isDir) {
				this.fileDisplay(filepath); // 递归，如果是文件夹，就继续遍历该文件夹里面的文件	
				console.log(userSourceListTmp);

			}
		};
		console.log("处理后：", this.userSourceList);
		return this.userSourceList;
	}
	// /*-\NEW\zhw\2021.07.12\修复调试模式部分文件无法加载源文件bug*/
	// /*-\NEW\zhw\2021.06.28\获取用户所选下载配置文件列表*/
	//-----------------------------------------------------------------
	// 读取配置文件路径

	private generateProjectFilePath() {
		let configSourceFileList: string[] = [];
		let configSourceFilepathList: string[] = [];
		let projectFileslist = getProjectConfigAppFile(this.activeWorkspace);
		for (let index = 0; index < projectFileslist.length; index++) {
			const projectAbsoluteFile = path.join(this.activeWorkspace, projectFileslist[index]) ;
			const projectFile = path.basename(projectAbsoluteFile);
			if (fs.statSync(projectAbsoluteFile).isFile()) {
				configSourceFileList.push(projectFile);
				configSourceFilepathList.push(projectAbsoluteFile);
			}
		}
		const temp = [configSourceFileList, configSourceFilepathList];
		return temp;
	}
	//打印指定深度或打印全部堆栈信息。
	private dbg_stack: DebugProtocol.StackFrame[] = new Array();
	public dbg_resp_stack(heads: any, exts: String) {
		const level = parseInt(heads[3]);
		if (level === -1) {
			this._stackDone.notify();
		}
		else {
			var fullname = exts.trim();
			let tmp = fullname.split(":");
			// 跳转路径修改
			let currentconfigSourceFileList: any = [];
			let configSourceFilepathList: any = this.generateProjectFilePath()[1];
			currentconfigSourceFileList = this.generateProjectFilePath()[0];
			let sourceName: string = "";
			if (tmp[0].indexOf("/lua/") !== -1) {
				sourceName = tmp[0].substring(4 + 1,);
			}
			else if (tmp[0].indexOf("/luadb/") !== -1) {
				sourceName = tmp[0].substring(6 + 1,);
			}
			else {
				sourceName = tmp[0].substring(1,);
			}
			let source: string = "";
			// /*+\NEW\zhw\2021.06.28\多级文件跳转逻辑适配性修改*/

			if (currentconfigSourceFileList.indexOf(sourceName) !== -1) {
				console.log("当前", currentconfigSourceFileList);
				for (let i = 0; i < currentconfigSourceFileList.length; i++) {
					const projectFile = path.basename(configSourceFilepathList[i]);
					if (projectFile === sourceName) {
						source = configSourceFilepathList[i];
						break;
					}
				}
			}
			else {
				source = path.join(__dirname, "../..", "lib_merge_temp", sourceName);
			}
			// /*-\NEW\zhw\2021.06.28\多级文件跳转逻辑适配性修改*/
			// const line = parseInt(tmp[1])
			let line: number;
			if (sourceName === "main.lua") {
				line = parseInt(tmp[1]) - 1;
			}
			else {
				line = parseInt(tmp[1]);
			}
			// 修复跳转不到[c:-1]报错bug
			if (line === -1) {
				return;
			}
			fullname = tmp[0] + ":" + line;
			/*+\NEW\czm\2021.05.27\添加断点获取到的文件名有问题*/
			const src = new Source(sourceName);
			/*-\NEW\czm\2021.05.27\添加断点获取到的文件名有问题*/
			src.path = this.sourceMaping.get(source) || source;
			//logger.verbose("" + source + " => " + src.path)
			const frame = new StackFrame(level, fullname, src, line);
			this.dbg_stack.push(frame);

		}
	}

	//------------------------------------------------------------------
	//-----------------------------------------------------------------
	//打印变量信息
	public dbg_resp_vars(heads: any, exts: String) {
		const index = parseInt(heads[2]);
		if (index === 0) {
			//局部变量全部打印完毕了
			this._varsDone.notify();//通知dbg vars变量接收完成
		}
		// 补丁：过滤模块上报空json文件干扰
		else if (index !== 5) {
			this.dbgVarsArray.push(exts);
			// console.log("dbg_vars");
		}
	}
	public dbg_resp_gvars(heads: any, exts: String) {
		const index = parseInt(heads[2]);
		if (index === 0) {
			//全局变量全部打印完毕了
			this._gvarsDone.notify();//通知dbg vars变量接收完成
		}
		else {
			this.dbgGvarsArray.push(exts);
		}
	}
	public dbg_resp_jvars(heads: any, exts: string) {
		const index = parseInt(heads[2]);
		if (index === 0) {
			//变量全部打印完毕了
			console.log("当前的exts是", exts);
			this._watchvarsDone.notify();//通知dbg vars变量接收完成
		}
		else {
			this.dbgJvarsArray.push(exts);
		}
	}

	/*+\NEW\czm\2021.05.21\VS code 插件开发 / vscode端需要支持table的展开显示*/
	public dbg_handle_msg(msg: any) {
		if (this.varsDataRecvStartFlag === false) {
			let start: number = msg.indexOf("[");
			let end: number = msg.indexOf("]");
			if (start < 0 || start > end) {
				return;
			}
			let head: string = msg.substring(start + 1, end);
			let heads: string[] = head.split(",");
			if (heads.length < 2) {
				return;
			}
			/*+\NEW\czm\2021.05.21\VS code 插件开发 / vscode端开发全局变量的显示的功能*/
			if (heads[1] === "vars" || heads[1] === "gvars" || heads[1] === "jvars")
			/*-\NEW\czm\2021.05.21\VS code 插件开发 / vscode端开发全局变量的显示的功能*/ {
				this.varsDataRecvStartFlag = true;
				this.varsDataLen = Number(heads[2]);
				this.varsHands = heads;
				return;
			}

			var body = msg.substring(end + 1);
			this.dbg_dispatcher(heads, body);
		}
		else if (this.varsDataRecvStartFlag === true) {
			if (this.varsDataLen > 0) {
				this.varsData += msg;
				this.varsDataRecvLen += msg.length;
			}
			console.log("varsDataRecvLen:", this.varsDataRecvLen);
			console.log("varsDataLen:", this.varsDataLen);
			if (this.varsDataRecvLen === this.varsDataLen) {
				this.dbg_dispatcher(this.varsHands, this.varsData.toString());
				this.varsDataRecvStartFlag = false;
				this.varsDataLen = 0;
				this.varsDataRecvLen = 0;
				this.varsHands = [];
				this.varsData = "";
			}

			this.dbg_dispatcher(this.varsHands, this.varsData.toString());

		}
	}
	// private requestMessage:string="";
	private timer1: any = undefined;
	public messageRequestManage() {
		// 判断队列是否有元素
		if (this.timer1 === undefined) {
			if (!queue.isEmpty()) {
				console.log("当前的dataReceiveFlag：", this.dataReceiveFlag);
				this.timer1 = setInterval(this.commandprint1, 5, this);
			}

			// 判断定时器是否激活
			// 如果未激活就启动定时器
			// 如果激活就只入队命令到队
		}
	}

	// 命令队列出队;
	public commandprint1(arg: any) {

		if (arg.dataReceiveFlag === 1) {

			if (queue.isEmpty()) {
				clearInterval(arg.timer1);
				arg.timer1 = undefined;
				return;
			}
			console.log("当前队列第一条数据", queue.front()[0]);
			// 接收消息队列出队数据
			const requestDataArr: string[] = queue.front();
			const requestData = requestDataArr[0];
			arg.requestMessage = requestDataArr[1];
			console.log("当前出队数据：", requestData);
			arg.dbg_write_cmd(requestData);
			console.log("队列发送数据成功", requestData);
			arg.dataReceiveFlag = 0;
		}
	}

	/*-\NEW\czm\2021.05.21\VS code 插件开发 / vscode端需要支持table的展开显示*/
	public bindSocket(socket: Net.Socket) {

		//vscode接收来自python服务器数据
		socket.on('data', async (data: Buffer) => {
			if (this.dbgInputBuffer.length > 0) {
				this.dbgInputBuffer = Buffer.concat([this.dbgInputBuffer, data]);
			}
			else {
				this.dbgInputBuffer = data;
			}

			/*+\NEW\czm\2021.05.21\VS code 插件开发 / vscode端需要支持table的展开显示*/
			while (true) {
				let msg: any;
				let msglen: number = 0;
				if (this.varsDataRecvStartFlag === false) {
					var offset = this.dbgInputBuffer.indexOf('\n');
					if (offset > - 1) {
						msglen = offset + 1;
						msg = this.dbgInputBuffer.subarray(0, msglen).toString("utf-8");
						console.log(msg, "数据接收成功:", msg);

						if (!queue.isEmpty()) {
							if (msg.indexOf(queue.front()[1]) !== -1 && queue.front()[1] !== "") {
								this.dataReceiveFlag = 1;
								console.log("当前回传确认数据是", queue.front()[1], "当前接收数据是：", msg);
								// // at交互数据发送到console终端
								// if(msg.indexOf(queue.front()[0])!==-1){
								// 	vscode.debug.activeDebugConsole.appendLine(msg);
								// }
								queue.dequeue();
								// await this.dataReceive.notify();
							}
							// 补丁：3103版本固件回传的有问题
							if (msg.indexOf("D/dbg [resp,wvars,0]") !== -1) {
								this.dataReceiveFlag = 1;
								queue.dequeue();
							}
						}
					}
					else {
						break;
					}
				}
				else if (this.varsDataRecvStartFlag === true) {
					if (this.varsDataLen !== 0) {
						msglen = this.varsDataLen - this.varsDataRecvLen;

						msg = this.dbgInputBuffer.subarray(0, msglen);
						if (msg.length <= 0) {
							break;
						}
					}
					else {
						this.dbg_handle_msg(msg);
						break;
					}

				}
				// 	//原有处理逻辑
				this.dbg_handle_msg(msg);
				this.dbgInputBuffer = this.dbgInputBuffer.slice(msglen);
			}
			/*-\NEW\czm\2021.05.21\VS code 插件开发 / vscode端需要支持table的展开显示*/
		});
		this._socket = socket;
		this._socketReady.notify();
	}
	// 增加休眠时间函数
	public async sleep(time: number): Promise<void> {
		return new Promise<void>((res, rej) => {
			setTimeout(res, time);
		});
	}
	public async downpath_send() {
		this.download_state = 0;
		// 获取用户工作区路径
		if (vscode.workspace) {
			// 用户当前点击文件获取。
			/*+\NEW\zhw\2021.05.25\用户工作空间路径从插件配置文件里读取*/
			const user_path_data = "work_path " + this.activeWorkspace;
			this.dbg_write_cmd(user_path_data);
			await this.sleep(100);

			// 插件所在路径获取
			const plug_path: string = path.join(__dirname, "../..");
			const plug_path_data: any = "plug_path " + plug_path;
			this.dbg_write_cmd(plug_path_data);
			await this.sleep(100);


			const module_model = getProjectConfigModuleModel(this.activeWorkspace);
			// 修复模块不显示时默认使用Air72XUX/Air82XUX模块型号
			if (module_model === undefined) {
				setProjectConfigModuleModel(this.activeWorkspace, "air72XUX/air82XUX");
			}
			this.dbg_write_cmd("LuatIDE_Down/LoAd");
			return true;
		}
	}

	//原有命令写入python服务器逻辑，有修改
	public dbg_write_cmd(data: String) {
		console.log(data);
		for (var i = 0; i < 100; i++) {
			if (this._socket !== null) {
				break;
			}
			this._socketReady.wait(1000);
		}
		if (this._socket === null) {
			console.log("设备链接未就绪,无法输出控制命令");
			return;
		}

		//功能兼容改写,增加了发送给vscode数据的多样化情况适配。
		var line_temp = {
			"state": "1",
			"command": "",
			"extension_temp": "this is a extension"
		};


		let dataCommand: any;
		let dataState: string;
		if (data.indexOf("Po/Rt") !== -1) {
			dataState = "0";
			var dataTemp = data.substring(5,);
			dataCommand = { "cmdstyle": "openport", "param": "" };
			dataCommand.param = dataTemp;
		}
		else if (data.indexOf("LuatIDE_Down/LoAd") !== -1) {
			dataState = "0";
			dataCommand = { "cmdstyle": "download" };
		}
		else if (data.indexOf("work_path") !== -1) {
			dataState = "0";
			/*+\NEW\czm\2021.05.8\自动启动服务换电脑大概率失效*/
			var dataTemp = data.substring(10,);
			/*-\NEW\czm\2021.05.8\自动启动服务换电脑大概率失效*/
			dataCommand = { "cmdstyle": "work_path", "param": "" };
			dataCommand.param = dataTemp;

		}
		else if (data.indexOf("plug_path") !== -1) {
			dataState = "0";
			/*+\NEW\czm\2021.05.8\自动启动服务换电脑大概率失效*/
			var dataTemp = data.substring(10,);
			/*-\NEW\czm\2021.05.8\自动启动服务换电脑大概率失效*/
			dataCommand = { "cmdstyle": "plug_path", "param": "" };
			dataCommand.param = dataTemp;

		}
		else if (data.indexOf("ulib_path") !== -1) {
			dataState = "0";
			/*+\NEW\czm\2021.05.8\自动启动服务换电脑大概率失效*/
			var dataTemp = data.substring(10,);
			/*-\NEW\czm\2021.05.8\自动启动服务换电脑大概率失效*/
			dataCommand = { "cmdstyle": "ulib_path", "param": "" };
			dataCommand.param = dataTemp;

		}
		else if (data.indexOf("upac_path") !== -1) {
			dataState = "0";
			/*+\NEW\czm\2021.05.8\自动启动服务换电脑大概率失效*/
			var dataTemp = data.substring(10,);
			/*-\NEW\czm\2021.05.8\自动启动服务换电脑大概率失效*/
			dataCommand = { "cmdstyle": "upac_path", "param": "" };
			dataCommand.param = dataTemp;

		}
		/*+\NEW\czm\2021.07.02\支持多模块，通过模块型号指定选择端口号名称使其兼容1603模块端口​*/
		else if (data.indexOf("module_model") !== -1) {
			dataState = "0";
			/*+\NEW\czm\2021.05.8\自动启动服务换电脑大概率失效*/
			var dataTemp = data.substring(13,);
			/*-\NEW\czm\2021.05.8\自动启动服务换电脑大概率失效*/
			dataCommand = { "cmdstyle": "module_model", "param": "" };
			dataCommand.param = dataTemp;

		}
		/*-\NEW\czm\2021.07.02\支持多模块，通过模块型号指定选择端口号名称使其兼容1603模块端口​*/
		else if (data.indexOf("Close/Port") !== -1) {
			dataState = "0";
			var dataTemp = data.substring(10,);
			dataCommand = { "cmdstyle": "closeport", "param": "" };
			dataCommand.param = dataTemp;
		}
		/*+\NEW\czm\2021.05.9\点击停止调试按钮时自动终止服务器进程*/
		else if (data.indexOf("service/kill") !== -1) {
			dataState = "0";
			var dataTemp = data.substring(10,);
			dataCommand = { "cmdstyle": "servicekill" };
		}
		/*+\NEW\czm\2021.05.9\添加调试控制台>输入框发送at的功能*/
		else if (data.indexOf("modem/sendat") !== -1) {
			dataState = "2";
			var dataTemp = data.substring(13,);
			dataCommand = { "cmdstyle": "sendat", "param": "" };
			dataCommand.param = dataTemp;
		}
		else if (data.indexOf("watch/jvars") !== -1) {
			dataState = "2";
			var dataTemp = data.substring(12,);
			dataCommand = { "cmdstyle": "watch/jvars", "param": "" };
			dataCommand.param = dataTemp;
		}
		/*-\NEW\czm\2021.05.9\添加调试控制台>输入框发送at的功能*/

		/*-\NEW\czm\2021.05.9\点击停止调试按钮时自动终止服务器进程*/
		else {
			dataState = "1";
			var dataTemp = "dbg " + data;
			dataCommand = { "cmdstyle": "dbg", "param": "" };
			dataCommand.param = dataTemp;
		}
		line_temp.state = dataState;
		line_temp.command = dataCommand;
		// \r\n用来解析的，不可去掉
		const line = JSON.stringify(line_temp) + "\r\n";

		try {
			this._socket.write(line, (err: any) => {
				if (err) {
					console.log(err);
				}
			});
		}
		catch (e) { }
	}
	/**
	 * The 'initialize' request is the first request called by the frontend
	 * to interrogate the features the debug adapter provides.
	 */
	protected async initializeRequest(response: DebugProtocol.InitializeResponse, args: DebugProtocol.InitializeRequestArguments) {

		/*+\NEW\zhw\2021.05.28\解决重启无法实现*/
		while(this._socket !== null)
		{
			console.log("wait socket reset");
			await this.sleep(500);
		}
		console.log("initializeRequest",this._socket);
		// require('child_process').exec('taskkill -f -im ide_service.exe');
		// kill活动终端
		vscode.commands.executeCommand("workbench.action.terminal.kill");
		/*+\NEW\zhw\2021.05.28\解决重启无法实现*/

		this.activeWorkspace = getPluginConfigActivityProject();		
		// 如果是NDK工程，就需要先去编译
		if(getProjectConfigType(this.activeWorkspace)==="ndk")
		{
			console.log("this is ndk project!!!");
			let result = await ndkProject.build(this.activeWorkspace);
			if(result===false)
			{
				// 编译失败
				console.log("NDK compilation failed");
				// 强行终止调试器
				vscode.debug.stopDebugging();
				return;
			}
			else
			{
				// 编译成功，继续执行
				console.log("The NDK was compiled successfully");
			}

		}
		

		// 写入lua运行日志到用户工程下的log文件夹
		// if (!fs.existsSync(this.activeWorkspace + "\\LuatIDE_log")) {
		// 	fs.mkdirSync(this.activeWorkspace + "\\LuatIDE_log");
		// }
		if (!fs.existsSync(path.join(this.activeWorkspace,'.luatide'))) {
			fs.mkdirSync(path.join(this.activeWorkspace,'.luatide'));
		}
		if (!fs.existsSync(path.join(this.activeWorkspace,'.luatide','LuatIDE_log'))) {
			fs.mkdirSync(path.join(this.activeWorkspace,'.luatide','LuatIDE_log'));
		}
		this.current_logfilename = formatConsoleDate(new Date()) + "_log.txt";
		// execFile(path_exe_new);
		// 清空历史输出的数据
		_outputChannel.clear();
		// 设置输出展示，默认值为false，不会显示焦点
		_outputChannel.show(false);
		// 每次调试前清空队列数据
		queue.clear();
		this.fullvarsArray = [];
		const flag: any = await this.downpath_send();
		if (flag === false) {
			// 强行终止调试器
			vscode.debug.stopDebugging();
			return;
		}
		// 等待下载完成状态
		for (var i = 0; i < 120 * 3; i++) {
			if(this._socket === null)
			{
				return;
			}
			if (this.download_state === 0) {
				console.log("等待download_state");
				await this.download_success.wait(300);
			} else {
				break;
			}
		}
		/*+\NEW\zhw\2021.06.11\修改用户概率性不能进断点bug*/
		
		for (var i = 0; i < 120 * 3; i++) {
			if(this._socket === null)
			{
				return;
			}
			if (this.dbg_state === 1) {
				console.log("waiting for debugger ok");
				break;
			} else {
				console.log("等待waiting for debugger");
				await this.sleep(300);
			}
		}
		vscode.commands.executeCommand("workbench.panel.repl.view.focus");
		/*-\NEW\zhw\2021.06.11\修改用户概率性不能进断点bug*/
		// 置发送标志初值为1
		this.dataReceiveFlag = 1;

		// build and return the capabilities of this debug adapter:
		response.body = response.body || {};

		// the adapter implements the configurationDoneRequest.
		response.body.supportsConfigurationDoneRequest = true;

		this.sendResponse(response);

		// since this debug adapter can accept configuration requests like 'setBreakpoint' at any time,
		// we request them early by sending an 'initializeRequest' to the frontend.
		// The frontend will end the configuration sequence by calling 'configurationDone' request.
		this.sendEvent(new InitializedEvent());
	}

	// /**
	//  * Called at the end of the configuration sequence.
	//  * Indicates that all breakpoints etc. have been sent to the DA and that the 'launch' can start.
	//  */
	protected configurationDoneRequest(response: DebugProtocol.ConfigurationDoneResponse, args: DebugProtocol.ConfigurationDoneArguments): void {
		super.configurationDoneRequest(response, args);

		// notify the launchRequest that configuration has finished
		this._configurationDone.notify();
	}

	//启动请求
	//dbg start
	protected async launchRequest(response: DebugProtocol.LaunchResponse, args: ILaunchRequestArguments) {

		args.trace = true;

		await this._configurationDone.wait(1000);


		this.current_messagearr = ["start", "D/dbg [state,changed,"];
		queue.enqueue(this.current_messagearr);
		console.log("dbg start入队成功");
		this.messageRequestManage();

		this.sendResponse(response);
	}

	//设置断点请求（清除也在里面）
	//dbg break clr
	//dbg break add
	protected async setBreakPointsRequest(response: DebugProtocol.SetBreakpointsResponse, args: DebugProtocol.SetBreakpointsArguments) {
		//资源文件路径不在用户当前选择路径下，则过滤这些断点
		/*+\NEW\czm\2021.05.26\进入调试时未删除激活工程以外的断点*/
		var points: DebugProtocol.Breakpoint[] = [];
		if (args.source.path) {
			const pathIndex = args.source.path.lastIndexOf("\\");
			let path: string = args.source.path.substring(0, pathIndex);
			// 修改不能跳转到其它地方问题,解析json
			const project_filelist_temp = this.generateProjectFilePath()[1];
			// 遍历json文件
			let temp_flag = false;
			for (let i = 0; i < project_filelist_temp.length; i++) {
				const element = project_filelist_temp[i];
				// console.log("===============",element,path,element.indexOf(path));
				// 排除字符串大小写问题干扰，统一处理
				if (element.toLocaleLowerCase().indexOf(path.toLocaleLowerCase()) !== -1) {
					temp_flag = true;
					break;
				}
				else {
					temp_flag = false;
				}
			}
			if (temp_flag === false) {
				this.sendResponse(response);
				return;
			}

			/*-\NEW\czm\2021.05.26\进入调试时未删除激活工程以外的断点*/
			// this.dbg_write_cmd("break clr " + args.source.name);
			this.current_messagearr = ["break clr " + args.source.name, "D/dbg [resp,break,clear,ok]"];
			// this.first_messageflag  = true;
			queue.enqueue(this.current_messagearr);
			this.messageRequestManage();
			console.log("break clr 入队成功");

			var srcname = args.source.name;
			this.sourceMaping.set(srcname, args.source.path);
			if (args.breakpoints) {
				for (var i = 0; i < args.breakpoints.length; i++) {
					var point = args.breakpoints[i];

					/*+\NEW\zhw\2021.05.26\dbg.wait()main.lua中的代码下载行数加1*/
					if (args.source.name) {
						if (args.source.name.indexOf("main.lua") !== -1) {
							this.current_messagearr = ["break add " + args.source.name + " " + (Number(point.line) + 1).toString(), `D/dbg [resp,break,add,ok] ${args.source.name}:${Number(point.line) + 1}`];
							queue.enqueue(this.current_messagearr);
							console.log("dbg add 入队成功", point.line + 1);
							this.messageRequestManage();
						}
						else {
							this.current_messagearr = ["break add " + args.source.name + " " + point.line, `D/dbg [resp,break,add,ok] ${args.source.name}:${Number(point.line)}`];
							queue.enqueue(this.current_messagearr);
							console.log("dbg add 入队成功", point.line);
							this.messageRequestManage();
						}
					}
					/*-\NEW\zhw\2021.05.26\dbg.wait()自动下载进入模块前自动添加*/
					const bp = new Breakpoint(true, point.line) as DebugProtocol.Breakpoint;
					points.push(bp);
				}
			}
		}
		// send back the actual breakpoint positions
		response.body = {
			breakpoints: points
		};
		// await this._breakAddAllDone.notify();
		this.sendResponse(response);
	}
	//断开连接请求
	
	protected disconnectRequest(response: DebugProtocol.DisconnectResponse, args: DebugProtocol.DisconnectArguments, request?: DebugProtocol.Request): void {
		// this.dbg_write_cmd("dbg disconnect " + args.restart)
		// 清除队列
		queue.clear();
		// 怀疑是bug，修改后：
		this.dbg_write_cmd("disconnect " + args.restart);
		/*+\NEW\czm\2021.05.9\点击停止调试按钮时自动终止服务器进程*/
		this.dbg_write_cmd("service/kill");
		/*-\NEW\czm\2021.05.9\点击停止调试按钮时自动终止服务器进程*/
		// 关闭定时器，置this.timer1为undefined
		this.timer1 = undefined;
		clearInterval(this.timer1);
		/*+\NEW\czm\2021.05.27\终端在调试模式结束按停止按钮后有时不能正常关闭*/
		let child_process = require('child_process');
		// child_process.exec('taskkill -f -im ide_service.exe');
		if (getProjectConfigModuleModel(this.activeWorkspace) === "simulator") {
			child_process.exec('taskkill -f -im LuatOS-Air_SIMULATOR.exe');
			child_process.exec('taskkill -f -im lcd_plugin.exe');
		}
		console.log("执行了断开连接的请求");
		this._socket = null;
		/*-\NEW\czm\2021.05.27\终端在调试模式结束按停止按钮后有时不能正常关闭*/
		this.sendResponse(response);

	}
	protected threadsRequest(response: DebugProtocol.ThreadsResponse): void {

		// runtime supports no threads so just return a default thread.
		response.body = {
			threads: [
				new Thread(MockDebugSession.threadID, "main.lua")
			]
		};
		this.sendResponse(response);
	}
	//堆栈跟踪请求
	protected async stackTraceRequest(response: DebugProtocol.StackTraceResponse, args: DebugProtocol.StackTraceArguments) {

		// 不知道为啥, stackTrace总是请求2次, 那是相当蛋疼, 需要干掉
		if (this.btLock === false) {
			this.btLock = true;
		}
		else {
			for (var i = 0; i < 5; i++) {
				if (this.btLock) {
					this.btLockDone.wait(1000);
				}
			}
		}
		/*+\NEW\czm\2021.05.27\调试慢，重复NEW，内存泄漏*/
		//this.dbg_stack = new Array();
		this.dbg_stack.splice(0);
		/*-\NEW\czm\2021.05.27\调试慢，重复NEW，内存泄漏*/
		this.current_messagearr = ["bt", "D/dbg [resp,stack,1,-1]"];
		queue.enqueue(this.current_messagearr);
		console.log("dbg bt入队成功");
		this.messageRequestManage();
		// 断点显示的不能删
		console.log("before bt wait");
		await this._stackDone.wait(5000);
		console.log("after bt wait");

		response.body = {
			stackFrames: this.dbg_stack,
			totalFrames: this.dbg_stack.length
		};
		this.sendResponse(response);

		this.btLock = false;
		this.btLockDone.notify();
	}

	protected scopesRequest(response: DebugProtocol.ScopesResponse, args: DebugProtocol.ScopesArguments): void {

		response.body = {
			scopes: [
				new Scope("Local", this._variableHandles.create("local"), false),
				/*+\NEW\czm\2021.05.21\VS code 插件开发 / vscode端需要支持table的展开显示*/
				new Scope("Global", this._variableHandles.create("global"), true)
				/*-\NEW\czm\2021.05.21\VS code 插件开发 / vscode端需要支持table的展开显示*/
			]
		};
		this.sendResponse(response);
	}

	//局部变量查询请求
	//dbg vars
	private fullvarsArray = new Array();  //存放所有变量，包含局部变量及全局变量
	private fullvarsDone = new Subject();
	protected async variablesRequest(response: DebugProtocol.VariablesResponse, args: DebugProtocol.VariablesArguments, request?: DebugProtocol.Request) {
		/*+\NEW\czm\2021.05.21\VS code 插件开发 / vscode端需要支持table的展开显示*/
		let dbgVariables: DebugProtocol.Variable[] = [];
		this.fullvarsArray = [];
		const id = this._variableHandles.get(args.variablesReference);
		/*+\NEW\czm\2021.05.21\VS code 插件开发 / vscode端开发全局变量的显示的功能*/
		console.log("variables  id= ", id);
		if (id === 'local' || id === 'global') {
			if (id === 'local') {
				// this.dbg_write_cmd("vars");
				this.current_messagearr = ["vars", "D/dbg [resp,vars,0]"];
				queue.enqueue(this.current_messagearr);
				// console.log("dbg vars 入队");
				this.messageRequestManage();
				await this._varsDone.wait(500);//接收到变量接收完成通知
				let exts: string = "";
				// this.localvarsArray = [];
				while (1) {
					exts = this.dbgVarsArray.shift();
					//console.log("variables 出栈",exts);
					if (typeof exts === "undefined") {
						break;
					}

					//console.log("exts:",exts);
					var items = JSON.parse(exts);


					if (items["type"] === "table") {
						dbgVariables.push({
							name: items["name"],
							type: items["type"],
							value: "Object",
							variablesReference: this._variableHandles.create(JSON.stringify(items["data"]))
						});//把接收到的变量信息放到数组
						this.fullvarsArray.push({
							name: items["name"],
							type: items["type"],
							value: "Object",
							variablesReference: this._variableHandles.create(JSON.stringify(items["data"]))
						});
					}
					else {
						dbgVariables.push({
							name: items["name"],
							type: items["type"],
							value: items["data"],
							variablesReference: 0
						});//把接收到的变量信息放到数组
						this.fullvarsArray.push({
							name: items["name"],
							type: items["type"],
							value: items["data"],
							variablesReference: 0
						});
					}
				}
			}
			else if (id === 'global') {
				// this.dbg_write_cmd("gvars");
				this.current_messagearr = ["gvars", "D/dbg [resp,gvars,0]"];
				queue.enqueue(this.current_messagearr);
				// console.log("dbg gvars 入队");
				this.messageRequestManage();
				await this._gvarsDone.wait(500);//接收到全局变量接收完成通知
				let exts: string = "";
				while (1) {
					exts = this.dbgGvarsArray.shift();
					//console.log("variables 出栈2",exts);
					if (typeof exts === "undefined") {
						break;
					}

					//console.log("exts:",exts);
					var items = JSON.parse(exts);


					if (items["type"] === "table") {
						dbgVariables.push({
							name: items["name"],
							type: items["type"],
							value: "Object",
							variablesReference: this._variableHandles.create(JSON.stringify(items["name"]))
						});//把接收到的变量信息放到数组
						this.fullvarsArray.push({
							name: items["name"],
							type: items["type"],
							value: "Object",
							variablesReference: this._variableHandles.create(JSON.stringify(items["name"]))
						});
					}
					else {
						dbgVariables.push({
							name: items["name"],
							type: items["type"],
							value: items["data"],
							variablesReference: 0
						});//把接收到的变量信息放到数组
						this.fullvarsArray.push({
							name: items["name"],
							type: items["type"],
							value: items["data"],
							variablesReference: 0
						});
					}
				}
			}
			/*-\NEW\czm\2021.05.21\VS code 插件开发 / vscode端开发全局变量的显示的功能*/
		}
		else if (id === "\"lvgl\"") {
			vscode.window.showErrorMessage("检测到LVGL表数据量过大，该表不做展开显示", { modal: true });
		}
		else if (id !== undefined) {
			if (id.indexOf(`{"Tables":[{"type":`) === 0) {
				// console.log("==++++++",id,typeof(id));
				var tables = JSON.parse(id)["Tables"];
				for (var i = 0; i < tables.length; i++) {
					var items: any = tables[i];
					// if (items.toString().indexOf(`{"Tables":[{"type":`)===0) {
					if (items["type"] === "table") {
						// var itemsNew =JSON.parse(items.toString())["data"];
						dbgVariables.push({
							name: items["name"],
							type: items["type"],
							value: "Object",
							variablesReference: this._variableHandles.create(JSON.stringify(items["data"]))
						});//把接收到的变量信息放到数组
						this.fullvarsArray.push({
							name: items["name"],
							type: items["type"],
							value: "Object",
							variablesReference: this._variableHandles.create(JSON.stringify(items["data"]))
						});
					}
					else {
						dbgVariables.push({
							name: items["name"],
							type: items["type"],
							value: items["data"],
							variablesReference: 0
						});//把接收到的变量信息放到数组
						this.fullvarsArray.push({
							name: items["name"],
							type: items["type"],
							value: items["data"],
							variablesReference: 0
						});
					}
				}
			}
			else {
				const jvars_data = id.replace(/"/g, ''); //特殊处理id内的双引号

				let jvars_data_arraytmp = jvars_data.split(" ");
				if (jvars_data_arraytmp.length > 15) {
					vscode.window.showErrorMessage("不支持查询超过15层以上的变量", { modal: true });
				}
				// let jvars_data_lastflag = jvars_data_arraytmp.pop();
				this.current_messagearr = ["jvars " + jvars_data, "D/dbg [resp,jvars,0]"];
				queue.enqueue(this.current_messagearr);
				// console.log("dbg vars 入队");
				this.messageRequestManage();
				await this._watchvarsDone.wait(500);//接收到变量接收完成通知
				let exts: string = "";
				while (1) {
					exts = this.dbgJvarsArray.shift();
					//console.log("variables 出栈",exts);
					if (typeof exts === "undefined") {
						break;
					}
					var table_name = JSON.parse(exts)['name'];
					var tables = JSON.parse(exts)['data']["Tables"];
					if (tables.length === 0) {
						continue;
					}
					for (var i = 0; i < tables.length; i++) {
						var items: any = tables[i];
						if (items["type"] === "table") {
							dbgVariables.push({
								name: items["name"],
								type: items["type"],
								value: "Object",
								variablesReference: this._variableHandles.create(jvars_data + " " + JSON.stringify(items["name"]))
							});//把接收到的变量信息放到数组
							this.fullvarsArray.push({
								name: items["name"],
								type: items["type"],
								value: "Object",
								variablesReference: this._variableHandles.create(table_name + " " + JSON.stringify(items["name"]))
							});
						}
						else {
							dbgVariables.push({
								name: items["name"],
								type: items["type"],
								value: items["data"],
								variablesReference: 0
							});//把接收到的变量信息放到数组
							this.fullvarsArray.push({
								name: items["name"],
								type: items["type"],
								value: items["data"],
								variablesReference: 0
							});
						}
					}
				}
			}
		}
		await this.fullvarsDone.notify();
		// 新增一个全局的多层显示
		response.body = {
			variables: dbgVariables
		};
		/*-\NEW\czm\2021.05.21\VS code 插件开发 / vscode端需要支持table的展开显示*/
		this.sendResponse(response);

	}

	//继续请求
	//F5继续运行，直到遇到之前设置的断点。
	//dbg continue
	protected async continueRequest(response: DebugProtocol.ContinueResponse, args: DebugProtocol.ContinueArguments) {
		// this.dbg_write_cmd("continue");
		this.current_messagearr = ["continue", "D/dbg [state,changed,3,2]"];
		queue.enqueue(this.current_messagearr);
		console.log("dbg continue 入队");
		this.messageRequestManage();
		await this._stateChanged.wait(1000);
		this.sendResponse(response);
	}


	//单步跳过请求
	//F10单步跳过遇到方法，一步执行完，无法看到方法的执行情况。
	//dbg next
	protected async nextRequest(response: DebugProtocol.NextResponse, args: DebugProtocol.NextArguments) {
		// this.dbg_write_cmd("next");
		this.current_messagearr = ["next", "D/dbg [state,changed,4,3]"];
		queue.enqueue(this.current_messagearr);
		console.log("dbg next 入队成功");
		this.messageRequestManage();
		await this._stateChanged.wait(1000);
		this.sendResponse(response);
	}
	//单步调试请求
	//F11单步调试，进入到方法内部，可以查看方法的具体执行情况。
	//dbg stepIn
	protected async stepInRequest(response: DebugProtocol.StepInResponse, args: DebugProtocol.StepInArguments) {
		// this.dbg_write_cmd("stepIn");
		this.current_messagearr = ["stepIn", "D/dbg [state,changed,5,3]"];
		queue.enqueue(this.current_messagearr);
		console.log("dbg stepin入队成功");
		this.messageRequestManage();
		await this._stateChanged.wait(1000);
		this.sendResponse(response);
	}

	//单步跳出请求
	//F12单步跳出，跳出当前执行的方法。
	//dbg stepOut
	protected async stepOutRequest(response: DebugProtocol.StepOutResponse, args: DebugProtocol.StepOutArguments) {
		this.current_messagearr = ["stepOut", "D/dbg [state,changed,6,3]"];
		queue.enqueue(this.current_messagearr);
		console.log("dbg stepout 入队成功");
		this.messageRequestManage();
		await this._stateChanged.wait(1000);
		this.sendResponse(response);
	}

	/*+\NEW\czm\2021.05.9\添加调试控制台>输入框发送at的功能*/
	//运算请求
	/**运行求值请求的上下文。
	“watch”：在监视中运行evaluate。
	“repl”：从调试控制台运行evaluate。 
	“hover”：从数据悬停运行evaluate。
	“clipboard”：运行evaluate生成将存储在剪贴板中的值。
	只有在“supportsClipboardContext”功能为true时，调试适配器才会使用该属性。
	等。
	*/
	protected async evaluateRequest(response: DebugProtocol.EvaluateResponse, args: DebugProtocol.EvaluateArguments, request: DebugProtocol.Request) {
		//调试控制台输入请求
		switch (args.context) {
			case 'repl':
				this.dbg_write_cmd("modem/sendat " + args.expression);
				this.sendResponse(response);
			default:
				while (true) {
					if (this.fullvarsArray.length === 0 && args.expression) {
						await this.fullvarsDone.wait(1000);
					}
					else {
						break;
					}
				}
				for (let i = 0; i < this.fullvarsArray.length; i++) {
					const element = this.fullvarsArray[i];
					if (element['name'] === args.expression) {
						response.body = {
							result: element['value'],
							type: element['type'],
							variablesReference: element['variablesReference']
						};
					}
					else {
						continue;
					}
					this.sendResponse(response);
				}
		}
	}
	/*-\NEW\czm\2021.05.9\添加调试控制台>输入框发送at的功能*/
}