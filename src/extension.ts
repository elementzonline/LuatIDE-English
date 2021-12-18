'use strict';
import * as vscode from 'vscode';
// import { LuatideProvider } from './project/projectView';
// import {OperationExplorer} from './project/toolshub';
import {PluginVariablesInit} from './config';
import { ProjectActiveHandle, ProjectConfigOperation, ProjectDeleteHandle } from './project/ProjectHandle';


function createProject():void{

}

function openProject():void{

}

function homeManage():void {
	
}

function runProject():void {
	
}

function debugProject():void {
	
}

function projectSeletcedDelete() {
	
}

let pluginVariablesInit = new PluginVariablesInit();
let projectActiveHandle = new ProjectActiveHandle();
let projectDeleteHandle = new ProjectDeleteHandle();
let projectConfigOperation = new ProjectConfigOperation();
/** 这个方法当插件被激活时调用*/
export function activate(context: vscode.ExtensionContext) {
	// 注册新建工程命令,当点击用户历史工程标题区域新建工程按钮时触发
	context.subscriptions.push(vscode.commands.registerCommand('luatide-history-project.createProject',async ()=> createProject));
	// 注册打开工程命令,当点击用户历史工程标题区域打开工程按钮时触发
	context.subscriptions.push(vscode.commands.registerCommand('luatide-history-project.openProject',openProject));
	// 注册运行工程命令,当点击活动工程标题区域运行工程按钮时触发
	context.subscriptions.push(vscode.commands.registerCommand('luatide-activity-project.runProject',runProject));
	// 注册调试工程命令,当点击活动工程标题区域调试工程按钮时触发
	context.subscriptions.push(vscode.commands.registerCommand('luatide-activity-project.debugProject',debugProject));
	// 注册删除工程命令,当点击活动工程内部区域删除工程按钮时触发
	context.subscriptions.push(vscode.commands.registerCommand('luatide-activity-project.deleteProject',async (filePath) => projectDeleteHandle.deleteProject(filePath)));
	// 注册激活工程命令,当点击活动工程内部区域激活工程按钮时触发
	context.subscriptions.push(vscode.commands.registerCommand('luatide-history-project.Project.active',async (filePath) => projectActiveHandle.projectActive(filePath)));
	// 注册删除工程文件命令,当点击活动工程内部区域删除工程文件夹或文件按钮时触发
	context.subscriptions.push(vscode.commands.registerCommand('luatide-history-project.Project.delete',projectSeletcedDelete));
	// 注册点击home主页命令,当点击历史工程标题区域主页按钮时触发
	context.subscriptions.push(vscode.commands.registerCommand('luatide-history-project.Home',async ()=> homeManage));
	// 注册点击登录命令,当点击home主页内登录按钮时触发
	context.subscriptions.push(vscode.commands.registerCommand('luatide-plugin.Login',async ()=> homeManage));
	// 注册点击活动工程配置命令,当点击配置活动工程时触发
	context.subscriptions.push(vscode.commands.registerCommand('luatide-activity-project.configOperation',projectConfigOperation.projectConfigOperation));

}	


/** 这个方法当插件结束时被调用 */
export function deactivate() {

}
