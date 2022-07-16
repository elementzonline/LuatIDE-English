/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

'use strict';
import * as vscode from 'vscode';
import { PluginConfigInit } from './config';
import { ProjectActiveHandle, ProjectDeleteHandle, ProjectSoruceFileDelete, exportProducFile } from './project/ProjectHandle';
import { activateMockDebug } from './debug/activateMockDebug';
import { HistoryProjectDataProvider, HistoryProjectTreeItem } from './project/projectTreeView';
import * as path from 'path';
import { HomeManage } from './webview/homeWebview';
import { ActivityTreeDataProvider, ActivityTreeItem } from './project/activityProjectTreeView';
import { OpenProject } from './project/openProject';
import * as fs from 'fs';
import { UiDesign } from './webview/uiDesignWebview';
// import { checkSourceUpdate } from './serverSourceUpdate';
import * as dataReport from './feedback/dataReport';
import { LuaFormatProvider, LuaRangeFormatProvider } from './editor/codeFormatting';
import { getCurrentPluginConfigActivityProject, pluginConfigCompatible} from './plugConfigParse';
import { clientOperation } from './LSP/client/client';
// import { CheckFiles, StateMachine } from './project/checkFile';
import * as checkFile from './project/checkFile';
import { getFileForDirRecursion } from './project/projectApi';
import { projectConfigOperation } from './project/activeProjectOperation';
import { debugProject, runProject } from './debug/debugHandler';
import { getactiveProjectConfigDesc, getApiDesc, getDistinguishMark, getHardwareDesc, getProductionFileDesc, getUiDesignDesc,getSimulatorDesc, getLcdDriverDesc, getTpDriverDesc, tpDriverSettingHandler, lcdDriverSettingHandler, portSelectSettingHandler, hardwareSettingHandler, apiSettingHandler, getDownloadCoreDesc, downloadCoreSettingHandler } from './project/activityProjectConfig';
import { ToolsHubTreeDataProvider } from './project/toolsHubTreeView';
import { SerialPortMonitor } from './webview/serialPortMonitorWebview';
import { setProjectConfigSimulatorReverse } from './project/projectConfigParse';
import { SourceManage } from './webview/sourceManage';
// 定义保存到到缓冲区的活动工程每次加载路径
export let activityMemoryProjectPathBuffer: any = JSON.parse(JSON.stringify({
	'activityMemoryProjectPath': ''
}));

/* 文件检测 */
// const checkFile = new CheckFiles();
// const stateMachine = new StateMachine();
let temContext: vscode.ExtensionContext;
let timeId: any;
let oldFd: any = undefined;
let curFd: any = undefined;
async function checkFloderControlUpdate(){
	let aP = getCurrentPluginConfigActivityProject();
	if (aP !== undefined && aP !== "") {
		curFd = getFileForDirRecursion(aP, "");
		oldFd = await checkFile.getOriginalFiles(aP);
		let diff = curFd.filter(function(v: any){ return oldFd.indexOf(v) === -1; });
		let del = oldFd.filter(function(v: any){ return curFd.indexOf(v) === -1; });
		if (diff.length > 0){
			clearInterval(timeId);
			let files = {
				"all":curFd,
				"new":diff,
			};
			// 下载配置界面显示
			const ret = await checkFile.downloadConfigDisplay(temContext, files, false);
			if (ret){
				timeId = setInterval(checkFloderControlUpdate, 1000);
			}
		}
		if (del.length > 0){
			clearInterval(timeId);
			const ret = await checkFile.delFiles(del);
			if (ret){
				oldFd = curFd;
				timeId = setInterval(checkFloderControlUpdate, 1000);
			}
		}
	}
}

let pluginConfigInit = new PluginConfigInit();
let projectActiveHandle = new ProjectActiveHandle();
let projectDeleteHandle = new ProjectDeleteHandle();
let openProject = new OpenProject();
let homeManage = new HomeManage();
let serialPortMonitor =  new SerialPortMonitor();
let historyProjectTreeDataProvider = new HistoryProjectDataProvider();
let activityProjectTreeDataProvider = new ActivityTreeDataProvider();
let toolsHubTreeDataProvider = new ToolsHubTreeDataProvider();
let projectSoruceFileDelete = new ProjectSoruceFileDelete();
let uiDesign = new UiDesign();
const sourceManage = new SourceManage();
const selectors: { language: string; scheme: string }[] = [
	{ language: 'lua', scheme: 'file' },
	{ language: 'lua', scheme: 'untitled' },
];
/*
 * The compile time flag 'runMode' controls how the debug adapter is run.
 * Please note: the test suite only supports 'external' mode.
 */
