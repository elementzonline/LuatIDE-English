import {PluginVariablesInit} from '../config';
import * as vscode from 'vscode';
import * as fs from 'fs'; 
import path = require('path');
import { ProjectConfigOperation } from '../project/ProjectHandle';
import { ProjectJsonParse } from '../project/projectConfigParse';
import { PluginJsonParse } from '../plugConfigParse';

let pluginVariablesInit = new PluginVariablesInit();
let projectConfigOperation = new ProjectConfigOperation();
let pluginJsonParse = new PluginJsonParse();
export class ProjectManage {
    constructor() {
        
    }
    projectPanel: vscode.WebviewPanel | undefined = undefined;
    // 工程主页webview管理
    projectManage(){
        const columnToShowIn = vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.viewColumn
        : undefined;
        // 如果检测到编辑器区域已存在home面板，则展示它
        if (this.projectPanel) {
            this.projectPanel.reveal(columnToShowIn);
        }
        else{
            this.projectPanel = vscode.window.createWebviewPanel(
                'Project', //仅供内部使用的面板类型
                '工程向导', //webview 展示标题
                vscode.ViewColumn.Active,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );
        }

        // 获取webview界面
        this.projectPanel.webview.html = this.getProjectWebviewContent();

        // 数据通信：发送数据至webview
        this.projectPanel.webview.postMessage(
            {
                command: 'refactor',
				text: ""
            }
        );
        

        this.projectPanel.webview.onDidReceiveMessage(
            message => this.receiveMessageHandle(this.projectPanel,message)
        );

        // Reset when the current panel is closed
        this.projectPanel.onDidDispose(
            () => {
                this.projectPanel = undefined;
            },
            null,
            // context.subscriptions
        );
        }
        
    // 获取webview的html内容
    getProjectWebviewContent(){
        const projectHtmlJsPath = pluginVariablesInit.getProjectSourcePath();
        const projectHtmlPath:string = pluginVariablesInit.getProjectHtmlPath();
        let homeHtml:string = fs.readFileSync(projectHtmlPath, "utf-8");
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
    async getApiJsonFromRemoteServer (url:any) {
        const response:any = await fetch(url);
        const jsonResult:any = await response.json();
        return jsonResult;
        };
    
    // 转化路径为webview支持的vscode-resource形式
    transformUrlToVscodeResourceUrl(panel:any,url:any){
        const resouceUrl = vscode.Uri.file(url);
        const vscodeResouceUrl = panel.webview.asWebviewUri(resouceUrl);
        return vscodeResouceUrl;
    }

    // 处理从webview传来的命令
    async receiveMessageHandle(projectPanel:any,message:any){
        const activityProjectPath:string = pluginJsonParse.getPluginConfigActivityProject();
        const pluginDefaultModuleList:string[] = pluginVariablesInit.getPluginDefaultModuleList();
        const libList:string[] = [];
        const coreList:string[] = [];
        switch (message.command) {
            // 用户新建工程信息接收
            case 'projectType':
                // console.log(message.text);
                switch(message.text){
                    case 'pure':
                        // 传送pure所需要的数据至工程

                        projectPanel.postMessage(
                            {
                                command:'pureProjectInitData',
                                text:{
                                    "moduleList":pluginDefaultModuleList,
                                    "libList":libList,
                                    "coreList":coreList,
                                }
                            }
                        );
                        break;
                    case 'example':
                        // 传送example工程所需数据
                        projectPanel.postMessage(
                            {
                                command:'exampleProjectInitData',
                                text:{
                                    "moduleList":pluginDefaultModuleList,
                                    "exampleList":[],
                                    "coreList":[],
                                },
                            }
                        );
                        break;
                    case 'ndk':
                        // 传送ndk工程所需数据
                        projectPanel.postMessage({
                            command:'ndkProjectInitData',
                            text:{
                                "moduleList":pluginDefaultModuleList,
                                "exampleList":[],
                            },
                        }
                            );
                        break;
                    case 'ui':
                        // 传送ui工程所需数据
                        projectPanel.postMessage(
                            {
                                command:'uiProjectInitData',
                                text:{
                                    "moduleList":pluginDefaultModuleList,
                                    "libList":[],
                                    "coreList":[],
                                },
                            }
                        );
                        break;
                }

            // 接收webview提交的打开资源管理器选择用户工程路径请求
            case 'customProjectPath':
                const customProjectOptions = {
                    canSelectFiles: false,		//是否选择文件
                    canSelectFolders: true,		//是否选择文件夹
                    canSelectMany: false,		//是否选择多个文件
                    defaultUri: vscode.Uri.file(activityProjectPath),	//默认打开文件位置
                    openLabel: '选择需要导入工程的文件夹'
                };
                const customProjectPath = await projectConfigOperation.showOpenDialog(customProjectOptions);
                projectPanel.postMessage(
                    {
                        command:"customProjectPath",
                        text:customProjectPath,

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
                projectPanel.postMessage(
                    {
                        command:"customProjectPath",
                        text:customLibPath,

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
                projectPanel.postMessage(
                    {
                        command:"customCorePath",
                        text:customCorePath,

                    }
                );
                // console.log(selectPath);
                break;
        }
    }

    
}