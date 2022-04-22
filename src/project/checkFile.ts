
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { getPluginConfigActivityProject } from '../plugConfigParse';
import { getDownloadHtmlPath, getDownloadSourcePath } from '../variableInterface';

/*
    check the change of the source code
    Add:
        ignore: {
            "file1": true,
            "file2": false,
        }
*/
let isUserClose = false;
let curFdInWeb = undefined;

export class CheckFiles {
    constructor() {
    }
    
    downloadPage: vscode.WebviewPanel | undefined = undefined;
    
    async downloadConfigDisplay(context:vscode.ExtensionContext, files: any) {

        //判断是否需要显示webview
        const fileRet: any = await this.checkFilesType(files.all, files.new, false);

        if (fileRet){
            if (this.downloadPage || isUserClose) {
                return true;
            }
            else {
                isUserClose = false;
                this.downloadPage = vscode.window.createWebviewPanel(
                    'download', //仅供内部使用的面板类型
                    'LuatIDE 下载配置', //webview 展示标题
                    vscode.ViewColumn.Active,
                    {
                        enableScripts: true,
                        retainContextWhenHidden: true
                    }
                );
            }

            /* 赋值当前WebView 中的当前数据*/
            curFdInWeb = files.all;
            // 获取webview界面
            this.downloadPage.webview.html = this.getDownloadPageHtml();

            let temPanel = this.downloadPage;

            /* 实时检测主题颜色变化 */
            vscode.window.onDidChangeActiveColorTheme((e) => {
                temPanel.webview.postMessage(
                    {
                        command: "switchTheme",
                        text: e.kind === 1 ? "light" : "dark"
                    }
                );
            });
            temPanel.webview.postMessage(
                {
                    command: 'filesChange',
                    text: {
                        "all": fileRet.all,
                        "new": fileRet.new,
                        "ignore": fileRet.ignore,
                        "isOpenProject": false
                    },
                }
            );

            this.downloadPage.webview.onDidReceiveMessage(
                message => this.receiveMessageHandle(context,this.downloadPage, message)
            );

            // Reset when the current panel is closed
            this.downloadPage.onDidDispose(
                () => {
                    this.downloadPage = undefined;
                },
                null,
                context.subscriptions
            );
        }
        return true;
    }