const runMode: 'external' | 'server' | 'inline' = 'inline';

/** 这个方法当插件被激活时调用*/
export function activate(context: vscode.ExtensionContext) {
	// 插件配置实例化
	pluginConfigInit.configInit();
	pluginConfigInit.refreshPlugDependentResourceConfig();
	// 插件配置文件兼容执行
	pluginConfigCompatible();
	// 检查依赖资源更新
	// checkSourceUpdate();
	// 活动工程文件夹定时检测
	temContext = context;
	timeId = setInterval(checkFloderControlUpdate, 1000);
	// 代码格式化相关功能入口
	vscode.languages.registerDocumentFormattingEditProvider(selectors, new LuaFormatProvider(context));
	vscode.languages.registerDocumentRangeFormattingEditProvider(selectors, new LuaRangeFormatProvider(context));
	const activityProject: string = getCurrentPluginConfigActivityProject();
	activityMemoryProjectPathBuffer.activityMemoryProjectPath = activityProject;
	// 注册新建工程命令,当点击用户历史工程标题区域新建工程按钮时触发
	context.subscriptions.push(vscode.commands.registerCommand('luatide-history-project.createProject', async () => homeManage.homeManage(context, 'loadNewProjectModelBox')));
	// 注册打开工程命令,当点击用户历史工程标题区域打开工程按钮时触发
	context.subscriptions.push(vscode.commands.registerCommand('luatide-history-project.openProject', async () => openProject.openProject(context, homeManage)));
	// 注册运行工程命令,当点击活动工程标题区域运行工程按钮时触发
	context.subscriptions.push(vscode.commands.registerCommand('luatide-activity-project.runProject', runProject));
	// 注册调试工程命令,当点击活动工程标题区域调试工程按钮时触发
	context.subscriptions.push(vscode.commands.registerCommand('luatide-activity-project.debugProject', debugProject));
	// 激活插件debug
	activateMockDebug(context, runMode);
	// 注册删除工程命令,当点击历史工程内部区域删除工程按钮时触发
	context.subscriptions.push(vscode.commands.registerCommand('luatide-history-project.deleteProject', async (filePath: HistoryProjectTreeItem) => projectDeleteHandle.deleteProject(filePath)));
	// 注册激活工程命令,当点击历史工程内部区域激活工程按钮时触发
	context.subscriptions.push(vscode.commands.registerCommand('luatide-history-project.Project.active', async (filePath) => projectActiveHandle.projectActive(filePath)));
	// 注册获取活动工程的命令
	context.subscriptions.push(vscode.commands.registerCommand('luatide-activity-project.activityProjectGet', (config) => {
		let path: string = activityMemoryProjectPathBuffer.activityMemoryProjectPath;
		return path;
	}));
	// 注册删除工程文件命令,当点击活动工程内部区域删除工程文件夹或文件按钮时触发
	context.subscriptions.push(vscode.commands.registerCommand('luatide-activity-project.sourceFile.delete', async (filePath: ActivityTreeItem) => projectSoruceFileDelete.projectSourceFileDelete(filePath)));
	// 注册删除活动工程命令，当点击活动工程右侧删除按钮时触发
	context.subscriptions.push(vscode.commands.registerCommand('luatide-activity-project.Project.delete', async () => projectSoruceFileDelete.deleteActivityProject()));
	// 注册点击home主页命令,当点击历史工程标题区域主页按钮时触发
	context.subscriptions.push(vscode.commands.registerCommand('luatide-history-project.Home', async () => homeManage.homeManage(context)));
	// 注册点击活动工程配置命令,当点击配置活动工程时触发
	context.subscriptions.push(vscode.commands.registerCommand('luatide-activity-project.configOperation', async () => projectConfigOperation(context)));
	// 注册活动工程文件点击命令，当点击活动工程文件或其它配置时触发
	context.subscriptions.push(vscode.commands.registerCommand('luatide-activity-project.click', (label, filePath) => {
		const selectPath = path.join(filePath, label);
		switch(selectPath){
			case getactiveProjectConfigDesc():
				projectConfigOperation(context);
				break;
			case getProductionFileDesc():
				exportProducFile();
				break;
			case getUiDesignDesc():
				uiDesign.uiDesign(context);
				break;
			case getSimulatorDesc():
				setProjectConfigSimulatorReverse();
				activityProjectTreeDataProvider.refresh();
				break;
			case getDistinguishMark()+"\\"+getHardwareDesc():
				// 硬件原理图逻辑
				hardwareSettingHandler();
				break;
			case getDistinguishMark()+"\\"+getApiDesc():
				// api描述逻辑
				apiSettingHandler();
				break;
			case  getDistinguishMark()+"\\"+getDownloadCoreDesc():
				downloadCoreSettingHandler();
				break;
			case getLcdDriverDesc():
				// lcd驱动相关操作
				lcdDriverSettingHandler();
				break;
			case getTpDriverDesc():
				tpDriverSettingHandler();
				break;
			default:
				if(selectPath.startsWith(getDistinguishMark()+"\\通讯口:")){
					// 端口号选择相关操作
					portSelectSettingHandler();
				}
				else if (fs.statSync(selectPath).isFile()) {
					vscode.commands.executeCommand('vscode.open', vscode.Uri.file(selectPath));
				}
				break;
		}
	}));
	// 注册工具集合点击命令，当点击工具集合内工具项时触发
	context.subscriptions.push(vscode.commands.registerCommand('luatide-tools-hub.click',(lable)=>{
		switch (lable) {
			case '串口监视器':
				// 打开串口监视器webview
				serialPortMonitor.serialPortMonitor(context);
				break;
			case '下载资源管理':
				sourceManage.sourceManage(context);
				break;
			default:
				break;
		}
	}));
	// 注册用户历史工程TreeView
	vscode.window.registerTreeDataProvider('luatide-history-project', historyProjectTreeDataProvider);
	// 注册用户活动工程TreeView
	vscode.window.registerTreeDataProvider('luatide-activity-project', activityProjectTreeDataProvider);
	// 注册用户工具集合TreeView
	vscode.window.registerTreeDataProvider('luatide-tools-hub',toolsHubTreeDataProvider);
	// 注册用户工程刷新命令，当执行该命令自动刷新用户工程
	context.subscriptions.push(vscode.commands.registerCommand('luatide-history-project.Project.refresh', async (filePath: HistoryProjectTreeItem) => historyProjectTreeDataProvider.refresh()));
	// 注册活动工程刷新命令，当执行该命令自动刷新活动工程
	context.subscriptions.push(vscode.commands.registerCommand('luatide-activity-project.Project.refresh', async (filePath: ActivityTreeItem) => activityProjectTreeDataProvider.refresh()));
	// 注册UI设计器命令,当点击活动工程菜单栏UI设计器时生效
	context.subscriptions.push(vscode.commands.registerCommand('luatide-ui.design', async () => uiDesign.uiDesign(context)));
	// 注册导出量产文件命令,当点击活动工程菜单栏导出量产文件时生效
	context.subscriptions.push(vscode.commands.registerCommand('luatide-activity-project.exportProducFile', async () => exportProducFile()));
	// 注册快速上手命令，点击后打开doc使用说明文档
	context.subscriptions.push(vscode.commands.registerCommand('luatide.quickstart', async () => {
		vscode.env.openExternal(vscode.Uri.parse('https://doc.openluat.com/wiki/21?wiki_page_id=2964'));
	}));
	// 注册技术支持命令，点击后打开luatide用户支持群链接
	context.subscriptions.push(vscode.commands.registerCommand('luatide.technicalSupport', async () => {
		vscode.env.openExternal(vscode.Uri.parse('https://jq.qq.com/?_wv=1027&k=cl7grKU4'));
	}));
	// 注册工具源码命令，点击后打开luatide源码
	context.subscriptions.push(vscode.commands.registerCommand('luatide.SourceCode', async () => {
		vscode.env.openExternal(vscode.Uri.parse('https://gitee.com/openLuat/luatide'));
	}));
	// 注册联系我们命令，点击后打开官网
	context.subscriptions.push(vscode.commands.registerCommand('luatide.contactUs', async () => {
		vscode.env.openExternal(vscode.Uri.parse('https://doc.openluat.com'));
	}));
	// 注册用户erp注册命令，点击后打开erp注册页面
	context.subscriptions.push(vscode.commands.registerCommand('luatide.register', async () => {
		vscode.env.openExternal(vscode.Uri.parse('https://erp.openluat.com/login'));
	}));
	// 注册luatosWiki命令,点击后打开luatos的wiki页面
	context.subscriptions.push(vscode.commands.registerCommand('luatide.luatosWiki', async () => {
		vscode.env.openExternal(vscode.Uri.parse('https://wiki.luatos.com'));
	}));
	dataReport.activaReport();
	// 调用LSP 客户端操作
	clientOperation(context);
}

/** 这个方法当插件结束时被调用 */
export function deactivate() {

}
