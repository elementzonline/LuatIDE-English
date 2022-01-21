import { PluginVariablesInit } from '../config';
import * as vscode from 'vscode';
import * as fs from 'fs';
import path = require('path');
// import { ProjectConfigOperation } from '../project/ProjectHandle';
// import { ProjectJsonParse } from '../project/projectConfigParse';
// import { PluginJsonParse } from '../plugConfigParse';
// import { CreateProject } from '../project/createProject';
import * as fetch from 'node-fetch';

let pluginVariablesInit = new PluginVariablesInit();
// let projectConfigOperation = new ProjectConfigOperation();
// let pluginJsonParse = new PluginJsonParse();
// let createProject = new CreateProject();
export class HomeManage {
    constructor() {

    }
    homePanel: vscode.WebviewPanel | undefined = undefined;
    // 工程主页webview管理
    homeManage(context:vscode.ExtensionContext) {
        const columnToShowIn = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        // 如果检测到编辑器区域已存在home面板，则展示它
        if (this.homePanel) {
            this.homePanel.reveal(columnToShowIn);
            return;
        }
        else {
            this.homePanel = vscode.window.createWebviewPanel(
                'Home', //仅供内部使用的面板类型
                'LuatIDE主页', //webview 展示标题
                vscode.ViewColumn.Active,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );
        }

        // 获取webview界面
        this.homePanel.webview.html = this.getHomeWebviewContent();

        // 获取vscode初始主题
        const colorTheme = vscode.window.activeColorTheme.kind === 1 ? 'light' : 'dark';
        this.homePanel.webview.postMessage(
            {
                command: 'switchTheme',
                text: colorTheme
            }
        );

        let temPanel = this.homePanel;

        /* 实时检测主题颜色变化 */
        vscode.window.onDidChangeActiveColorTheme((e) => {
            temPanel.webview.postMessage(
                {
                    command: "switchTheme",
                    text: e.kind === 1 ? "light" : "dark"
                }
            );
        });



        this.homePanel.webview.onDidReceiveMessage(
            message => this.receiveMessageHandle(this.homePanel, message)
        );

        // Reset when the current panel is closed
        this.homePanel.onDidDispose(
            () => {
                this.homePanel = undefined;
            },
            null,
            context.subscriptions
        );
    }

    // 获取webview的html内容
    getHomeWebviewContent() {
        const homeHtmlJsPath = pluginVariablesInit.getHomeSourcePath();
        const homeHtmlPath: string = pluginVariablesInit.getHomeHtmlPath();
        let homeHtml: string = fs.readFileSync(homeHtmlPath, "utf-8");
        homeHtml = homeHtml.replace(
            /(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g,
            (m, $1, $2) => {
                return (
                    $1 +
                    vscode.Uri.file(path.resolve(homeHtmlJsPath, $2))
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
    async receiveMessageHandle(homePanel: any, message: any) {
        switch (message.command) {
            case 'openNewProjectWebview':
                await vscode.commands.executeCommand('luatide-history-project.createProject');
                break;
            case 'openProjectWebview':
                await vscode.commands.executeCommand('luatide-history-project.openProject');
                break;
            case 'Alert':
                vscode.window.showErrorMessage(message.text['msg'],{modal: true});
                break;
            case 'openExternalWeb':
                switch (message.text) {
                    case '工具源码': 
                        vscode.commands.executeCommand('luatide.SourceCode');
                        break;
                    case 'QQ':
                        vscode.commands.executeCommand('luatide.technicalSupport');
                        break;
                    case '联系我们':
                        vscode.commands.executeCommand('luatide.contactUs');
                        break; 
                }
        }
    }


}