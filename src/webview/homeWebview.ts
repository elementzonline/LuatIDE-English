// import { PluginVariablesInit } from '../config';
import * as vscode from 'vscode';
import * as fs from 'fs';
import path = require('path');
import { getDefaultProjectName } from '../project/ProjectHandle';
// import { PluginJsonParse } from '../plugConfigParse';
import { CreateProject } from '../project/createProject';
import * as fetch from 'node-fetch';
import {checkSameProjectExistStatusForPluginConfig, getCreateProjectCorepathHandle, getCreateProjectLibpathHandle, getFileForDirRecursion, projectActiveInterfact} from '../project/projectApi';
// import { ProjectJsonParse } from '../project/projectConfigParse';
import { OpenProject } from '../project/openProject';

import {getAir72XCXModuleModelName, getAir72XUXDefaultLibList, getDefaultCoreList, getDefaultExampleList, getDefaultWorkspacePath, getHistoryCorePath, getHistoryLibPath, getHomeHtmlPath, getHomeSourcePath, getLuatIDEDataPath, getNdkDefaultExampleList, getNewsApi, getPluginDefaultModuleList, getPluginInstallVersion } from '../variableInterface';

import {getNdkProject} from  "../ndk/ndkCodeDownload";
import { pushPluginConfigProject, setPluginConfigActivityProject } from '../plugConfigParse';
import { getprojectConfigInitVersion, setProjectConfigCorePath, setProjectConfigLibPath, setProjectConfigModuleModel, setProjectConfigProjectName, setProjectConfigProjectType, setProjectConfigVersion } from '../project/projectConfigParse';
import * as uiDesignUpdate from '../ui/uiDesignSourceUpdate';
import { ImportLuatToolsProjectClass } from '../project/importLuatToolsProject';
import { showOpenDialog } from '../project/activeProjectOperation';
import { activeProjectManage } from '../project/checkFileWebview';
// import * as checkFile from '../project/checkFile';
// let pluginVariablesInit = new PluginVariablesInit();                                             
// let projectConfigOperation = new ProjectConfigOperation();
// let pluginJsonParse = new PluginJsonParse();
let createProject = new CreateProject();
// let projectJsonParse = new ProjectJsonParse();
let openProject = new OpenProject();
/* ?????? LuatTools ????????????????????? */
let importLuatToolsProject = new ImportLuatToolsProjectClass();
// let disOpenProjectFiles = new CheckFiles();
export const sleep = (ms)=> {
    return new Promise(resolve=>setTimeout(resolve, ms));
};

export class HomeManage {
    constructor() {

    }
    homePanel: vscode.WebviewPanel | undefined = undefined;
    // private importProjectInitJson:any;
    private openProjectJson:any;
    // private parse for luatTools import project
    private luatToolsData: any;
    // ????????????webview??????
    homeManage(context:vscode.ExtensionContext,homeLoadingState:any=undefined,openProjectJson:any={}) {
        this.openProjectJson =openProjectJson;
        const columnToShowIn = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // ???????????????????????????????????????home?????????????????????
        if (this.homePanel) {
            this.homePanel.reveal(columnToShowIn);
            if (homeLoadingState) {
                switch (homeLoadingState) {
                    case 'loadNewProjectModelBox':
                        this.homePanel.webview.postMessage(
                            {
                                command: 'loadNewProjectModelBox'
                            }
                        );
                        break;
                    case 'loadOpenProjectModelBox':
                        this.homePanel.webview.postMessage(
                            {
                                command: 'loadOpenProjectModelBox'
                            }
                        );
                        this.homePanel.webview.postMessage(
                            {
                                command: 'importProjectData',
                                text: this.openProjectJson
                            }
                        );
                        break;
                }
            }
            return;
        }
        else {
            const luatideDataPath = getLuatIDEDataPath();
            const extensionPath = path.join(__dirname, '../..');
            this.homePanel = vscode.window.createWebviewPanel(
                'Home', //?????????????????????????????????
                'Luatide homepage', //webview ????????????
                vscode.ViewColumn.Active,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                    localResourceRoots:[vscode.Uri.file(extensionPath),vscode.Uri.file(luatideDataPath)]
                }
            );
        }

