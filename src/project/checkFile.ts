/*
 * @Author: czm
 * @Date: 2022-04-28 21:20:31
 * @LastEditTime: 2022-04-30 02:08:07
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \luatide\src\project\checkFile.ts
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { getCurrentPluginConfigActivityProject, getPluginConfigActivityProject, getPluginConfigUserProjectList, setPluginConfigUserProjectList } from '../plugConfigParse';
import { getDownloadHtmlPath, getDownloadSourcePath, getPluginDefaultModuleList, getActiveProjectSerialPortInfoList, getLuatIDEDataPath } from '../variableInterface';
import { getProjectConfigCorePath, getProjectConfigLibPath, getProjectConfigModuleModel, getProjectConfigMoudlePort, getProjectconfigName, setProjectConfigModuleModel, setProjectConfigModulePort, setProjectConfigProjectName } from './projectConfigParse';
import { selectProjectCorePathOperation, selectProjectLibPathOperation } from './activeProjectOperation';
import { checkSameProjectExistStatusForPluginConfig } from './projectApi';


/*
    check the change of the source code
    Add:
        ignore: {
            "file1": true,
            "file2": false,
        }
*/

let downloadPage: vscode.WebviewPanel | undefined = undefined;
let temPanel: any;

// 工程配置Webview是否被打开
export function checkFilesWebviewIsOpen() {
    return downloadPage ? true : false;
}

// 让Webview恢复到最上层
export function checkFilesWebviewDesk() {
    const column = vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.viewColumn
        : undefined;
    downloadPage?.reveal(column);
}

export async function downloadConfigDisplay(context: vscode.ExtensionContext, files: any, isManual: boolean) {

    //判断是否需要显示webview
    const fileRet: any = await checkFilesType(files.all, files.new, false, isManual);

    if (fileRet) {
        if (downloadPage) {
            return true;
        }
        else {
            const luatideDataPath = getLuatIDEDataPath();
            const extensionPath = path.join(__dirname, '../..');
            downloadPage = vscode.window.createWebviewPanel(
                'download', //仅供内部使用的面板类型
                'LuatIDE 下载配置', //webview 展示标题
                vscode.ViewColumn.Active,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                    localResourceRoots:[vscode.Uri.file(extensionPath),vscode.Uri.file(luatideDataPath)]
                }
            );
        }


        // 获取webview界面
        downloadPage.webview.html = getDownloadPageHtml();

        temPanel = downloadPage;

        /* 实时检测主题颜色变化 */
        vscode.window.onDidChangeActiveColorTheme((e) => {
            temPanel.webview.postMessage(
                {
                    command: "switchTheme",
                    text: e.kind === 1 ? "light" : "dark"
                }
            );
        });

        if (isManual) {
            temPanel.webview.postMessage(
                {
                    command: 'filesChangeInManual',
                    text: {
                        "all": fileRet.all,
                        "new": fileRet.new,
                        "ignore": fileRet.ignore,
                        "isOpenProject": false
                    },
                }
            );
            const pCfginit = new ProjectCfgInit();
            pCfginit.init();
        } else {
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
        }

        downloadPage.webview.onDidReceiveMessage(
            message => receiveMessageHandle(context, downloadPage, message)
        );

        // Reset when the current panel is closed
        downloadPage.onDidDispose(
            () => {
                downloadPage = undefined;
            },
            null,
            context.subscriptions
        );
    }
    return true;
}