    /* 打开工程回调 */
    async displayOpenProjectFiles(context:vscode.ExtensionContext, files: any, proPath: any) {

        //判断是否需要显示webview
        const fileRet: any = await this.checkFilesType(files.all, files.new, proPath);

        if (fileRet){
            if (this.downloadPage) {
                return true;
            }
            else {
                this.downloadPage = vscode.window.createWebviewPanel(
                    'download', //仅供内部使用的面板类型
                    'LuatIDE 下载配置', //webview 展示标题
                    vscode.ViewColumn.Active,
                    {
                        enableScripts: true,
                        retainContextWhenHidden: true
                    }
                );
            }

            /* 赋值当前WebView 中的当前数据*/
            curFdInWeb = files.all;
            // 获取webview界面
            this.downloadPage.webview.html = this.getDownloadPageHtml();

            let temPanel = this.downloadPage;

            /* 实时检测主题颜色变化 */
            vscode.window.onDidChangeActiveColorTheme((e) => {
                temPanel.webview.postMessage(
                    {
                        command: "switchTheme",
                        text: e.kind === 1 ? "light" : "dark"
                    }
                );
            });
            temPanel.webview.postMessage(
                {
                    command: 'filesChange',
                    text: {
                        "all": fileRet.all,
                        "new": fileRet.new,
                        "ignore": fileRet.ignore,
                        "isOpenProject": proPath
                    },
                }
            );

            this.downloadPage.webview.onDidReceiveMessage(
                message => this.receiveMessageHandle(context,this.downloadPage, message)
            );

            // Reset when the current panel is closed
            this.downloadPage.onDidDispose(
                () => {
                    this.downloadPage = undefined;
                },
                null,
                context.subscriptions
            );
        }
        return true;
    }

    
    // 获取webview的html内容
    getDownloadPageHtml() {
        const downloadHtmlJsPath = getDownloadSourcePath();
        const downloadHtmlPath: string = getDownloadHtmlPath();
        let homeHtml: string = fs.readFileSync(downloadHtmlPath, "utf-8");
        homeHtml = homeHtml.replace(
            /(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g,
            (m, $1, $2) => {
                return (
                    $1 +
                    vscode.Uri.file(path.resolve(downloadHtmlJsPath, $2))
                        .with({ scheme: "vscode-resource" })
                        .toString() +
                    '"'
                );
            }
        );
        return homeHtml;
    }

    /* 处理从 WebView 来的数据 */
    async receiveMessageHandle(context:vscode.ExtensionContext,downloadPage: any, message: any) {
        switch (message.command) {
            case "downloadConfig":
                isUserClose = true;
                const ret = await this.checkFilesConfig(message.text, false);
                if (ret){
                    downloadPage.dispose();
                }
                break;
            case "downloadConfigWithOpenProject":
                const ret2 = await this.checkFilesConfig(message.text.fileState, message.text.isOpenProject);
                if (ret2){
                    downloadPage.dispose();
                }
                break;
            default:
                break;
        }
    }

    /* 分析文件判断是否需要打开webview */
    async checkFilesType(allFiles: any, newFiles: any, isOpenProject: boolean) {
        let curProjectName: any;
        if (!isOpenProject){
            curProjectName = getPluginConfigActivityProject();
        } else {
            curProjectName = isOpenProject;
        }
        if (curProjectName === '') {
            return true;
        }

        let projectConfigJson = await JSON.parse(fs.readFileSync(path.join(curProjectName, "luatide_project.json")).toString());

        if (!projectConfigJson.ignore){
            projectConfigJson.ignore = [];
        }

        let fileIgnored = projectConfigJson.ignore;
        let fileFiled = projectConfigJson.appFile;

        let temNewFiles = newFiles.filter((item: any) => {
            return !item.match(/^(\.luatide|\.vscode|\.git|.svn|ndk)/);
        });

        /* 去除无效文件夹影响 */
        temNewFiles = temNewFiles.filter((item: any) => {
            return item.match(/\w+\.\w+$/g);
        });

        if (temNewFiles.length > 0) {
            //判断新添加的文件中是否存在同名文件
            let fileArr: any = [];
            for (let i = 0; i < temNewFiles.length; i++) {
                let e = temNewFiles[i];
                let file = e.match(/\w+\.\w+$/g);
                if (file) {
                    if (!fileArr.includes(file[0])) {
                        fileArr.push(file[0]);
                    } else {
                        vscode.window.showErrorMessage("新添加文件" + file + "存在多个同名文件，请检查后重试");
                        return false;
                    }
                }
            }
    
            if (!isOpenProject){
                //判断工程中是否已有同名文件
                for (let j = 0; j < temNewFiles.length; j++) {
                    let e = temNewFiles[j];
                    let file = e.match(/\w+\.\w+$/g);
                    if (file){
                        for (let k = 0; k < fileFiled.length; k++) {
                            if (fileFiled[k].indexOf(file[0]) > -1) {
                                vscode.window.showErrorMessage("文件" + file + "已经存在同名文件，请检查后重试");
                                return false;
                            }
                        }
                        for (let k = 0; k < fileIgnored.length; k++) {
                            if (fileIgnored[k].indexOf(file[0]) > -1) {
                                vscode.window.showErrorMessage("文件" + file + "已经存在同名文件，请检查后重试");
                                return false;
                            }
                        }
                    }
                }
            }
        }

        if (temNewFiles.length > 0){
            return {
                "all": allFiles,
                "new": temNewFiles,
                "ignore": fileIgnored,
            };
        }
        return false;
    }

    /* 分析从 WebView 收到的文件配置 */
    async checkFilesConfig(files: any, proPath: any){
        let curProjectName: any;

        if (!proPath){
            curProjectName = getPluginConfigActivityProject();
        } else {
            curProjectName = proPath;
        }

        if (curProjectName === '') {
            return true;
        }

        let projectConfigJson = await JSON.parse(fs.readFileSync(path.join(curProjectName, "luatide_project.json")).toString());

        if (!projectConfigJson.ignore){
            projectConfigJson.ignore = [];
        }

        let appFile: any = [],
            ignore: any = [];
        for (let key in files){
            if (files[key]){
                appFile.push(key);
            } else {
                ignore.push(key);
            }
        }

        projectConfigJson.ignore = ignore;
        projectConfigJson.appFile = appFile;
        fs.writeFileSync(path.join(curProjectName, "luatide_project.json"), JSON.stringify(projectConfigJson, null, "\t"));
        vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
        return true;
    }


    /* 获取工程的配置文件 */
    async getProjectConfigFiles(tar: any) {
        const curProjectName = getPluginConfigActivityProject();
        if (curProjectName === '') {
            return true;
        }

        let projectConfigJson = await JSON.parse(fs.readFileSync(path.join(curProjectName, "luatide_project.json")).toString());

        if (!projectConfigJson.ignore){
            projectConfigJson.ignore = [];
        }
        // 当工程为 Ui 和 NDK 工程时，直接返回
        // if (projectConfigJson.projectType === "ui" || projectConfigJson.projectType === "ndk"){
        //     return true;
        // }
        let filesChecked = projectConfigJson.appFile;
        let fileIgnored = projectConfigJson.ignore;

        // 待检查文件变化的文件对象
        let fileToDisplay = {};
        fileToDisplay["add"] = [];
        let tipsToUser = "";
        let msgOptions = "";
        let floderAll = "default";

        if (tar){
            if (Array.isArray(tar)) {
                for (let i = 0; i < tar.length; i++) {
                    let e = tar[i];
                    if (!e.match(/^\.luatide/)){
                        if (floderAll === "default") {
                            if (e.includes(".")) {
                                tipsToUser = e;
                                msgOptions = "是否添加 " + tipsToUser + " 文件到下载列表，是：则添加此文件下载，全是：则添加所有文件，全不：则全不添加，否则单次不添加";
                                const downOption = await vscode.window.showInformationMessage(msgOptions, { modal: true }, "是", "全是", "全不");
                                if (downOption === '是') {
                                    filesChecked.push(e);
                                } else if (downOption === '全不') {
                                    floderAll = "all";
                                    fileIgnored.push(e);
                                } else if (downOption === '全是') {
                                    floderAll = "none";
                                    filesChecked.push(e);
                                } else{
                                    fileIgnored.push(e);
                                }
                            }
                        } else if (floderAll === "all") {
                            fileIgnored.push(e);
                        } else if (floderAll === "none") {
                            filesChecked.push(e);
                        } else{
                            filesChecked.push(e);
                        }
                    }
                }
            } else {
                if (!tar.match(/^\.luatide/)){
                    tipsToUser = path.basename(tar);
                    msgOptions = "是否添加文件 " + tipsToUser + " 到下载列表，是：添加，否则不添加";
                    const downOption = await vscode.window.showInformationMessage(msgOptions, { modal: true }, "是");
                    if (downOption === '是') {
                        filesChecked.push(tar);
                    } else{
                        fileIgnored.push(tar);
                    }
                }
            }
            projectConfigJson.ignore = fileIgnored;
            projectConfigJson.appFile = filesChecked;
            fs.writeFileSync(path.join(curProjectName, "luatide_project.json"), JSON.stringify(projectConfigJson, null, "\t"));
        }
        return true;
    }
    
    async delFiles(tar: any){
        const curProjectName = getPluginConfigActivityProject();
        if (curProjectName === '') {
            return true;
        }

        let projectConfigJson = await JSON.parse(fs.readFileSync(path.join(curProjectName, "luatide_project.json")).toString());

        if (!projectConfigJson.ignore){
            projectConfigJson.ignore = [];
        }

        let filesChecked = projectConfigJson.appFile;
        let fileIgnored = projectConfigJson.ignore;

        if (tar){
            for (let i = 0; i < tar.length; i++){
                let e = tar[i];

                if (filesChecked.includes(e)){
                    filesChecked.splice(filesChecked.indexOf(e), 1);
                    vscode.window.showWarningMessage("已经删除 " + e + " 文件");
                }
                if (fileIgnored.includes(e)){
                    fileIgnored.splice(fileIgnored.indexOf(e), 1);
                    vscode.window.showWarningMessage("已经删除 " + e + " 文件");
                }
            }
        }
        projectConfigJson.ignore = fileIgnored;
        projectConfigJson.appFile = filesChecked;
        fs.writeFileSync(path.join(curProjectName, "luatide_project.json"), JSON.stringify(projectConfigJson, null, "\t"));

        return true;
    }

    async defIgnore(tar: any) {
        const curProjectName = getPluginConfigActivityProject();
        if (curProjectName === '') {
            return true;
        }

        let projectConfigJson = await JSON.parse(fs.readFileSync(path.join(curProjectName, "luatide_project.json")).toString());

        if (!projectConfigJson.ignore){
            projectConfigJson.ignore = [];
        }

        let filesChecked = projectConfigJson.appFile;
        let fileIgnored = projectConfigJson.ignore;

        if (tar){
            for (let i = 0; i < tar.length; i++){
                let e = tar[i];
                fileIgnored.push(e);
            }
        }
        projectConfigJson.ignore = fileIgnored;
        projectConfigJson.appFile = filesChecked;
        fs.writeFileSync(path.join(curProjectName, "luatide_project.json"), JSON.stringify(projectConfigJson, null, "\t"));

        return true;
    }

    async getOriginalFiles(pPath: any){
        let projectConfigJson = await JSON.parse(fs.readFileSync(path.join(pPath, "luatide_project.json")).toString());

        const appFiles = projectConfigJson.appFile;
        const ignore = projectConfigJson.ignore;

        let retArr: any = [];

        appFiles.forEach((e: any) => {
            retArr.push(e);
        });

        ignore.forEach((e: any) => {
            retArr.push(e);
        });

        return retArr;
    }
}

export class StateMachine {
    constructor() {
    }

    setState(sta: boolean) {
        isUserClose = sta;
    }

    getState() {
        return isUserClose;
    }

    getCurFd() {
        return curFdInWeb;
    }
}