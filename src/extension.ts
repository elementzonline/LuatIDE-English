/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

'use strict';
import * as vscode from 'vscode';
// import { LuatideProvider } from './project/projectView';
// import {OperationExplorer} from './project/toolshub';
import {PluginVariablesInit} from './config';
import { ProjectActiveHandle, ProjectConfigOperation, ProjectDeleteHandle, ProjectSoruceFileDelete } from './project/ProjectHandle';
// import {activateMockDebug} from './debug/activateMockDebug';
import { ProjectManage } from './webview/projectWebview';
import { NodeDependenciesProvider,Dependency } from './project/projectTreeView';
import * as path from 'path';
import { HomeManage } from './webview/homeWebview';
import { TestDependenciesProvider } from './project/activityProjectTreeView';
import {OpenProject} from './project/openProject';
import { PluginJsonParse } from './plugConfigParse';
// import { DataProvider,TreeViewItem } from './project/historyTreeviewTest';
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

let pluginVariablesInit = new PluginVariablesInit();
let projectActiveHandle = new ProjectActiveHandle();
let projectDeleteHandle = new ProjectDeleteHandle();
let projectConfigOperation = new ProjectConfigOperation();
let projectManage = new ProjectManage();
let openProject = new OpenProject();
let homeManage = new HomeManage();
let nodeDependenciesProvider = new NodeDependenciesProvider();
let pluginJsonParse = new PluginJsonParse();
let  testDependenciesProvider = new TestDependenciesProvider();
let projectSoruceFileDelete = new ProjectSoruceFileDelete();
// let operationExplorer = new OperationExplorer();
/*
 * The compile time flag 'runMode' controls how the debug adapter is run.
 * Please note: the test suite only supports 'external' mode.
 */
const runMode: 'external' | 'server' | 'inline' = 'inline';

/** 这个方法当插件被激活时调用*/
export function activate(context: vscode.ExtensionContext) {
	// const dataProvider = new DataProvider();
	// 注册新建工程命令,当点击用户历史工程标题区域新建工程按钮时触发
	context.subscriptions.push(vscode.commands.registerCommand('luatide-history-project.createProject',async ()=> projectManage.projectManage(context)));
	// // 注册打开工程命令,当点击用户历史工程标题区域打开工程按钮时触发
	context.subscriptions.push(vscode.commands.registerCommand('luatide-history-project.openProject',async ()=> openProject.openProject(context)));
	// // 注册运行工程命令,当点击活动工程标题区域运行工程按钮时触发
	// context.subscriptions.push(vscode.commands.registerCommand('luatide-activity-project.runProject',runProject));
	// // 注册调试工程命令,当点击活动工程标题区域调试工程按钮时触发
	// context.subscriptions.push(vscode.commands.registerCommand('luatide-activity-project.debugProject',debugProject));
	// // 注册删除工程命令,当点击活动工程内部区域删除工程按钮时触发
	context.subscriptions.push(vscode.commands.registerCommand('luatide-history-project.deleteProject',async (filePath:Dependency) => projectDeleteHandle.deleteProject(filePath)));
	// // 注册激活工程命令,当点击历史工程内部区域激活工程按钮时触发
	context.subscriptions.push(vscode.commands.registerCommand('luatide-history-project.Project.active',async (filePath) => projectActiveHandle.projectActive(filePath)));
	// 注册删除工程文件命令,当点击活动工程内部区域删除工程文件夹或文件按钮时触发
	context.subscriptions.push(vscode.commands.registerCommand('luatide-activity-project.sourceFile.delete',async (filePath:Dependency) =>projectSoruceFileDelete.projectSourceFileDelete(filePath)));
	// 注册点击home主页命令,当点击历史工程标题区域主页按钮时触发
	context.subscriptions.push(vscode.commands.registerCommand('luatide-history-project.Home',async ()=> homeManage.homeManage(context)));
	// // 注册点击登录命令,当点击home主页内登录按钮时触发
	// context.subscriptions.push(vscode.commands.registerCommand('luatide-plugin.Login',async ()=> homeManage));
	// 注册点击活动工程配置命令,当点击配置活动工程时触发
	// context.subscriptions.push(vscode.commands.registerCommand('luatide-activity-project.configOperation',projectConfigOperation.projectConfigOperation));
	// 注册活动工程文件点击命令，当点击活动工程文件时触发
	context.subscriptions.push(vscode.commands.registerCommand('luatide-activity-project.click',(label,filePath) => {
		vscode.workspace.openTextDocument(filePath).then(doc => {
			// 在VSCode编辑窗口展示读取到的文本
			vscode.window.showTextDocument(doc);
		}, err => {
			//vscode.window.showInformationMessage('Open string in window err,' + err);
		}).then(undefined, err => {
			vscode.window.showInformationMessage(`Open ${filePath} error, ${err}.`);
		});
	}));
	// // activateMockDebug(context, runMode);
	vscode.window.registerTreeDataProvider(
		'luatide-history-project',
		nodeDependenciesProvider
	  );

	vscode.window.registerTreeDataProvider(
	'luatide-activity-project',
	testDependenciesProvider
	);
	
	// const userProjectAbsulutePathList =  pluginJsonParse.getPluginConfigUserProjectAbsolutePathList();
	// nodeDependenciesProvider.generateRootUrl(userProjectAbsulutePathList);
	// vscode.window.registerTreeDataProvider(
	// 	'luatide-history-project',
	// 	dataProvider
	//   );
	context.subscriptions.push(vscode.commands.registerCommand('luatide-history-project.Project.refresh',async (filePath:Dependency) => nodeDependenciesProvider.refresh()));
	context.subscriptions.push(vscode.commands.registerCommand('luatide-activity-project.Project.refresh',async (filePath:Dependency) => testDependenciesProvider.refresh()));

	//   vscode.window.registerTreeDataProvider(
	// 	'luatide-activity-project',
	// 	new OperationDataProvider()
	//   );
	//   new OperationExplorer(context);

}

/** 这个方法当插件结束时被调用 */
export function deactivate() {

}