        // ??????webview??????
        this.homePanel.webview.html = this.getHomeWebviewContent();

        this.homePanel.webview.onDidReceiveMessage(
            message => this.receiveMessageHandle(context,this.homePanel, message,homeLoadingState)
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

    // ??????webview???html??????
    getHomeWebviewContent() {
        const homeHtmlJsPath = getHomeSourcePath();
        const homeHtmlPath: string = getHomeHtmlPath();
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

    // ????????????api???????????????json??????
    async getApiJsonFromRemoteServer(url: any) {
        const response: any = await fetch(url);
        const jsonResult: any = await response.json();
        return jsonResult;
    };

    // ???????????????webview?????????vscode-resource??????
    transformUrlToVscodeResourceUrl(panel: any, url: any) {
        const resouceUrl = vscode.Uri.file(url);
        const vscodeResouceUrl = panel.webview.asWebviewUri(resouceUrl);
        return vscodeResouceUrl;
    }

    // ?????????webview???????????????
    async receiveMessageHandle(context:vscode.ExtensionContext,homePanel: any, message: any,homeLoadingState:any) {
        // let activityProjectPath: string = getPluginConfigActivityProject();
        const pluginDefaultModuleList: string[] = getPluginDefaultModuleList();
        const air72XCXModuleModelName = getAir72XCXModuleModelName();
        // const pluginDefaultAir101Example:string[] = getAir101DefaultExampleList();
        const pluginDefaultAir101Example:string[] = getDefaultExampleList('air101');
        const pluginDefaultAir103Example:string[] = getDefaultExampleList('air103');
        const pluginDefaultAir105Example:string[] = getDefaultExampleList('air105');
        const pluginDefaultEsp32c3Example:string[] = getDefaultExampleList('esp32c3');
        const pluginDefaultAir72XUXExample:string[] = getDefaultExampleList('air72XUX/air82XUX');
        let pluginDefaultNdkExample:string[];
        const air72XUXLibList:string[] = getAir72XUXDefaultLibList();
        // const air72XUXCoreList:string[] = getAir72XUXDefaultCoreList();
        const air72XUXCoreList:string[] = getDefaultCoreList('air72XUX/air82XUX');
        const air101CoreList:string[] = getDefaultCoreList('air101');
        const air103CoreList:string[] = getDefaultCoreList('air103');
        const air105CoreList:string[] = getDefaultCoreList('air105');
        const esp32c3CoreList:string[] = getDefaultCoreList('esp32c3');
        const air72XCXCoreList:string[] = getDefaultCoreList(air72XCXModuleModelName);
        const air101LibList:string[] = []; 
        const air103LibList:string[] = []; 
        const air105LibList:string[] = []; 
        const esp32c3LibList:string[] = [];
        const pluginDefaultWorkspacePath:string = getDefaultWorkspacePath();
        const pluginDefaultProjectName:string = getDefaultProjectName();
        switch (message.command) {
            case 'homePageReady':
                // ??????vscode????????????
                const colorTheme = vscode.window.activeColorTheme.kind === 1 ? 'light' : 'dark';
                homePanel.webview.postMessage(
                    {
                        command: 'switchTheme',
                        text: colorTheme    
                    }
                );
                sleep(100);
                // ??????ide?????????????????????????????????
                const pluginInstallVersion:any =  getPluginInstallVersion();
                if (pluginInstallVersion) {
                    homePanel.webview.postMessage(
                        {
                            command: 'ideVersion',
                            text: "Version: " + pluginInstallVersion
                        }
                    );
                }
                sleep(100);
                // ????????????????????????
                this.newsJsonGenerate(homePanel);
                sleep(10);
                /* ?????????????????????????????? */
                vscode.window.onDidChangeActiveColorTheme((e) => {
                    homePanel.webview.postMessage(
                        {
                            command: "switchTheme",
                            text: e.kind === 1 ? "light" : "dark"
                        }
                    );
                });

                // ??????home????????????????????????
                if (homeLoadingState) {
                    switch (homeLoadingState) {
                        case 'loadNewProjectModelBox':
                            homePanel.webview.postMessage(
                                {
                                    command: 'loadNewProjectModelBox'
                                }
                            );
                            break;
                        case 'loadOpenProjectModelBox':
                            homePanel.webview.postMessage(
                                {
                                    command: 'loadOpenProjectModelBox'
                                }
                            );
                            sleep(10);
                            homePanel.webview.postMessage(
                                {
                                    command: 'importProjectData',
                                    text: this.openProjectJson
                                }
                            );
                            break;
                    }
                }
                break;
            case 'openNewProjectWebview':
                break;
            case 'openProjectWebview':
                const openProjectUserControlJson:string[]|undefined = await openProject.openProjectUserControl(context);
                if (openProjectUserControlJson!==undefined) {
                    this.openProjectJson = openProjectUserControlJson;
                    let openPath = openProject.getOpenProjectPath();
                    this.displayOpenProjectFiles(openPath, context);
                    homePanel.webview.postMessage(
                        {
                            command: 'importProjectData',
                            text: this.openProjectJson
                        }
                    );
                }
                else{
                    return undefined;
                }
                break;
                /* ?????? LuatTools ?????? */ 
            case 'importLuatToolsProject':
                /* ??????????????? LuatTools ????????????????????? */
                const importLuatToolsData: any = await importLuatToolsProject.openFileSystemControl(context);
                if (importLuatToolsData !== undefined) {
                    if (typeof(importLuatToolsData) === "string"){
                        if (importLuatToolsData.match(/^ERROR: /)){
                            vscode.window.showErrorMessage(`LuatTools The address in the project is: \n ${importLuatToolsData.replace(/ERROR: /, "")} The file does not exist, please check it after checking`);
                            return undefined;
                        }
                        return undefined;
                    } else{
                        this.luatToolsData = importLuatToolsData[0];
                        this.openProjectJson = importLuatToolsData[1];
                        homePanel.webview.postMessage(
                            {
                                command: 'importProjectData',
                                text: this.openProjectJson
                            }
                        );
                        // vscode.window.showInformationMessage("LuatTools ??????????????????");
                        // ???????????????????????????????????????
                        // setPluginConfigActivityProject(path.join(importLuatToolsData[0], importLuatToolsData[1]));
                        // projectActiveInterfact(importLuatToolsData[1], path.join(importLuatToolsData[0], importLuatToolsData[1]));
                        // vscode.commands.executeCommand('luatide-history-project.Project.refresh');
                    }
                }
                else{
                    return undefined;
                }
                break;
            case 'openExternalWeb':
                switch (message.text) {
                    case 'Tool source code': 
                        vscode.commands.executeCommand('luatide.SourceCode');
                        break;
                    case 'QQ':
                        vscode.commands.executeCommand('luatide.technicalSupport');
                        break;
                    case 'contact us':
                        vscode.commands.executeCommand('luatide.contactUs');
                        break; 
                    case 'register':
                        vscode.commands.executeCommand('luatide.register');
                        break;
                    case "LuatOSWiki":
                        vscode.commands.executeCommand('luatide.luatosWiki');
                        break;
                }
                break;
            // ??????????????????????????????
            case 'projectType':
                console.log(message.text);
                switch (message.text) {
                    case 'pure':
                        // ??????pure???????????????????????????
                        homePanel.webview.postMessage(
                            {
                                command: 'pureProjectInitData',
                                text: {
                                    "moduleList": pluginDefaultModuleList,
                                    "libList": {
                                        "air72XUX/air82XUX": air72XUXLibList,
                                        "air72XCX/air60XCX/air78XCX" :air72XUXLibList,
                                        "air101": air101LibList,
                                        "air103": air103LibList,
                                        "air105": air105LibList,
                                        "esp32c3":esp32c3LibList,
                                    },
                                    "coreList": {
                                        "air72XUX/air82XUX": air72XUXCoreList,
                                        "air72XCX/air60XCX/air78XCX" :air72XCXCoreList,
                                        "air101": air101CoreList,
                                        "air103": air103CoreList,
                                        "air105": air105CoreList,
                                        "esp32c3":esp32c3CoreList,
                                    },
                                    "defaultProjectPath":pluginDefaultWorkspacePath,
                                    "defaultProjectName":pluginDefaultProjectName,
                                }
                            }
                        );
                        break;
                    case 'example':
                        // ??????example??????????????????
                        homePanel.webview.postMessage(
                            {
                                command: 'exampleProjectInitData',
                                text: {
                                    "moduleList": pluginDefaultModuleList,
                                    "exampleList": {
                                        "air72XUX/air82XUX": pluginDefaultAir72XUXExample,
                                        "air72XCX/air60XCX/air78XCX":pluginDefaultAir72XUXExample,
                                        "air101": pluginDefaultAir101Example,
                                        "air103": pluginDefaultAir103Example,
                                        "air105": pluginDefaultAir105Example,
                                        "esp32c3":pluginDefaultEsp32c3Example,
                                    },
                                    "coreList": {
                                        "air72XUX/air82XUX": air72XUXCoreList,
                                        "air72XCX/air60XCX/air78XCX":air72XCXCoreList,
                                        "air101": air101CoreList,
                                        "air103": air103CoreList,
                                        "air105": air105CoreList,
                                        "esp32c3":esp32c3CoreList,
                                    },
                                    "defaultProjectPath":pluginDefaultWorkspacePath,
                                    "defaultProjectName":pluginDefaultProjectName,
                                },
                            }
                        );
                        break;
                    case 'ndk':
                        await getNdkProject();
                        pluginDefaultNdkExample = getNdkDefaultExampleList();
                        // ??????ndk??????????????????
                        homePanel.webview.postMessage({
                            command: 'ndkProjectInitData',
                            text: {
                                "moduleList": ['air72XUX/air82XUX'],
                                "libList": {
                                    "air72XUX/air82XUX": air72XUXLibList,
                                    "air72XCX/air60XCX/air78XCX":[],
                                    "air101": [],
                                    "air103": [],
                                    "air105": [],
                                    "esp32c3":[],
                                },
                                "coreList": {
                                    "air72XUX/air82XUX": air72XUXCoreList,
                                    "air72XCX/air60XCX/air78XCX":[],
                                    "air101": [],
                                    "air103": [],
                                    "air105": [],
                                    "esp32c3":[],
                                },
                                "exampleList": {
                                    "air72XUX/air82XUX": pluginDefaultNdkExample,
                                    "air72XCX/air60XCX/air78XCX":[],
                                    "air101": [],
                                    "air103": [],
                                    "air105": [],
                                    "esp32c3":[],
                                },
                                "defaultProjectPath":pluginDefaultWorkspacePath,
                                "defaultProjectName":pluginDefaultProjectName,
                            },
                        }
                        );
                        break;
                    case 'ui':
                        await uiDesignUpdate.uiProjectCheckUpdate();
                        // ??????ui??????????????????
                        homePanel.webview.postMessage(
                            {
                                command: 'uiProjectInitData',
                                text: {
                                    "moduleList": pluginDefaultModuleList,
                                    "libList": {
                                        "air72XUX/air82XUX": air72XUXLibList,
                                        "air72XCX/air60XCX/air78XCX":air72XUXLibList,
                                        "air101": air101LibList,
                                        "air103": air103LibList,
                                        "air105": air105LibList,
                                        "esp32c3":esp32c3LibList,
                                    },
                                    "coreList": {
                                        "air72XUX/air82XUX": air72XUXCoreList,
                                        "air72XCX/air60XCX/air78XCX":air72XCXCoreList,
                                        "air101": air101CoreList,
                                        "air103": air103CoreList,
                                        "air105": air105CoreList,
                                        "esp32c3":esp32c3CoreList,
                                    },
                                    "defaultProjectPath":pluginDefaultWorkspacePath,
                                    "defaultProjectName":pluginDefaultProjectName,
                                },
                            }
                        );
                        break;
                }
                break;
            // ??????webview????????????????????????????????????????????????????????????
            case 'openSource':
                console.log(message.text);
                switch (message.text) {
                    case 'customProjectPath':
                        const customProjectOptions = {
                            canSelectFiles: false,		//??????????????????
                            canSelectFolders: true,		//?????????????????????
                            canSelectMany: false,		//????????????????????????
                            defaultUri: vscode.Uri.file(getDefaultWorkspacePath()),	//????????????????????????
                            openLabel: 'Select engineering folder'
                        };
                        const customProjectPathResult:any = await showOpenDialog(customProjectOptions);
                        if (customProjectPathResult!==undefined) {
                            const customProjectPath = customProjectPathResult[0].fsPath;
                            homePanel.webview.postMessage(
                                {
                                    command: "customProjectPath",
                                    text: customProjectPath,
    
                                }
                            );
                        }
                        // console.log(selectPath);
                        break;
                    // ??????webview??????????????????????????????????????????lib????????????
                    case 'customLibPath':
                        const customLibOptions = {
                            canSelectFiles: false,		//??????????????????
                            canSelectFolders: true,		//?????????????????????
                            canSelectMany: false,		//????????????????????????
                            defaultUri: vscode.Uri.file(getHistoryLibPath()),	//????????????????????????
                            openLabel: 'Select the project lib folder'
                        };
                        const customLibPathResult = await showOpenDialog(customLibOptions);
                        if (customLibPathResult!==undefined) {
                            const customLibPath:string = customLibPathResult[0].fsPath;
                            homePanel.webview.postMessage(
                                {
                                    command: "customLibPath",
                                    text: customLibPath,
    
                                }
                            );
                        }
                        // console.log(selectPath);
                        break;

                    // ??????webview??????????????????????????????????????????core????????????
                    case 'customCorePath':
                        const customCoreOptions = {
                            canSelectFiles: true,		//??????????????????
                            canSelectFolders: false,		//?????????????????????
                            canSelectMany: false,		//????????????????????????
                            defaultUri: vscode.Uri.file(getHistoryCorePath()),	//????????????????????????
                            openLabel: 'Select the project Core folder',
                            filters: {
                                json: ['pac', "soc","zip"], // ??????????????????
                            },
                        };
                        const customCorePathResult = await showOpenDialog(customCoreOptions);
                        if (customCorePathResult!==undefined) {
                            const customCorePath = customCorePathResult[0].fsPath;
                            homePanel.webview.postMessage(
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
            // ??????webview?????????????????????????????????webview
            case 'cancelProject':
                homePanel.dispose();
                break;
            case 'Alert':
                vscode.window.showErrorMessage(message.text['msg'],{modal: true});
                break;
            // ????????????pure??????????????????
            case "pureProject":
                createProject.createPureProject(message);
                break;
            // ????????????example??????????????????
            case "exampleProject":
                createProject.createExampleProject(message);
                break;
            // ????????????ndk??????????????????
            case "ndkProject":
                createProject.createNdkProject(message);
                break;
            // ????????????ui??????????????????
            case "uiProject":
                createProject.createUiProject(message);
                break;
            // ??????????????????????????????
            case 'importProject':
                // ??????????????????????????????????????????
                if (message.text.type === "luatTools") {
                    let importRet = await importLuatToolsProject.checkLuatToolsProjectCorrectWithInterface(message, this.luatToolsData);
                    if (typeof(importRet) === "string"){
                        if (importRet === "core find failed"){
                            vscode.window.showErrorMessage("LuatTools Engineering CORE The file is lacking, please review it after checking!");
                            return undefined;
                        } else if (importRet.match(/^ERROR: /)){
                            vscode.window.showErrorMessage(`LuatTools The address in the project is: \n ${importRet.replace(/ERROR: /, "")} ??????????????????????????????????????????`);
                            return undefined;
                        }
                        return undefined;
                    } else if (typeof(importRet) === "object") {
                        vscode.window.showInformationMessage("LuatTools Successful engineering introduction");
                        // ???????????????????????????????????????
                        setPluginConfigActivityProject(path.join(importRet[0], importRet[1]));
                        projectActiveInterfact(importRet[1], path.join(importRet[0], importRet[1]));
                        vscode.commands.executeCommand('luatide-history-project.Project.refresh');
                    }
                } else {
                    this.openProjectReceiveDataHandle(message);
                }
                break;
            // ??????webview????????????????????????????????????????????????????????????
            case 'openSourceOpenProject':
                console.log(message.text);
                switch (message.text) {
                    case 'customProjectPathOpenProject':
                        const customProjectOptions = {
                            canSelectFiles: false,		//??????????????????
                            canSelectFolders: true,		//?????????????????????
                            canSelectMany: false,		//????????????????????????
                            defaultUri: vscode.Uri.file(getDefaultWorkspacePath()),	//????????????????????????
                            openLabel: 'Choose a folder that needs to be imported'
                        };
                        const customProjectPathResult = await showOpenDialog(customProjectOptions);
                        let customProjectPath:string|undefined;
                        if (customProjectPathResult!==undefined) {
                            customProjectPath = customProjectPathResult[0].fsPath;
                        }
                        else {
                            customProjectPath = undefined;
                        }
                        homePanel.webview.postMessage(
                            {
                                command: "customProjectPathOpenProject",
                                text: customProjectPath,

                            }
                        );
                        // console.log(selectPath);
                        break;
                    // ??????webview??????????????????????????????????????????lib????????????
                    case 'customLibPathOpenProject':
                        const customLibOptions = {
                            canSelectFiles: false,		//??????????????????
                            canSelectFolders: true,		//?????????????????????
                            canSelectMany: false,		//????????????????????????
                            defaultUri: vscode.Uri.file(getHistoryLibPath()),	//????????????????????????
                            openLabel: 'Choose a folder that needs to be imported'
                        };
                        const customLibPathResult = await showOpenDialog(customLibOptions);
                        let customLibPath:string|undefined;
                        if (customLibPathResult!==undefined) {
                            customLibPath = customLibPathResult[0].fsPath;
                        }
                        else {
                            customLibPath = undefined;
                        }
                        homePanel.webview.postMessage(
                            {
                                command: "customLibPathOpenProject",
                                text: customLibPath,

                            }
                        );
                        // console.log(selectPath);
                        break;

                    // ??????webview??????????????????????????????????????????core????????????
                    case 'customCorePathOpenProject':
                        const customCoreOptions = {
                            canSelectFiles: true,		//??????????????????
                            canSelectFolders: false,		//?????????????????????
                            canSelectMany: false,		//????????????????????????
                            defaultUri: vscode.Uri.file(getHistoryCorePath()),	//????????????????????????
                            openLabel: 'Choose a base bag',
                            filters: {
                                json: ['pac', "soc","zip"], // ??????????????????
                            },
                        };
                        const customCorePathResult = await showOpenDialog(customCoreOptions);
                        let customCorePath:string|undefined;
                        if (customCorePathResult!==undefined) {
                            customCorePath = customCorePathResult[0].fsPath;
                        }
                        else {
                            customCorePath = undefined;
                        }
                        homePanel.webview.postMessage(
                            {
                                command: "customCorePathOpenProject",
                                text: customCorePath,

                            }
                        );
                        // console.log(selectPath);
                        break;
                }
                break;
            case 'getImportProjectInitData':
                // console.log('test');
                switch (this.openProjectJson.type) {
                    case 'ndk':
                        pluginDefaultNdkExample = getNdkDefaultExampleList();
                        homePanel.webview.postMessage(
                            {
                                command: "importProjectInitData",
                                text: {
                                    'projectType':this.openProjectJson.type,
                                    "data":{
                                        "moduleList": ['air72XUX/air82XUX'],
                                        "libList": {
                                            "air72XUX/air82XUX": air72XUXLibList,
                                            "air72XCX/air60XCX/air78XCX":[],
                                            "air101": [],
                                            "air103": [],
                                            "air105": [],
                                            "esp32c3":[],
                                        },
                                        "coreList": {
                                            "air72XUX/air82XUX": air72XUXCoreList,
                                            "air72XCX/air60XCX/air78XCX":[],
                                            "air101": [],
                                            "air103": [],
                                            "air105": [],
                                            "esp32c3":[],
                                        },
                                        "exampleList": {
                                            "air72XUX/air82XUX": pluginDefaultNdkExample,
                                            "air72XCX/air60XCX/air78XCX":[],
                                            "air101": [],
                                            "air103": [],
                                            "air105": [],
                                            "esp32c3":[],
                                        },
                                },
                                },
                            });
                        break;
                    default:
                        homePanel.webview.postMessage(
                            {
                                command: "importProjectInitData",
                                text: {
                                    'projectType':this.openProjectJson.type,
                                    "data":{
                                    "moduleList": pluginDefaultModuleList,
                                    "libList": {
                                        "air72XUX/air82XUX": air72XUXLibList,
                                        "air72XCX/air60XCX/air78XCX":air72XUXLibList,
                                        "air101": air101LibList,
                                        "air103": air103LibList,
                                        "air105": air105LibList,
                                        "esp32c3":esp32c3LibList,
                                    },
                                    "coreList": {
                                        "air72XUX/air82XUX": air72XUXCoreList,
                                        "air72XCX/air60XCX/air78XCX":air72XCXCoreList,
                                        "air101": air101CoreList,
                                        "air103": air103CoreList,
                                        "air105": air105CoreList,
                                        "esp32c3":esp32c3CoreList,
                                    },
                                    "exampleList": {
                                        "air72XUX/air82XUX": pluginDefaultAir72XUXExample,
                                        "air72XCX/air60XCX/air78XCX":pluginDefaultAir72XUXExample,
                                        "air101": pluginDefaultAir101Example,
                                        "air103": pluginDefaultAir103Example,
                                        "air105": pluginDefaultAir105Example,
                                        "esp32c3":pluginDefaultEsp32c3Example,
                                    },
                                },
                                },
                            });
                        break;
                }
                
            break;
        }
    }
        // ??????????????????webview??????????????????
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
            if (!openProjectCheckState) { //???????????????????????????????????????
                return false;
            }
            // ????????????????????????????????????????????????????????????
            // const nameIndex:number = openProjectMessage.openProjectPath.lastIndexOf("\\");
            // const projectParentPath:string = openProjectMessage.openProjectPath.substring(0,nameIndex);
            const projectObj = {
                projectPath:openProjectMessage.openProjectPath,
                projectName:openProjectMessage.openProjectName,
            };
            pushPluginConfigProject(projectObj);
            setPluginConfigActivityProject(openProjectMessage.openProjectPath);
            const projectConfigVersion:string = getprojectConfigInitVersion();
            setProjectConfigProjectType(openProjectMessage.openProjectProjectType,openProjectMessage.openProjectPath);
            setProjectConfigVersion(projectConfigVersion,openProjectMessage.openProjectPath);
            // ?????????????????????????????????core??????
            const openProjectCorePath:string = getCreateProjectCorepathHandle(openProjectMessage.openProjectCorePath,openProjectMessage.openProjectModuleModel);
            setProjectConfigCorePath(openProjectCorePath,openProjectMessage.openProjectPath);
            // ?????????????????????????????????lib??????
            const openProjectLibPath:string = getCreateProjectLibpathHandle(openProjectMessage.openProjectLibPath,openProjectMessage.openProjectModuleModel);
            setProjectConfigLibPath(openProjectLibPath,openProjectMessage.openProjectPath);
            setProjectConfigModuleModel(openProjectMessage.openProjectModuleModel,openProjectMessage.openProjectPath);
            setProjectConfigProjectName(openProjectMessage.openProjectName,openProjectMessage.openProjectPath);
            // vscode.window.showInformationMessage(`??????${openProjectMessage.openProjectName}????????????????????????????????????????????????`,{modal: true});
            // ???????????????????????????????????????
            projectActiveInterfact(openProjectMessage.openProjectName,openProjectMessage.openProjectPath);
            vscode.commands.executeCommand('luatide-history-project.Project.refresh');
            // vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
        }
    
        // ??????????????????????????????
        openProjectCheck(message:any){
            const projectName:any = message.text.data.projectName;
            const projectPath:any = message.text.data.projectPath;
            const projectModule:any =message.text.data.moduleModel;
            if (projectName === "" || projectPath  === "" || projectModule === "") {
                vscode.window.showErrorMessage("????????????webview??????????????????!!",{modal: true});
                return false;
            }
            const sameProjectExistStatus:boolean = checkSameProjectExistStatusForPluginConfig(projectName);
            // ???????????????????????????????????????????????????
            if (sameProjectExistStatus) {
                vscode.window.showErrorMessage("??????????????????????????????????????????" ,{modal: true});
                return false;
            }
            return true;
        }

        // ??????????????????json?????????????????????
        async getNewsJson(){
            const newsUrl:string = getNewsApi();
            const response: any = await fetch(newsUrl)
            .catch(error => {console.log(error);
                    return undefined;});
            if (response===undefined) {
                return undefined;
            }
            const jsonResult: any =  response.json();
            return jsonResult;
        }

        async newsJsonGenerate(panel:any){
            let newsImageInfoObj:any = {
                'newsImage1':[],
                'newsImage2':[],
                'newsImage3':[]
            };
            const jsonData:any = await this.getNewsJson();
            if (jsonData!==undefined) {
            //     return newsImageInfoObj;
            // }
            // else{
                const image1Url:string = jsonData.data[0].image.url;
                const image1DescriptionUrl:string = jsonData.data[0].url;
                newsImageInfoObj.newsImage1.push(image1Url,image1DescriptionUrl);
                const image2Url:string = jsonData.data[1].image.url;
                const image2DescriptionUrl:string = jsonData.data[1].url;
                newsImageInfoObj.newsImage2.push(image2Url,image2DescriptionUrl);
                const image3Url:string = jsonData.data[2].image.url;
                const image3DescriptionUrl:string = jsonData.data[2].url;
                newsImageInfoObj.newsImage3.push(image3Url,image3DescriptionUrl);
                // return newsImageInfoObj;
            // }
                panel.webview.postMessage(
                    {
                        command: 'homeAdvertisementInfo',
                        text:newsImageInfoObj
                    }
                );
            }
        }

        async displayOpenProjectFiles(path: string, temContext: vscode.ExtensionContext) {
            let files = getFileForDirRecursion(path, "");
            let fileArr = {
                "all": files,
                "new": files,
                "ignore": [],
            };
            // checkFile.displayOpenProjectFiles(temContext, fileArr, path);
            activeProjectManage(temContext,fileArr,false,path);
        }
}