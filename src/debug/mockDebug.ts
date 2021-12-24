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
import { Subject } from 'await-notify';
import * as Net from 'net';
/*+\NEW\czm\2021.05.8\调试控制台输出日志*/
import * as vscode from "vscode";
import * as fs from 'fs';
import * as path from 'path'; // 导入fs库和path库

// 获取当前时间戳，并解析后格式化输出
function formatConsoleDate (date) {
    var year = date.getFullYear();  // 获取完整的年份(4位,1970-????)
    var month = date.getMonth();    // 获取当前月份(0-11,0代表1月)
    var day = date.getDate();
    var hour = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    return year+
            '-' +(month+1)+
            '-' +day+
            '_' +
            ((hour < 10) ? '0' + hour: hour) +
            '-' +
            ((minutes < 10) ? '0' + minutes: minutes) +
            '-' +
            ((seconds < 10) ? '0' + seconds: seconds);
}
// 队列结构实现
let Queue = (function () {

    const items = new WeakMap();//WeakMap对象是密钥/值对的集合，其中密钥被弱引用。键必须是对象，值可以是任意值。

    class Queue {

        constructor () {
            items.set(this, []);
        }

        enqueue(...element) {//向队列尾部添加一个（或多个）新的项
            let q = items.get(this);
            q.push(...element);
        }

        dequeue() {//移除队列的第一个（排在队列最前面的）项，并返回被移除的元素。
            let q = items.get(this);
            let r = q.shift();
            return r;
        }

        front() {//返回队列中第一个元素——最先被添加，也将是最先被移除的元素。队列不做任何变动（不移除元素，只返回元素信息）
            let q = items.get(this);
            return q[0];
        }

        isEmpty(){//如果队列中不包含任何元素，返回true，否则返回false。
            return items.get(this).length === 0;
        }

        size(){//返回队列包含的元素个数，与数组的length属性类似。
            let q = items.get(this);
            return q.length;
        }

        clear(){//清空队列里面的元素。
            items.set(this, []);
        }

        print(){//打印队列为String到控制台
            console.log(this.toString());
        }

        toString(){//输出队列以String模式。
            return items.get(this).toString();
        }
    }
    return Queue;
})();

let queue = new Queue();//实例化队列
// 定义输出日志到输出
let _outputChannel = vscode.window.createOutputChannel("LuatIDE_log");