/* 打开工程回调 */
export async function displayOpenProjectFiles(context: vscode.ExtensionContext, files: any, proPath: any) {

    //判断是否需要显示webview
    const fileRet: any = await checkFilesType(files.all, files.new, proPath, false);

    if (fileRet) {
        if (downloadPage) {
            return true;
        }
        else {
            const luatideDataPath = getLuatIDEDataPath();
            const extensionPath = path.join(__dirname, '../..');
            downloadPage = vscode.window.createWebviewPanel(
                'download', //仅供内部使用的面板类型
                'LuatIDE 下载配置', //webview 展示标题
                vscode.ViewColumn.Active,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                    localResourceRoots:[vscode.Uri.file(extensionPath),vscode.Uri.file(luatideDataPath)]
                }
            );
        }


        // 获取webview界面
        downloadPage.webview.html = getDownloadPageHtml();

        let temPanel = downloadPage;

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

        downloadPage.webview.onDidReceiveMessage(
            message => receiveMessageHandle(context, downloadPage, message)
        );

        // Reset when the current panel is closed
        downloadPage.onDidDispose(
            () => {
                downloadPage = undefined;
            },
            null,
            context.subscriptions
        );
    }
    return true;
}


// 获取webview的html内容
function getDownloadPageHtml() {
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
async function receiveMessageHandle(context: vscode.ExtensionContext, downloadPage: any, message: any) {
    switch (message.command) {
        case "downloadConfig":
            const ret = await checkFilesConfig(message.text, false);
            if (ret) {
                downloadPage.dispose();
            }
            break;
        case "downloadConfigWithOpenProject":
            const ret2 = await checkFilesConfig(message.text.fileState, message.text.isOpenProject);
            if (ret2) {
                downloadPage.dispose();
            }
            break;
        case "Alert":
            vscode.window.showErrorMessage(message.text.msg);
            break;
        /*****************************工程配置消息 ↓************************************/
        case 'projectName':
            const projectState:boolean = checkSameProjectExistStatusForPluginConfig(message.text);
            const activityMemoryProjectPath:string = getCurrentPluginConfigActivityProject();
            if (!projectState) {
                setProjectConfigProjectName(message.text,activityMemoryProjectPath);
                const projectJsonObj:any = getPluginConfigUserProjectList();
                const projectList = projectJsonObj.map(x => {
                    if (x.projectPath===activityMemoryProjectPath) {
                        x.projectName = message.text;
                    }
                    return x;
                });
                setPluginConfigUserProjectList(projectList);
            }
            else{
                temPanel?.webview.postMessage(
                    {
                        command:"projectName",
                        text:path.basename(activityMemoryProjectPath)
                    }
                );
                vscode.window.showErrorMessage(`${message.text}工程已经被创建,不允许修改为同名工程`);
            }
            vscode.commands.executeCommand('luatide-history-project.Project.refresh');
            vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
            return;
        case 'coreConfigPath':
            // 执行打开选择core文件夹操作
            const corePath:string|undefined = await selectProjectCorePathOperation();
            if (corePath!==undefined) {
                temPanel?.webview.postMessage(
                    {
                        command:"coreConfigPath",
                        text:corePath
                    }
                );
            }
            return;
        case 'libConfigPath':
            // 执行打开选择lib文件夹操作
            const libPath:string|undefined = await selectProjectLibPathOperation();
            if (libPath!==undefined) {
                temPanel?.webview.postMessage(
                    {
                        command:"libConfigPath",
                        text:libPath
                    }
                );
            }
            return;
        case 'moduleModel':
            // 接收到moduleModel数据处理
            setProjectConfigModuleModel(message.text, getCurrentPluginConfigActivityProject());
            return;
        case 'modulePort':
            // 接收到modulePort数据处理
            const reg = /\[(\w*)\]/ig;
            const comPortList:string[] | null = reg.exec(message.text);
            let comPort:string;
            if (comPortList===null) {
                comPort = "";
            }
            else{
                    comPort = comPortList[1];
            }
            setProjectConfigModulePort(comPort, getCurrentPluginConfigActivityProject());
            return;
        case 'configJsonSelected':
            vscode.commands.executeCommand('vscode.open', vscode.Uri.file(path.join(getCurrentPluginConfigActivityProject(),'luatide_project.json')));
            return;
        default:
            break;
    }
}

/* 分析文件判断是否需要打开webview */
async function checkFilesType(allFiles: any, newFiles: any, isOpenProject: boolean, isManual: boolean) {
    let curProjectName: any;
    if (!isOpenProject) {
        curProjectName = getPluginConfigActivityProject();
    } else {
        curProjectName = isOpenProject;
    }
    if (curProjectName === '' || curProjectName === undefined) {
        return false;
    }

    let projectConfigJson = await JSON.parse(fs.readFileSync(path.join(curProjectName, "luatide_project.json")).toString());

    if (!projectConfigJson.ignore) {
        projectConfigJson.ignore = [];
    }

    let fileIgnored = projectConfigJson.ignore;

    let temNewFiles = newFiles.filter((item: any) => {
        return !item.match(/^(\.luatide|\.vscode|\.git|.svn|ndk)/);
    });

    /* 去除无效文件夹影响 */
    temNewFiles = temNewFiles.filter((item: any) => {
        return item.match(/\w+\.\w+$/g);
    });

    //增加手动打开下载文件目录展示
    if ((temNewFiles.length > 0) || isManual) {
        return {
            "all": allFiles,
            "new": temNewFiles,
            "ignore": fileIgnored,
        };
    }
    return false;
}

/* 分析从 WebView 收到的文件配置 */
async function checkFilesConfig(files: any, proPath: any) {
    let curProjectName: any;

    if (!proPath) {
        curProjectName = getPluginConfigActivityProject();
    } else {
        curProjectName = proPath;
    }

    if (curProjectName === '') {
        return true;
    }

    let projectConfigJson = await JSON.parse(fs.readFileSync(path.join(curProjectName, "luatide_project.json")).toString());

    if (!projectConfigJson.ignore) {
        projectConfigJson.ignore = [];
    }

    let appFile: any = [],
        ignore: any = [];
    for (let key in files) {
        if (files[key]) {
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


/* 获取工程的配置文件 弃用*/
export async function getProjectConfigFiles(tar: any) {
    const curProjectName = getPluginConfigActivityProject();
    if (curProjectName === '') {
        return true;
    }

    let projectConfigJson = await JSON.parse(fs.readFileSync(path.join(curProjectName, "luatide_project.json")).toString());

    if (!projectConfigJson.ignore) {
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

    if (tar) {
        if (Array.isArray(tar)) {
            for (let i = 0; i < tar.length; i++) {
                let e = tar[i];
                if (!e.match(/^\.luatide/)) {
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
                            } else {
                                fileIgnored.push(e);
                            }
                        }
                    } else if (floderAll === "all") {
                        fileIgnored.push(e);
                    } else if (floderAll === "none") {
                        filesChecked.push(e);
                    } else {
                        filesChecked.push(e);
                    }
                }
            }
        } else {
            if (!tar.match(/^\.luatide/)) {
                tipsToUser = path.basename(tar);
                msgOptions = "是否添加文件 " + tipsToUser + " 到下载列表，是：添加，否则不添加";
                const downOption = await vscode.window.showInformationMessage(msgOptions, { modal: true }, "是");
                if (downOption === '是') {
                    filesChecked.push(tar);
                } else {
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

export async function delFiles(tar: any) {
    const curProjectName = getPluginConfigActivityProject();
    if (curProjectName === '' || curProjectName === undefined) {
        return false;
    }

    let projectConfigJson = await JSON.parse(fs.readFileSync(path.join(curProjectName, "luatide_project.json")).toString());

    if (!projectConfigJson.ignore) {
        projectConfigJson.ignore = [];
    }

    let filesChecked = projectConfigJson.appFile;
    let fileIgnored = projectConfigJson.ignore;

    if (tar) {
        for (let i = 0; i < tar.length; i++) {
            let e = tar[i];

            if (filesChecked.includes(e)) {
                filesChecked.splice(filesChecked.indexOf(e), 1);
                vscode.window.showWarningMessage("已经删除 " + e + " 文件");
            }
            if (fileIgnored.includes(e)) {
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

// async function defIgnore(tar: any) {
//     const curProjectName = getPluginConfigActivityProject();
//     if (curProjectName === '') {
//         return true;
//     }

//     let projectConfigJson = await JSON.parse(fs.readFileSync(path.join(curProjectName, "luatide_project.json")).toString());

//     if (!projectConfigJson.ignore){
//         projectConfigJson.ignore = [];
//     }

//     let filesChecked = projectConfigJson.appFile;
//     let fileIgnored = projectConfigJson.ignore;

//     if (tar){
//         for (let i = 0; i < tar.length; i++){
//             let e = tar[i];
//             fileIgnored.push(e);
//         }
//     }
//     projectConfigJson.ignore = fileIgnored;
//     projectConfigJson.appFile = filesChecked;
//     fs.writeFileSync(path.join(curProjectName, "luatide_project.json"), JSON.stringify(projectConfigJson, null, "\t"));

//     return true;
// }

// 获取工程配置文件中记录的文件列表(appfile+ignore)
export async function getOriginalFiles(pPath: any) {
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


/* 活动工程配置 ↓ */
class ProjectCfgInit {
    constructor() {
    };

    private serialportList: string[] = [];
    private activityMemoryProjectPath: string = "";
    private corePath: string = "";
    private libPath: string = "";
    private moduleModel: string = "";
    private modulePort: string = "";
    private moduleModelArray: any;
    private modulePortArray: any;
    private firstSendData = true;
    private timeId: any = undefined;

    async init() {
        this.serialportList = [];
        this.activityMemoryProjectPath = getCurrentPluginConfigActivityProject();
        this.corePath = getProjectConfigCorePath(this.activityMemoryProjectPath);
        this.libPath = getProjectConfigLibPath(this.activityMemoryProjectPath);
        this.moduleModel = getProjectConfigModuleModel(this.activityMemoryProjectPath);
        this.modulePort = getProjectConfigMoudlePort(this.activityMemoryProjectPath);
        this.moduleModelArray = getPluginDefaultModuleList();
        this.modulePortArray = await getActiveProjectSerialPortInfoList();

        // 定时轮询更新活动工程配置
        this.updtaeSerialPort();
    }


    // 实时监听配置数据，尤其是本地串口变化，并发送至前端
    async updtaeSerialPort() {
        if (this.timeId){
            clearInterval(this.timeId);
        }
        const serialportListNew = await getActiveProjectSerialPortInfoList();
        const corePathNew = getProjectConfigCorePath(this.activityMemoryProjectPath);
        const libPathNew = getProjectConfigLibPath(this.activityMemoryProjectPath);
        const moduleModelNew = getProjectConfigModuleModel(this.activityMemoryProjectPath);
        const modulePortNew = getProjectConfigMoudlePort(this.activityMemoryProjectPath);
        const projectName = getProjectconfigName(this.activityMemoryProjectPath);
        this.moduleModelArray = getPluginDefaultModuleList();
        this.modulePortArray =  await getActiveProjectSerialPortInfoList();
        // 暂时先以长度做相似性判断，防止遍历对性能影响过大
        if (serialportListNew.length !== this.serialportList.length || corePathNew !== this.corePath ||
            libPathNew !== this.libPath || moduleModelNew !== this.moduleModel || modulePortNew !== this.modulePort || this.firstSendData) {
            this.firstSendData = false;
            temPanel?.webview.postMessage(
                {
                    command: "initConfigData",
                    text: {
                        "projectName":projectName,
                        "corePath": corePathNew,
                        "libPath": libPathNew,
                        "moduleModel": moduleModelNew,
                        "modulePort": modulePortNew,
                        "moduleModelArray": this.moduleModelArray,
                        "modulePortArray":this.modulePortArray
                    }
                }
            );
        }
        this.serialportList = serialportListNew;
        this.corePath = corePathNew;
        this.libPath = libPathNew;
        this.moduleModel = moduleModelNew;
        this.modulePort = modulePortNew;
        setTimeout(() => {
            this.timeId = this.updtaeSerialPort();
        }, 1000);
    }
}


