import { PluginVariablesInit } from '../config';
import * as vscode from 'vscode';
import * as fs from 'fs';
import path = require('path');
import { ProjectConfigOperation } from '../project/ProjectHandle';
import { ProjectJsonParse } from '../project/projectConfigParse';
import { PluginJsonParse } from '../plugConfigParse';
import { CreateProject } from '../project/createProject';

let pluginVariablesInit = new PluginVariablesInit();
let projectConfigOperation = new ProjectConfigOperation();
let pluginJsonParse = new PluginJsonParse();

export class OpenProjectManage {
    constructor() {

    }
    openopenProjectPanel: vscode.WebviewPanel | undefined = undefined;
    // 工程主页webview管理
    openProjectManage(context:vscode.ExtensionContext,openProjectJson:any) {
        const columnToShowIn = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        // 如果检测到编辑器区域已存在home面板，则展示它
        if (this.openopenProjectPanel) {
            this.openopenProjectPanel.reveal(columnToShowIn);
            return;
        }
        else {
            this.openopenProjectPanel = vscode.window.createWebviewPanel(
                'OpenProject', //仅供内部使用的面板类型
                '打开工程', //webview 展示标题
                vscode.ViewColumn.Active,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );
        }

        // 获取webview界面
        this.openopenProjectPanel.webview.html = this.getProjectWebviewContent();

        //  数据通信：发送导入工程数据至webview
        this.openopenProjectPanel.webview.postMessage(
            {
                command: 'importProjectData',
                text: openProjectJson
            }
        );

        this.openopenProjectPanel.webview.onDidReceiveMessage(
            message => this.receiveMessageHandle(this.openopenProjectPanel, message)
        );

        // Reset when the current panel is closed
        this.openopenProjectPanel.onDidDispose(
            () => {
                this.openopenProjectPanel = undefined;
            },
            null,
            context.subscriptions
        );
    }

    // 获取webview的html内容
    getProjectWebviewContent() {
        const projectHtmlJsPath = pluginVariablesInit.getProjectSourcePath();
        const projectHtmlPath: string = pluginVariablesInit.getProjectHtmlPath();
        let homeHtml: string = fs.readFileSync(projectHtmlPath, "utf-8");
        homeHtml = homeHtml.replace(
            /(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g,
            (m, $1, $2) => {
                return (
                    $1 +
                    vscode.Uri.file(path.resolve(projectHtmlJsPath, $2))
                        .with({ scheme: "vscode-resource" })
                        .toString() +
                    '"'
                );
            }
        );
        return homeHtml;
    }

    // 请求更新api接口，获取json数据
    async getApiJsonFromRemoteServer(url: any) {
        const response: any = await fetch(url);
        const jsonResult: any = await response.json();
        return jsonResult;
    };

    // 转化路径为webview支持的vscode-resource形式
    transformUrlToVscodeResourceUrl(panel: any, url: any) {
        const resouceUrl = vscode.Uri.file(url);
        const vscodeResouceUrl = panel.webview.asWebviewUri(resouceUrl);
        return vscodeResouceUrl;
    }

    // 处理从webview传来的命令
    async receiveMessageHandle(openProjectPanel: any, message: any) {
        switch (message.command) {
            // 用户导入工程信息接收
            case 'importProject':
                switch(message.text){
                    case "pure":
                        break;
                    case "example":
                        break;
                    case "ndk":
                        break;
                    case "ui":
                        break;
                }
            case 'Alert':
                vscode.window.showErrorMessage(message.text['msg'],{modal: true});
                break;
            // 接收webview提交的打开资源管理器选择用户工程路径请求
            case 'openSource':
                let activityProjectPath: string = pluginJsonParse.getPluginConfigActivityProject();
                console.log(message.text);
                switch (message.text) {
                    case 'customProjectPath':
                        const customProjectOptions = {
                            canSelectFiles: false,		//是否选择文件
                            canSelectFolders: true,		//是否选择文件夹
                            canSelectMany: false,		//是否选择多个文件
                            defaultUri: vscode.Uri.file(activityProjectPath),	//默认打开文件位置
                            openLabel: '选择需要导入工程的文件夹'
                        };
                        const customProjectPath = await projectConfigOperation.showOpenDialog(customProjectOptions);
                        openProjectPanel.webview.postMessage(
                            {
                                command: "customProjectPath",
                                text: customProjectPath,

                            }
                        );
                        // console.log(selectPath);
                        break;
                    // 接收webview提交的打开资源管理器选择用户lib路径请求
                    case 'customLibPath':
                        const customLibOptions = {
                            canSelectFiles: false,		//是否选择文件
                            canSelectFolders: true,		//是否选择文件夹
                            canSelectMany: false,		//是否选择多个文件
                            defaultUri: vscode.Uri.file(activityProjectPath),	//默认打开文件位置
                            openLabel: '选择需要导入工程的文件夹'
                        };
                        const customLibPath = await projectConfigOperation.showOpenDialog(customLibOptions);
                        openProjectPanel.webview.postMessage(
                            {
                                command: "customLibPath",
                                text: customLibPath,

                            }
                        );
                        // console.log(selectPath);
                        break;

                    // 接收webview提交的打开资源管理器选择用户core路径请求
                    case 'customCorePath':
                        const customCoreOptions = {
                            canSelectFiles: true,		//是否选择文件
                            canSelectFolders: false,		//是否选择文件夹
                            canSelectMany: false,		//是否选择多个文件
                            defaultUri: vscode.Uri.file(activityProjectPath),	//默认打开文件位置
                            openLabel: '选择底包',
                            filters: {
                                json: ['pac', "soc"], // 文件类型过滤
                            },
                        };
                        const customCorePath = await projectConfigOperation.showOpenDialog(customCoreOptions);
                        openProjectPanel.webview.postMessage(
                            {
                                command: "customCorePath",
                                text: customCorePath,

                            }
                        );
                        // console.log(selectPath);
                        break;
                }
                break;
        }
    }


}