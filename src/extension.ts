/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

'use strict';
import * as vscode from 'vscode';
// import { LuatideProvider } from './project/projectView';
// import {OperationExplorer} from './project/toolshub';
import {PluginVariablesInit} from './config';
import { ProjectActiveHandle, ProjectConfigOperation, ProjectDeleteHandle } from './project/ProjectHandle';
// import {activateMockDebug} from './debug/activateMockDebug';
import { ProjectManage } from './webview/projectWebview';
import { NodeDependenciesProvider,Dependency } from './project/projectTreeView';
import * as path from 'path';
import { HomeManage } from './webview/homeWebview';
import {OpenProject} from './project/openProject';
import { PluginJsonParse } from './plugConfigParse';
// import {OperationDataProvider, OperationExplorer} from './project/toolshub';

function createProject():void{

}

// function openProject():void{

// }

// function homeManage():void {
	
// }

function runProject(resource: vscode.Uri):void {
	let targetResource = resource;
	if (!targetResource && vscode.window.activeTextEditor) {
		targetResource = vscode.window.activeTextEditor.document.uri;
	}
	if (targetResource) {
		vscode.debug.startDebugging(undefined, {
				type: 'luat',
				name: 'Run File',
				request: 'launch',
				program: targetResource.fsPath
			},
			{ noDebug: true }
		);
	}
}

function debugProject(resource: vscode.Uri):void {
	let targetResource = resource;
	if (!targetResource && vscode.window.activeTextEditor) {
		targetResource = vscode.window.activeTextEditor.document.uri;
	}
	if (targetResource) {
		vscode.debug.startDebugging(undefined, {
			type: 'luat',
			name: 'Debug File',
			request: 'launch',
			program: targetResource.fsPath
		});
	}
}

function projectSeletcedDelete() {
	
}

let pluginVariablesInit = new PluginVariablesInit();
let projectActiveHandle = new ProjectActiveHandle();
let projectDeleteHandle = new ProjectDeleteHandle();
let projectConfigOperation = new ProjectConfigOperation();
let projectManage = new ProjectManage();
let openProject = new OpenProject();
let homeManage = new HomeManage();
let nodeDependenciesProvider = new NodeDependenciesProvider();
let pluginJsonParse = new PluginJsonParse();
// let operationExplorer = new OperationExplorer();
/*
 * The compile time flag 'runMode' controls how the debug adapter is run.
 * Please note: the test suite only supports 'external' mode.
 */
const runMode: 'external' | 'server' | 'inline' = 'inline';

/** 这个方法当插件被激活时调用*/
export function activate(context: vscode.ExtensionContext) {
	// 注册新建工程命令,当点击用户历史工程标题区域新建工程按钮时触发
	context.subscriptions.push(vscode.commands.registerCommand('luatide-history-project.createProject',async ()=> projectManage.projectManage(context)));
	// 注册运行工程命令,当点击活动工程标题区域运行工程按钮时触发
	context.subscriptions.push(vscode.commands.registerCommand('luatide-activity-project.runProject',runProject));
	// 注册调试工程命令,当点击活动工程标题区域调试工程按钮时触发
	context.subscriptions.push(vscode.commands.registerCommand('luatide-activity-project.debugProject',debugProject));
	// 注册删除工程命令,当点击活动工程内部区域删除工程按钮时触发
	// // 注册打开工程命令,当点击用户历史工程标题区域打开工程按钮时触发
	context.subscriptions.push(vscode.commands.registerCommand('luatide-history-project.openProject',async ()=> openProject.openProject(context)));
	context.subscriptions.push(vscode.commands.registerCommand('luatide-history-project.deleteProject',async (filePath) => projectDeleteHandle.deleteProject(filePath)));
	// 注册激活工程命令,当点击活动工程内部区域激活工程按钮时触发
	context.subscriptions.push(vscode.commands.registerCommand('luatide-history-project.Project.active',async (filePath) => projectActiveHandle.projectActive(filePath)));
	// 注册删除工程文件命令,当点击活动工程内部区域删除工程文件夹或文件按钮时触发
	// context.subscriptions.push(vscode.commands.registerCommand('luatide-history-project.Project.delete',projectSeletcedDelete));
	// 注册点击home主页命令,当点击历史工程标题区域主页按钮时触发
	context.subscriptions.push(vscode.commands.registerCommand('luatide-history-project.Home',async ()=> homeManage.homeManage(context)));
	// 注册点击活动工程配置命令,当点击配置活动工程时触发
	// context.subscriptions.push(vscode.commands.registerCommand('luatide-activity-project.configOperation',projectConfigOperation.projectConfigOperation));
	vscode.window.registerTreeDataProvider(
		'luatide-history-project',
		nodeDependenciesProvider
	  );
	context.subscriptions.push(vscode.commands.registerCommand('luatide-history-project.Project.refresh',async (filePath:Dependency) => nodeDependenciesProvider.refresh()));
}

/** 这个方法当插件结束时被调用 */
export function deactivate() {

}
