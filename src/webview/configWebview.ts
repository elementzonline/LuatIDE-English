import * as vscode from 'vscode';
import * as fs from 'fs';
import { getCurrentPluginConfigActivityProject } from '../plugConfigParse';
import { getProjectConfigCorePath, getProjectConfigLibPath, getProjectConfigModuleModel, getProjectConfigMoudlePort, setProjectConfigModuleModel, setProjectConfigModulePort } from '../project/projectConfigParse';
import { getActiveProjectHtmlPath, getPluginDefaultModuleList, getSerialPortInfoList } from '../variableInterface';
import * as path from 'path';
import { selectProjectCorePathOperation, selectProjectLibPathOperation } from '../project/activeProjectOperation';
let configPanel: vscode.WebviewPanel | undefined = undefined;

// 执行打开或更新活动工程配置webview界面操作
export async function activeProjectConfig(context: vscode.ExtensionContext) {
    const column = vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.viewColumn
        : undefined;
    if (configPanel) {
        configPanel.reveal(column);
    }
    else {
        configPanel = vscode.window.createWebviewPanel(
            'Active Project Config', // Identifies the type of the webview. Used internally
            'LuatIDE Active Project Config', // Title of the panel displayed to the user
            vscode.ViewColumn.One, // Editor column to show the new webview panel in.
            {
                enableScripts: true,
                retainContextWhenHidden: true
            } // Webview options. More on these later.
        );
    }
    let serialportList:string[] = [];

    let activityMemoryProjectPath: string = getCurrentPluginConfigActivityProject();
    let corePath: string = getProjectConfigCorePath(activityMemoryProjectPath);
    let libPath: string = getProjectConfigLibPath(activityMemoryProjectPath);
    let moduleModel: string = getProjectConfigModuleModel(activityMemoryProjectPath);
    let modulePort: string = getProjectConfigMoudlePort(activityMemoryProjectPath);
    let moduleModelArray: string[] = getPluginDefaultModuleList();
    let modulePortArray: string[] =  await getSerialPortInfoList();
    // 发送原始配置数据至前端
    configPanel.webview.postMessage(
        {
            command: "initConfigData",
            text: {
                "corePath": corePath,
                "libPath": libPath,
                "moduleModel": moduleModel,
                "modulePort": modulePort,
                "moduleModelArray": moduleModelArray,
                "modulePortArray":modulePortArray
            }
        }
    );

    // 实时监听配置数据，尤其是本地串口变化，并发送至前端
    async function updtaeSerialPort() {
        const serialportListNew = await getSerialPortInfoList();
        const corePathNew = getProjectConfigCorePath(activityMemoryProjectPath);
        const libPathNew = getProjectConfigLibPath(activityMemoryProjectPath);
        const moduleModelNew = getProjectConfigModuleModel(activityMemoryProjectPath);
        const modulePortNew = getProjectConfigMoudlePort(activityMemoryProjectPath);
        moduleModelArray = getPluginDefaultModuleList();
        modulePortArray =  await getSerialPortInfoList();
        // 暂时先以长度做相似性判断，防止遍历对性能影响过大
        if (serialportListNew.length!==serialportList.length || corePathNew!==corePath || 
            libPathNew!==libPath || moduleModelNew !==moduleModel ||  modulePortNew !== modulePort) {
            configPanel?.webview.postMessage(
                {
                    command: "initConfigData",
                    text: {
                        "corePath": corePathNew,
                        "libPath": libPathNew,
                        "moduleModel": moduleModelNew,
                        "modulePort": modulePortNew,
                        "moduleModelArray": moduleModelArray,
                        "modulePortArray":modulePortArray
                    }
                }
            );
        }
        serialportList = serialportListNew;
        corePath  = corePathNew;
        libPath = libPathNew;
        moduleModel  = moduleModelNew;
        modulePort = modulePortNew;
    }
    // 定时轮询更新活动工程配置
    setInterval(updtaeSerialPort,2000);
    
    // And set its HTML content
    configPanel.webview.html = getWebviewContent();

    //获取webview所需html资源    
    function getWebviewContent() {
        const activeProjectConfigPath = getActiveProjectHtmlPath();
        const html = fs.readFileSync(activeProjectConfigPath, 'utf-8');
        return html;
    }

    configPanel.webview.onDidReceiveMessage(
        async message => {
            switch (message.command) {
                case 'alert':
                    vscode.window.showInformationMessage(message.text);
                    return;
                case 'coreConfigPath':
                    // 执行打开选择core文件夹操作
                    const corePath:string|undefined = await selectProjectCorePathOperation();
                    if (corePath!==undefined) {
                        configPanel?.webview.postMessage(
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
                        configPanel?.webview.postMessage(
                            {
                                command:"libConfigPath",
                                text:libPath
                            }
                        );
                    }
                    return;
                case 'moduleModel':
                    // 接收到moduleModel数据处理
                    setProjectConfigModuleModel(message.text,activityMemoryProjectPath);
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
                    setProjectConfigModulePort(comPort,activityMemoryProjectPath);
                    return;
                case 'configJsonSelected':
                    // 接收到用户选择打开configJson文件处理,后续考虑定位到相应行(软件开销较大)
                    // switch (message.text) {
                    //     case 'corePath':
                    //         // 执行打开json文件功能
                    //         vscode.commands.executeCommand('vscode.open', vscode.Uri.file(path.join(activityMemoryProjectPath,'luatide_project.json')));
                    //         break;
                    //     case 'libPath':
                    //         // 执行打开json文件功能
                    //         vscode.commands.executeCommand('vscode.open', vscode.Uri.file(path.join(activityMemoryProjectPath,'luatide_project.json')));
                    //         break;
                    //     case 'moduleModel':
                    //         vscode.commands.executeCommand('vscode.open', vscode.Uri.file(path.join(activityMemoryProjectPath,'luatide_project.json')));
                    //         // 执行打开json文件功能
                    //         break;
                    //     case 'modulePort':
                    //         // 执行打开json文件功能
                    //         vscode.commands.executeCommand('vscode.open', vscode.Uri.file(path.join(activityMemoryProjectPath,'luatide_project.json')));
                    //         break;
                    //     default:
                    //         break;
                    // }
                    vscode.commands.executeCommand('vscode.open', vscode.Uri.file(path.join(activityMemoryProjectPath,'luatide_project.json')));
                    return;
            }
        },
        undefined,
        context.subscriptions
    );
    configPanel.onDidDispose(
        () => {
            configPanel = undefined;
        },
        null,
        context.subscriptions
    );
}

