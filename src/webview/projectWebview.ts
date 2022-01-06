import { PluginVariablesInit } from '../config';
import * as vscode from 'vscode';
import * as fs from 'fs';
import path = require('path');
import { ProjectConfigOperation } from '../project/ProjectHandle';
// import { ProjectJsonParse } from '../project/projectConfigParse';
import { PluginJsonParse } from '../plugConfigParse';
import { CreateProject } from '../project/createProject';
const {fetch} = require('node-fetch');

let pluginVariablesInit = new PluginVariablesInit();
let projectConfigOperation = new ProjectConfigOperation();
let pluginJsonParse = new PluginJsonParse();
let createProject = new CreateProject();
export class ProjectManage {
    constructor() {

    }
    projectPanel: vscode.WebviewPanel | undefined = undefined;
    // 工程主页webview管理
    projectManage(context:vscode.ExtensionContext) {
        const columnToShowIn = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        // 如果检测到编辑器区域已存在home面板，则展示它
        if (this.projectPanel) {
            this.projectPanel.reveal(columnToShowIn);
            return;
        }
        else {
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

        // // 数据通信：发送数据至webview
        // this.projectPanel.webview.postMessage(
        //     {
        //         command: 'refactor',
        //         text: ""
        //     }
        // );


        this.projectPanel.webview.onDidReceiveMessage(
            message => this.receiveMessageHandle(this.projectPanel, message)
        );

        // Reset when the current panel is closed
        this.projectPanel.onDidDispose(
            () => {
                this.projectPanel = undefined;
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
    async receiveMessageHandle(projectPanel: any, message: any) {
        let activityProjectPath: string = pluginJsonParse.getPluginConfigActivityProject();
        const pluginDefaultModuleList: string[] = pluginVariablesInit.getPluginDefaultModuleList();
        const pluginDefaultAir101Example:string[] = pluginVariablesInit.getAir101DefaultExampleList();
        const pluginDefaultAir103Example:string[] = pluginVariablesInit.getAir103DefaultExampleList();
        const pluginDefaultAir105Example:string[] = pluginVariablesInit.getAir105DefaultExampleList();
        const pluginDefaultAir72XExample:string[] = pluginVariablesInit.getAir72XDefaultExampleList();
        const air72XUXLibList:string[] = pluginVariablesInit.getAir72XDefaultLibList();
        const air72XUXCoreList:string[] = pluginVariablesInit.getAir72XDefaultCoreList();
        const air101CoreList:string[] = pluginVariablesInit.getAir101DefaultCoreList();
        const air103CoreList:string[] = pluginVariablesInit.getAir103DefaultCoreList();
        const air105CoreList:string[] = pluginVariablesInit.getAir105DefaultCoreList();
        const air72XCXCoreList:string[] = [];
        const air101LibList:string[] = []; 
        const air103LibList:string[] = []; 
        const air105LibList:string[] = []; 
        switch (message.command) {
            // 用户新建工程信息接收
            case 'projectType':
                console.log(message.text);
                switch (message.text) {
                    case 'pure':
                        // 传送pure所需要的数据至工程
                        projectPanel.webview.postMessage(
                            {
                                command: 'pureProjectInitData',
                                text: {
                                    "moduleList": pluginDefaultModuleList,
                                    "libList": {
                                        "air72XUX/air82XUX": air72XUXLibList,
                                        "air72XCX":air72XUXLibList,
                                        "air101": air101LibList,
                                        "air103": air103LibList,
                                        "air105": air105LibList,
                                        "simulator":air72XUXLibList,
                                    },
                                    "coreList": {
                                        "air72XUX/air82XUX": air72XUXCoreList,
                                        "air72XCX":air72XCXCoreList,
                                        "air101": air101CoreList,
                                        "air103": air103CoreList,
                                        "air105": air105CoreList,
                                        "simulator":air72XUXCoreList,
                                    },
                                }
                            }
                        );
                        break;
                    case 'example':
                        // 传送example工程所需数据
                        projectPanel.webview.postMessage(
                            {
                                command: 'exampleProjectInitData',
                                text: {
                                    "moduleList": pluginDefaultModuleList,
                                    "exampleList": {
                                        "air72XUX/air82XUX": pluginDefaultAir72XExample,
                                        "air72XCX":pluginDefaultAir72XExample,
                                        "air101": pluginDefaultAir101Example,
                                        "air103": pluginDefaultAir103Example,
                                        "air105": pluginDefaultAir105Example,
                                        "simulator":pluginDefaultAir72XExample,
                                    },
                                    "coreList": {
                                        "air72XUX/air82XUX": air72XUXCoreList,
                                        "air72XCX":air72XCXCoreList,
                                        "air101": air101CoreList,
                                        "air103": air103CoreList,
                                        "air105": air105CoreList,
                                        "simulator":air72XUXCoreList,
                                    },
                                },
                            }
                        );
                        break;
                    case 'ndk':
                        // 传送ndk工程所需数据
                        projectPanel.webview.postMessage({
                            command: 'ndkProjectInitData',
                            text: {
                                "moduleList": pluginDefaultModuleList,
                                "exampleList": [],
                            },
                        }
                        );
                        break;
                    case 'ui':
                        // 传送ui工程所需数据
                        projectPanel.webview.postMessage(
                            {
                                command: 'uiProjectInitData',
                                text: {
                                    "moduleList": pluginDefaultModuleList,
                                    "libList": {
                                        "air72XUX/air82XUX": air72XUXLibList,
                                        "air72XCX":air72XUXLibList,
                                        "air101": air101LibList,
                                        "air103": air103LibList,
                                        "air105": air105LibList,
                                        "simulator":air72XUXLibList,
                                    },
                                    "coreList": {
                                        "air72XUX/air82XUX": air72XUXCoreList,
                                        "air72XCX":air72XCXCoreList,
                                        "air101": air101CoreList,
                                        "air103": air103CoreList,
                                        "air105": air105CoreList,
                                        "simulator":air72XUXCoreList,
                                    },
                                },
                            }
                        );
                        break;
                }
                break;
            // 接收webview提交的打开资源管理器选择用户工程路径请求
            case 'openSource':
                console.log(message.text);
                switch (message.text) {
                    case 'customProjectPath':
                        const customProjectOptions = {
                            canSelectFiles: false,		//是否选择文件
                            canSelectFolders: true,		//是否选择文件夹
                            canSelectMany: false,		//是否选择多个文件
                            defaultUri: vscode.Uri.file(activityProjectPath),	//默认打开文件位置
                            openLabel: '选择工程文件夹'
                        };
                        const customProjectPathResult:any = await projectConfigOperation.showOpenDialog(customProjectOptions);
                        if (customProjectPathResult!==undefined) {
                            const customProjectPath = customProjectPathResult[0].fsPath;
                            projectPanel.webview.postMessage(
                                {
                                    command: "customProjectPath",
                                    text: customProjectPath,
    
                                }
                            );
                        }
                        // console.log(selectPath);
                        break;
                    // 接收webview提交的打开资源管理器选择用户lib路径请求
                    case 'customLibPath':
                        const customLibOptions = {
                            canSelectFiles: false,		//是否选择文件
                            canSelectFolders: true,		//是否选择文件夹
                            canSelectMany: false,		//是否选择多个文件
                            defaultUri: vscode.Uri.file(activityProjectPath),	//默认打开文件位置
                            openLabel: '选择工程Lib文件夹'
                        };
                        const customLibPathResult = await projectConfigOperation.showOpenDialog(customLibOptions);
                        if (customLibPathResult!==undefined) {
                            const customLibPath:string = customLibPathResult[0].fsPath;
                            projectPanel.webview.postMessage(
                                {
                                    command: "customLibPath",
                                    text: customLibPath,
    
                                }
                            );
                        }
                        // console.log(selectPath);
                        break;

                    // 接收webview提交的打开资源管理器选择用户core路径请求
                    case 'customCorePath':
                        const customCoreOptions = {
                            canSelectFiles: true,		//是否选择文件
                            canSelectFolders: false,		//是否选择文件夹
                            canSelectMany: false,		//是否选择多个文件
                            defaultUri: vscode.Uri.file(activityProjectPath),	//默认打开文件位置
                            openLabel: '选择工程Core文件夹',
                            filters: {
                                json: ['pac', "soc"], // 文件类型过滤
                            },
                        };
                        const customCorePathResult = await projectConfigOperation.showOpenDialog(customCoreOptions);
                        if (customCorePathResult!==undefined) {
                            const customCorePath = customCorePathResult[0].fsPath;
                            projectPanel.webview.postMessage(
                                {
                                    command: "customCorePath",
                                    text: customCorePath,
    
                                }
                            );
                        }
                        // console.log(selectPath);
                        break;
                }
                break;
            // 接收webview取消指令，关闭新建工程webview
            case 'cancelProject':
                projectPanel.dispose();
                break;
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
            
            // 用户新建pure工程命令接收
            case "pureProject":
                createProject.createPureProject(message);
                break;
            // 用户新建example工程命令接收
            case "exampleProject":
                createProject.createExampleProject(message);
                break;
            // 用户新建ndk工程命令接收
            case "ndkProject":
                createProject.createNdkProject(message);
                break;
            // 用户新建ui工程命令接收
            case "uiProject":
                createProject.createUiProject(message);
                break;
        }
    }


}