let configDataPath:any = process.env['APPDATA'];

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
	private dbg_jvarsArray = new Array();
	private dbg_varsArray = new Array();
	private dbg_gvarsArray = new Array();
	/*-\NEW\czm\2021.05.21\VS code 插件开发 / vscode端需要支持table的展开显示*/
	private _stackDone = new Subject();
	private _stateChanged = new Subject();
	private _socketReady = new Subject();
	private _socket_connect_ok = new Subject();
	private dbg_input_buffer = Buffer.from("");

	private bt_lock = true;
	private bt_lock_done = new Subject();

	private download_success = new Subject();
	protected _socket;
	
	private timesleep = new Subject();

	protected dbg_state: Number = 0;
	protected download_state: Number = 0;

	protected source_mapping = new Map();
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

	public runmodel: boolean = false;
	public current_messagearr:any;

	private dataReceiveFlag:number = 1;
	private current_logfilename:string = "";
	private configDataPath:any = process.env['APPDATA'];

	// 分发器
	public dbg_dispatcher(heads, exts) {

		var key = "dbg_" + heads[0] + "_" + heads[1];
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
	public dbg_luat_log(heads, exts) {
		vscode.debug.activeDebugConsole.appendLine(exts);
		_outputChannel.appendLine(exts);
		// 增加lua运行日志文件下载到本地活动工程目录
		fs.appendFile(this.activeWorkspace+"\\LuatIDE_log"+"\\"+this.current_logfilename,exts+"\r\n",()=>{});
	}
	/*-\NEW\czm\2021.05.8\调试控制台输出日志*/

	//---------------------------------------------------------------
	//                State 状态类
	public dbg_state_changed(heads) {
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
	public dbg_event_stopped(heads) {
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
		const userSourceList_tmp = fs.readdirSync(filePath);
		// 遍历读取到的文件列表
		for (let i = 0; i < userSourceList_tmp.length;i++) {
			// path.join得到当前文件的绝对路径
			const filepath = path.join(filePath, userSourceList_tmp[i]);
			// 根据文件路径获取文件信息
			const stats = fs.statSync(filepath);
			const isFile = stats.isFile(); // 是否为文件
			const isDir = stats.isDirectory(); // 是否为文件夹
			if (isFile) {
				if (userSourceList_tmp[i].lastIndexOf('.lua')!==-1) {
					console.log(filePath);
					this.userSourceList.push(userSourceList_tmp[i]);
					this.userSourceListPath.push(path.join(filePath, userSourceList_tmp[i]));
					console.log("当前文件：",userSourceList_tmp[i]);
				}
			}else if (isDir) {
				this.fileDisplay(filepath); // 递归，如果是文件夹，就继续遍历该文件夹里面的文件	
				console.log(userSourceList_tmp);
				
			}
		};
		console.log("处理后：",this.userSourceList);
		return this.userSourceList;
	}
// /*-\NEW\zhw\2021.07.12\修复调试模式部分文件无法加载源文件bug*/
	// /*-\NEW\zhw\2021.06.28\获取用户所选下载配置文件列表*/
	//-----------------------------------------------------------------
	// 读取配置文件路径

	private generate_project_filepath(){
		let configSource_fileList:string[]=[];
		let configSource_filepathList:string[]=[];
		const configFilePath:any = path.join(this.configDataPath,"LuatIDE","luatide_workspace.json");
		var configFileData = fs.readFileSync(configFilePath).toString();
		let configFileDataObj: any = JSON.parse(configFileData);
		const currentactiveWorkspace:any = configFileDataObj['active_workspace'];
		let json_Data_tmp = fs.readFileSync(path.join(currentactiveWorkspace,"luatide_project.json")).toString();
		let json_Data = JSON.parse(json_Data_tmp);
		let project_fileslist = json_Data['app_file'];
		for (let index = 0; index < project_fileslist.length; index++) {
			const project_absolute_file = project_fileslist[index];
			const project_file = path.basename(project_absolute_file);
			if (fs.statSync(project_absolute_file).isFile()) {
				configSource_fileList.push(project_file);
				configSource_filepathList.push(project_absolute_file);
			}
		}
		const temp = [configSource_fileList,configSource_filepathList];
		return temp;
	}
	//打印指定深度或打印全部堆栈信息。
	private dbg_stack: DebugProtocol.StackFrame[] = new Array();
	public dbg_resp_stack(heads, exts: String) {
		const level = parseInt(heads[3]);
		if (level === -1) {
			this._stackDone.notify();
		}
		else {
			var fullname = exts.trim();
			let tmp = fullname.split(":");
			// 跳转路径修改
			let currentconfigSource_fileList:any = [];
			let configSource_filepathList:any=this.generate_project_filepath()[1];
			currentconfigSource_fileList = this.generate_project_filepath()[0];
			let source_name:string = "";
			if(tmp[0].indexOf("/lua/") !== -1)
			{
				source_name = tmp[0].substring(4 + 1,);
			}
			else
			{
				source_name = tmp[0].substring(1,);
			}
			let source: string = "";
			// /*+\NEW\zhw\2021.06.28\多级文件跳转逻辑适配性修改*/
			
			if (currentconfigSource_fileList.indexOf(source_name) !== -1) {
				console.log("当前",currentconfigSource_fileList);
				for(let i =0;i<currentconfigSource_fileList.length;i++){
					if (configSource_filepathList[i].indexOf(source_name) !== -1) {
						source = configSource_filepathList[i];
						break;
					}
				}
			}
			else {	
				source = path.join(__dirname, "../..", "lib_merge_temp",source_name);
			}
			// /*-\NEW\zhw\2021.06.28\多级文件跳转逻辑适配性修改*/
			// const line = parseInt(tmp[1])
			let line: number;
			if (source_name === "main.lua") {
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
			const src = new Source(source_name);
			/*-\NEW\czm\2021.05.27\添加断点获取到的文件名有问题*/
			src.path = this.source_mapping.get(source) || source;
			//logger.verbose("" + source + " => " + src.path)
			const frame = new StackFrame(level, fullname, src, line);
			this.dbg_stack.push(frame);

		}
	}

	//------------------------------------------------------------------
	//-----------------------------------------------------------------
	//打印变量信息
	public dbg_resp_vars(heads, exts: String) {
		const index = parseInt(heads[2]);
		if (index === 0) {
			//局部变量全部打印完毕了
			this._varsDone.notify();//通知dbg vars变量接收完成
		}
		// 补丁：过滤模块上报空json文件干扰
		else if (index !== 5) {
			this.dbg_varsArray.push(exts);
			// console.log("dbg_vars");
		}
	}
	public dbg_resp_gvars(heads, exts: String) {
		const index = parseInt(heads[2]);
		if (index === 0) {
			//全局变量全部打印完毕了
			this._gvarsDone.notify();//通知dbg vars变量接收完成
		}
		else {
			this.dbg_gvarsArray.push(exts);
		}
	}
	public dbg_resp_jvars(heads,exts:string){
		const index = parseInt(heads[2]);
		if (index === 0) {
			//变量全部打印完毕了
			console.log("当前的exts是",exts);
			this._watchvarsDone.notify();//通知dbg vars变量接收完成
		}
		else {
			this.dbg_jvarsArray.push(exts);
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
	private timer1:any = undefined;
	public  messageRequestManage() {
		// 判断队列是否有元素
		if (this.timer1 === undefined) {
			if(!queue.isEmpty()){
				console.log("当前的dataReceiveFlag：",this.dataReceiveFlag);
				this.timer1 = setInterval(this.commandprint1,5,this);
		}

		// 判断定时器是否激活
		// 如果未激活就启动定时器
		// 如果激活就只入队命令到队
	}
	}

	// 命令队列出队;
	public  commandprint1(arg){

		if (arg.dataReceiveFlag === 1) {

			if (queue.isEmpty()) {
				clearInterval(arg.timer1);
				arg.timer1 = undefined;
				return;
			}
			console.log("当前队列第一条数据",queue.front()[0]);
			// 接收消息队列出队数据
			const requestDataArr:string[] = queue.front();
			const requestData = requestDataArr[0];
			arg.requestMessage = requestDataArr[1];
			console.log("当前出队数据：",requestData);
			arg.dbg_write_cmd(requestData);
			console.log("队列发送数据成功",requestData);
			arg.dataReceiveFlag = 0;
		}
	}

	/*-\NEW\czm\2021.05.21\VS code 插件开发 / vscode端需要支持table的展开显示*/
	public module_model_flag = undefined;
	public bindSocket(socket: Net.Socket) {
		socket.on('end', () => {
			console.log('>> client connection closed\n');
			this._socket = null;
		});
		//vscode接收来自python服务器数据
		socket.on('data', async (data: Buffer) => {
			if (this.dbg_input_buffer.length > 0) {
				this.dbg_input_buffer = Buffer.concat([this.dbg_input_buffer, data]);
			}
			else {
				this.dbg_input_buffer = data;
			}
			
			/*+\NEW\czm\2021.05.21\VS code 插件开发 / vscode端需要支持table的展开显示*/
			while (true) {
				let msg: any;
				let msglen: number = 0;
				if (this.varsDataRecvStartFlag === false) {
					var offset = this.dbg_input_buffer.indexOf('\n');
					if (offset > - 1) {
						msglen = offset + 1;
						msg = this.dbg_input_buffer.subarray(0, msglen).toString("utf-8");
						console.log(msg,"数据接收成功:",msg);

						if (!queue.isEmpty()) {
							if (this.module_model_flag!==undefined){
								if (msg.indexOf(queue.front()[1])!==-1 && queue.front()[1]!=="" ) {
									this.dataReceiveFlag = 1;
									console.log("当前回传确认数据是",queue.front()[1],"当前接收数据是：",msg);
									// // at交互数据发送到console终端
									// if(msg.indexOf(queue.front()[0])!==-1){
									// 	vscode.debug.activeDebugConsole.appendLine(msg);
									// }
									queue.dequeue();
									// await this.dataReceive.notify();
								}
							}
							// 补丁：3103版本固件回传的有问题
							else if(msg.indexOf("D/dbg [resp,wvars,0]")!==-1){
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

						msg = this.dbg_input_buffer.subarray(0, msglen);
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
				this.dbg_input_buffer = this.dbg_input_buffer.slice(msglen);
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

	//增加调试前执行下载操作
	private json_Data: any;
	    // 遍历pac所在文件夹，确定当前pac包版本
	private async  search_current_coreversion(dir,reg,coreExtname) {
			const files =fs.readdirSync(dir);
			let current_version:any=undefined;
			let current_version_array:any
			let final_file:any;
			await files.forEach(  (file, index) => {
				const extname =path.extname(file);
				if (extname === coreExtname) {
					current_version_array = reg.exec(file);
					reg.lastIndex = 0;      //reg.exec()正则表达式全局匹配，需要使用该lastIndex属性重置索引（最后一个匹配的位置）。
					if (current_version_array!==null && current_version===undefined) {
						current_version=current_version_array[1];
						final_file=file;
					}       
					else if (current_version_array!==null && current_version_array[1]>current_version) {
						current_version = current_version_array[1];
						final_file = file;
					}
				}
				else{
					console.log("非core文件");
				}
			});
			return final_file;
		}
	public async downpath_send() {
		this.download_state = 0;
		// 获取用户工作区路径
		if (vscode.workspace) {
			// 用户当前点击文件获取。
			/*+\NEW\zhw\2021.05.25\用户工作空间路径从插件配置文件里读取*/
			const user_path_data = "work_path " + this.activeWorkspace;
			this.dbg_write_cmd(user_path_data);
			// 插件所在路径获取
			const plug_path:string = path.join(__dirname,"../..");
			const plug_path_data: any = "plug_path " + plug_path;
			await this.sleep(100);
			this.dbg_write_cmd(plug_path_data);
			// 用户自定义lib库所在文件路径获取。
			//通过从配置文件读取插件路径
			let json_Data_tmp = fs.readFileSync(path.join(this.activeWorkspace,"luatide_project.json")).toString();
			this.json_Data = JSON.parse(json_Data_tmp);
			const user_lib_path = this.json_Data['lib_path'];
			/*+\NEW\zhw\2021.05.25\用户工作空间路径从插件配置文件里读取*/
			const lib_path_data: any = "ulib_path " + user_lib_path;
			await this.sleep(100);
			this.dbg_write_cmd(lib_path_data);
			const module_model = this.json_Data['module_model'];
			this.module_model_flag = module_model;
			// 修复模块不显示时默认使用Air72XUX/Air82XUX模块型号
			if (module_model === undefined) {
				this.json_Data['module_model'] = "Air72XUX/Air82XUX";
				const fileData = JSON.stringify(this.json_Data,null,"\t");
				fs.writeFileSync(this.activeWorkspace,"luatide_project.json", fileData);
			}
			// 模块型号如果是air101，检查pac后缀是不是soc

			const module_model_data: any = "module_model " + module_model;
			this.dbg_write_cmd(module_model_data);
			// 用户自定义pac所在文件路径获取
			let user_pac_path = this.json_Data['corefile_path'];

			if (module_model==="Air72XUX/Air82XUX" && user_pac_path === "") {
				let temp_72xdir:any = path.join(configDataPath,"LuatIDE","LuatideCore","Air72X_CORE");
				let reg = /LuatOS-\w{3}_V(\d+)_RDA8910/gi;
				let user_pac_name = await this.search_current_coreversion(temp_72xdir,reg,".pac");
				user_pac_path = temp_72xdir+"\\"+user_pac_name;

			}
			else if(module_model==="Air10X" && user_pac_path === ""){
				let temp_10xdir:any = path.join(configDataPath,"LuatIDE","LuatideCore","Air10X_CORE");
				let reg = /LuatOS-SoC_V(\d+)_AIR101/ig;
				let user_pac_name = await this.search_current_coreversion(temp_10xdir,reg,".soc");
				user_pac_path = temp_10xdir+"\\"+user_pac_name;
			}
			/*+\NEW\czm\2021.09.29\支持模拟器​*/
			else if(module_model==="Simulator" && user_pac_path === ""){
				const files =fs.readdirSync(path.join(configDataPath,"LuatIDE","LuatideCore","Air72X_CORE"));
				files.forEach(function (file, index) {
				  const extname =path.extname(file);
				  if (extname === ".pac") {
					user_pac_path = path.join(configDataPath,"LuatIDE","LuatideCore","Air72X_CORE",file);
				  }   
				});
			}
			/*-\NEW\czm\2021.09.29\支持模拟器​*/
			if((module_model==="Air10X" && path.extname(user_pac_path)!==".soc") || (module_model==="Air72XUX/Air82XUX" && path.extname(user_pac_path)!==".pac")){
				vscode.window.showErrorMessage("您选择的固件版本与模块型号不匹配，请重新选择",{modal:true});
				require('child_process').exec('taskkill -f -im LuatideService.exe');
				return;				
			}

			const pac_path_data: any = "upac_path " + user_pac_path;
			await this.sleep(100);
			this.dbg_write_cmd(pac_path_data);

			await this.sleep(100);

			this.dbg_write_cmd("LuatIDE_Down/LoAd");
			return true;
		}
	}

	//原有命令写入python服务器逻辑，有修改
	public  dbg_write_cmd(data: String) {
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
			this._socket.write(line, (err) => {
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
		// 执行前先杀掉服务器可能残留的exe进程
		console.log("initializeRequest");
		require('child_process').exec('taskkill -f -im LuatideService.exe');
		// kill活动终端
		vscode.commands.executeCommand("workbench.action.terminal.kill");
		/*+\NEW\zhw\2021.05.28\解决重启无法实现*/

		// 打开调试模式显示到用户工作台
		const path_exe_new = path.join(__dirname, "../..", "luatide_server","build","ide_service.exe");
		/*-\NEW\zhw\2021.05.27\日志由控制台输出到文件*/
		console.log(path_exe_new);

		const isCmd = /cmd.exe$/i.test(vscode.env.shell);
		const invokePrefix = isCmd ? '' : '& ';
		const cmdPrefixSuffix = isCmd ? '"' : '';
		let commandLine = invokePrefix + "'"+path_exe_new+"'";
		/*+\NEW\zhw\2021.05.27\shell改为powershell,解决不能写日志到文件代码*/
		const task = new vscode.Task({ type: 'luatide-task' }, vscode.TaskScope.Global, "LuatIDE Debug", 'Service');
		/*-\NEW\zhw\2021.05.27\shell改为powershell,解决不能写日志到文件代码*/
		task.execution = new vscode.ShellExecution(cmdPrefixSuffix + commandLine + cmdPrefixSuffix);
		/*+\NEW\zhw\2021.05.27\日志由控制台输出到文件*/
		task.isBackground = false; //true 隐藏日志
		/*-\NEW\zhw\2021.05.27\日志由控制台输出到文件*/

		task.presentationOptions = {
			echo: false,
			focus: false,
			clear: true,
			showReuseMessage: true
		};

		vscode.tasks.executeTask(task);
		// 写入lua运行日志到用户工程下的log文件夹
		if (!fs.existsSync(this.activeWorkspace+"\\LuatIDE_log")) {
			fs.mkdirSync(this.activeWorkspace+"\\LuatIDE_log");
		}
		this.current_logfilename = formatConsoleDate(new Date())+"_log.txt";
		// execFile(path_exe_new);
		// 清空历史输出的数据
		_outputChannel.clear();
		// 设置输出展示，默认值为false，不会显示焦点
		_outputChannel.show(false);
		// 每次调试前清空队列数据
		queue.clear();
		this.fullvarsArray = [];
		//监听21331端口，准备tcp连接。
		let socketstat: number = 0;
		while (true) {		
			const socket = Net.createConnection(21331, '127.0.0.1', () => {
				socketstat = 1;
				this._socket_connect_ok.notify();
			});
			socket.on('error', function(err) {
				socket.destroy();
				socketstat = 0;
			});
			socket.on('close',function () {
				socket.destroy();
				socketstat=0;	
			});
			await this.timesleep.wait(300);
			if (socketstat === 0) {
				continue;
			}
			else {
				this.bindSocket(socket);
				break;
			}
		}
		const flag:any = await this.downpath_send();
		if (flag===false) {
			// 强行终止调试器
			vscode.debug.stopDebugging();
			return; 
		}
		// 等待下载完成状态
		for (var i = 0; i < 60 * 3; i++) {
			if (this.download_state === 0) {
				await this.download_success.wait(300);
			} else {
				break;
			}
		}
		/*+\NEW\zhw\2021.06.11\修改用户概率性不能进断点bug*/
		console.log("等待waiting for debugger");
		for (var i = 0; i < 60 * 3; i++) {
			if (this.dbg_state === 1) {
				console.log("waiting for debugger ok");
				break;
			} else {
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

		
		this.current_messagearr = ["start","D/dbg [state,changed,"];
		queue.enqueue(this.current_messagearr);
		console.log("dbg start入队成功");
		this.messageRequestManage();

		this.sendResponse(response);
	}

	//设置断点请求（清除也在里面）
	//dbg break clr
	//dbg break add
	protected async setBreakPointsRequest(response: DebugProtocol.SetBreakpointsResponse, args: DebugProtocol.SetBreakpointsArguments) {
		/*+\NEW\zhw\2021.06.1\运行模式标志位*/
		console.log("运行模式是否开启：", this.runmodel);
		if (this.runmodel === true) {
			return;
		}
		/*-\NEW\zhw\2021.06.1\运行模式标志位*/
		//资源文件路径不在用户当前选择路径下，则过滤这些断点
		/*+\NEW\czm\2021.05.26\进入调试时未删除激活工程以外的断点*/
		var points: DebugProtocol.Breakpoint[] = [];
		if (args.source.path) {
			const pathIndex = args.source.path.lastIndexOf("\\");
			let path: string = args.source.path.substring(0, pathIndex);
			// 修改不能跳转到其它地方问题,解析json
			const project_filelist_temp =  this.generate_project_filepath()[1];
			// 遍历json文件
			let temp_flag = false;
			for (let i = 0; i < project_filelist_temp.length; i++) {
				const element = project_filelist_temp[i];
				// console.log("===============",element,path,element.indexOf(path));
				// 排除字符串大小写问题干扰，统一处理
				if (element.toLocaleLowerCase().indexOf(path.toLocaleLowerCase())!== -1) {
					temp_flag = true;
					break;
				}
				else{
					temp_flag = false;
				}
			}
			if (temp_flag===false) {
				this.sendResponse(response);
				return;
			}

			/*-\NEW\czm\2021.05.26\进入调试时未删除激活工程以外的断点*/
			// this.dbg_write_cmd("break clr " + args.source.name);
			this.current_messagearr = ["break clr " + args.source.name,"D/dbg [resp,break,clear,ok]"];
			// this.first_messageflag  = true;
			queue.enqueue(this.current_messagearr);
			this.messageRequestManage();
			console.log("break clr 入队成功");

			var srcname = args.source.name;
			this.source_mapping.set(srcname, args.source.path);
			if (args.breakpoints) {
				for (var i = 0; i < args.breakpoints.length; i++) {
					var point = args.breakpoints[i];

					/*+\NEW\zhw\2021.05.26\dbg.wait()main.lua中的代码下载行数加1*/
					if (args.source.name) {
						if (args.source.name.indexOf("main.lua") !== -1) {
							this.current_messagearr = ["break add " + args.source.name + " " + (Number(point.line)+1).toString(),`D/dbg [resp,break,add,ok] ${args.source.name}:${Number(point.line)+1}`];
							queue.enqueue(this.current_messagearr);
							console.log("dbg add 入队成功",point.line+1);
							this.messageRequestManage();
						}
						else {
							this.current_messagearr = ["break add " + args.source.name + " " + point.line,`D/dbg [resp,break,add,ok] ${args.source.name}:${Number(point.line)}`];
							queue.enqueue(this.current_messagearr);
							console.log("dbg add 入队成功",point.line);
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
		this.timer1=undefined;
		clearInterval(this.timer1);
		/*+\NEW\czm\2021.05.27\终端在调试模式结束按停止按钮后有时不能正常关闭*/
		let child_process = require('child_process');
		child_process.exec('taskkill -f -im LuatideService.exe');
		if (this.json_Data['module_model'] === "Simulator")
		{
			child_process.exec('taskkill -f -im LuatOS-Air_SIMULATOR.exe');
			child_process.exec('taskkill -f -im lcd_plugin.exe');
		}
		console.log("执行了断开连接的请求");
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
				if (this.bt_lock === false) {
					this.bt_lock = true;
				}
				else {
					for (var i = 0; i < 5; i++) {
						if (this.bt_lock) {
							this.bt_lock_done.wait(1000);
						}
					}
				}
				/*+\NEW\czm\2021.05.27\调试慢，重复NEW，内存泄漏*/
				//this.dbg_stack = new Array();
				this.dbg_stack.splice(0);
				/*-\NEW\czm\2021.05.27\调试慢，重复NEW，内存泄漏*/
				this.current_messagearr = ["bt","D/dbg [resp,stack,1,-1]"];
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

				this.bt_lock = false;
				this.bt_lock_done.notify();
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
		this.fullvarsArray=[];
		const id = this._variableHandles.get(args.variablesReference);
		/*+\NEW\czm\2021.05.21\VS code 插件开发 / vscode端开发全局变量的显示的功能*/
		console.log("variables  id= ", id);
		if (id === 'local' || id === 'global') {
			if (id === 'local') {
				// this.dbg_write_cmd("vars");
				this.current_messagearr = ["vars","D/dbg [resp,vars,0]"];
				queue.enqueue(this.current_messagearr);
				// console.log("dbg vars 入队");
				this.messageRequestManage();
				await this._varsDone.wait(500);//接收到变量接收完成通知
				let exts: string = "";
				// this.localvarsArray = [];
				while (1) {
					exts = this.dbg_varsArray.shift();
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
				this.current_messagearr = ["gvars","D/dbg [resp,gvars,0]"];
				queue.enqueue(this.current_messagearr);
				// console.log("dbg gvars 入队");
				this.messageRequestManage();
				await this._gvarsDone.wait(500);//接收到全局变量接收完成通知
				let exts: string = "";
				while (1) {
					exts = this.dbg_gvarsArray.shift();
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
		else if(id==="\"lvgl\""){
			vscode.window.showErrorMessage("检测到LVGL表数据量过大，该表不做展开显示",{modal:true});
		}
		else if(id!==undefined){
			if(id.indexOf(`{"Tables":[{"type":`)===0){
				// console.log("==++++++",id,typeof(id));
				var tables = JSON.parse(id)["Tables"];
				for (var i = 0; i < tables.length; i++) {
					var items:any = tables[i];
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
			else{
				const jvars_data = id.replace(/"/g,''); //特殊处理id内的双引号
				
				let jvars_data_arraytmp = jvars_data.split(" ");
				if (jvars_data_arraytmp.length>15) {
					vscode.window.showErrorMessage("不支持查询超过15层以上的变量",{modal:true});
				}
				// let jvars_data_lastflag = jvars_data_arraytmp.pop();
				this.current_messagearr = ["jvars "+jvars_data,"D/dbg [resp,jvars,0]"];
				queue.enqueue(this.current_messagearr);
				// console.log("dbg vars 入队");
				this.messageRequestManage();
				await this._watchvarsDone.wait(500);//接收到变量接收完成通知
				let exts: string = "";
				while (1) {
					exts = this.dbg_jvarsArray.shift();
					//console.log("variables 出栈",exts);
					if (typeof exts === "undefined") {
						break;
					}				
					var table_name =JSON.parse(exts)['name'];
					var tables = JSON.parse(exts)['data']["Tables"];
					if (tables===[]) {
						continue;
					}
					for (var i = 0; i < tables.length; i++) {
						var items:any = tables[i];
						if (items["type"] === "table") {
							dbgVariables.push({
								name: items["name"],
								type: items["type"],
								value: "Object",
								variablesReference: this._variableHandles.create(jvars_data+" "+JSON.stringify(items["name"]))
							});//把接收到的变量信息放到数组
							this.fullvarsArray.push({
								name: items["name"],
								type: items["type"],
								value: "Object",
								variablesReference: this._variableHandles.create(table_name+" "+JSON.stringify(items["name"]))
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
		this.current_messagearr = ["continue","D/dbg [state,changed,3,2]"];
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
		this.current_messagearr = ["next","D/dbg [state,changed,4,3]"];
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
		this.current_messagearr = ["stepIn","D/dbg [state,changed,5,3]"];
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
		this.current_messagearr = ["stepOut","D/dbg [state,changed,6,3]"];
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
				if (this.fullvarsArray.length===0 && args.expression) {
					await this.fullvarsDone.wait(1000);
				}
				else{
					break;
				}
			}
			for (let i = 0; i < this.fullvarsArray.length; i++) {
				const element = this.fullvarsArray[i];
				if (element['name'] === args.expression) {
					response.body = {
						result: element['value'],
						type: element['type'],
						variablesReference:element['variablesReference']
					};
				}
				else{
					continue;
				}	
				this.sendResponse(response);
			}
		}
	}
	/*-\NEW\czm\2021.05.9\添加调试控制台>输入框发送at的功能*/
}