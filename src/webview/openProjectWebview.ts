import { PluginVariablesInit } from '../config';
import * as vscode from 'vscode';
import * as fs from 'fs';
import path = require('path');
import { ProjectConfigOperation } from '../project/ProjectHandle';
import { ProjectJsonParse } from '../project/projectConfigParse';
import { PluginJsonParse } from '../plugConfigParse';
import {checkSameProjectExistStatusForPluginConfig} from '../project/projectApi';
let pluginVariablesInit = new PluginVariablesInit();
let projectConfigOperation = new ProjectConfigOperation();
let pluginJsonParse = new PluginJsonParse();
let projectJsonParse = new ProjectJsonParse();
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
                '打开工程配置', //webview 展示标题
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
                // 处理导入工程传过来的路径数据
                this.openProjectReceiveDataHandle(message);
                break;
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
            case 'cancelProject':
                openProjectPanel.dispose();
                break;
        }
    }

    // 处理打开工程webview接收到的数据
    openProjectReceiveDataHandle(message:any){
        let openProjectMessage = {
            openProjectProjectType:message.text.type,
            openProjectName: message.text.data.projectName,
            openProjectPath: message.text.data.projectPath,
            openProjectModuleModel: message.text.data.moduleModel,
            openProjectLibPath: message.text.data.libPath,
            openProjectCorePath: message.text.data.corePath,
            openProjectExample: message.text.data.example,
        };
        const openProjectCheckState:boolean = this.openProjectCheck(message);
        if (!openProjectCheckState) { //新建工程必要条件检查未通过
            return false;
        }
        // 将打开工程名称和路径信息插入插件配置文件
        const nameIndex:number = openProjectMessage.openProjectPath.lastIndexOf("\\");
        const projectParentPath:string = openProjectMessage.openProjectPath.substring(0,nameIndex);
        const projectObj = {
            projectPath:projectParentPath,
            projectName:openProjectMessage.openProjectName,
        };
        pluginJsonParse.pushPluginConfigProject(projectObj);
        pluginJsonParse.setPluginConfigActivityProject(openProjectMessage.openProjectPath);
        // const appFile:string = getFileForDir(openProjectMessage.openProjectPath);         //appfile采用用户自己的appfile
        // projectJsonParse.setProjectConfigAppFile(appFile,openProjectMessage.openProjectPath);
        const projectConfigVersion:string = projectJsonParse.getprojectConfigInitVersion();
        projectJsonParse.setProjectConfigProjectType(openProjectMessage.openProjectProjectType,openProjectMessage.openProjectPath);
        projectJsonParse.setProjectConfigVersion(projectConfigVersion,openProjectMessage.openProjectPath);
        projectJsonParse.setProjectConfigCorePath(openProjectMessage.openProjectCorePath,openProjectMessage.openProjectPath);
        projectJsonParse.setProjectConfigLibPath(openProjectMessage.openProjectLibPath,openProjectMessage.openProjectPath);
        projectJsonParse.setProjectConfigModuleModel(openProjectMessage.openProjectModuleModel,openProjectMessage.openProjectPath);
        vscode.window.showInformationMessage(`工程${openProjectMessage.openProjectName}已导入成功，请切换到用户工程查看`,{modal: true});
        vscode.commands.executeCommand('luatide-history-project.Project.refresh');
        vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
    }

    // 打开工程必要条件检查
    openProjectCheck(message:any){
        const projectName:any = message.text.data.projectName;
        const projectPath:any = message.text.data.projectPath;
        const projectModule:any =message.text.data.moduleModel;
        if (projectName === "" || projectPath  === "" || projectModule === "") {
            vscode.window.showErrorMessage("打开工程webview数据接收失败!!",{modal: true});
            return false;
        }
        const sameProjectExistStatus:boolean = checkSameProjectExistStatusForPluginConfig(projectName);
        // 检查用户历史工程看工程名称是否重复
        if (sameProjectExistStatus) {
            vscode.window.showErrorMessage("该工程已被建立，不能重新建立" ,{modal: true});
            return false;
        }
        return true;
    }
}