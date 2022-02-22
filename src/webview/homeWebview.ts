// import { PluginVariablesInit } from '../config';
import * as vscode from 'vscode';
import * as fs from 'fs';
import path = require('path');
import { ProjectConfigOperation } from '../project/ProjectHandle';
import { PluginJsonParse } from '../plugConfigParse';
import { CreateProject } from '../project/createProject';
import * as fetch from 'node-fetch';
import {checkSameProjectExistStatusForPluginConfig, getCreateProjectCorepathHandle, getCreateProjectLibpathHandle, projectActiveInterfact} from '../project/projectApi';
import { ProjectJsonParse } from '../project/projectConfigParse';
import { OpenProject } from '../project/openProject';
import { getAir101DefaultCoreList, getAir101DefaultExampleList, getAir103DefaultCoreList, getAir103DefaultExampleList, getAir105DefaultCoreList, getAir105DefaultExampleList, getAir72XUXDefaultCoreList, getAir72XUXDefaultExampleList, getAir72XUXDefaultLibList, getHomeHtmlPath, getHomeSourcePath, getNdkDefaultExampleList, getPluginDefaultModuleList } from '../variableInterface';
import {getNdkProject} from  "../ndk/ndkCodeDownload";
// let pluginVariablesInit = new PluginVariablesInit();
let projectConfigOperation = new ProjectConfigOperation();
let pluginJsonParse = new PluginJsonParse();
let createProject = new CreateProject();
let projectJsonParse = new ProjectJsonParse();
let openProject = new OpenProject();

export class HomeManage {
    constructor() {

    }
    homePanel: vscode.WebviewPanel | undefined = undefined;
    // private importProjectInitJson:any;
    private openProjectJson:any;
    // 工程主页webview管理
    homeManage(context:vscode.ExtensionContext,homeLoadingState:any=undefined,openProjectJson:any={}) {
        this.openProjectJson =openProjectJson;
        const columnToShowIn = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // 如果检测到编辑器区域已存在home面板，则展示它
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
                }
            }
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

        // 执行home加载不同状态命令
        if (homeLoadingState) {
            switch (homeLoadingState) {
                case 'loadNewProjectModelBox':
                    temPanel.webview.postMessage(
                        {
                            command: 'loadNewProjectModelBox'
                        }
                    );
                    break;
            
                case 'loadOpenProjectModelBox':
                    temPanel.webview.postMessage(
                        {
                            command: 'loadOpenProjectModelBox'
                        }
                    );
                    temPanel.webview.postMessage(
                        {
                            command: 'importProjectData',
                            text: this.openProjectJson
                        }
                    );
            }
        }

        this.homePanel.webview.onDidReceiveMessage(
            message => this.receiveMessageHandle(context,this.homePanel, message)
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
    async receiveMessageHandle(context:vscode.ExtensionContext,homePanel: any, message: any) {
        let activityProjectPath: string = pluginJsonParse.getPluginConfigActivityProject();
        const pluginDefaultModuleList: string[] = getPluginDefaultModuleList();
        const pluginDefaultAir101Example:string[] = getAir101DefaultExampleList();
        const pluginDefaultAir103Example:string[] = getAir103DefaultExampleList();
        const pluginDefaultAir105Example:string[] = getAir105DefaultExampleList();
        const pluginDefaultAir72XUXExample:string[] = getAir72XUXDefaultExampleList();
        const pluginDefaultEsp32c3Example:string[] = [];
        let pluginDefaultNdkExample:string[];
        const air72XUXLibList:string[] = getAir72XUXDefaultLibList();
        const air72XUXCoreList:string[] = getAir72XUXDefaultCoreList();
        const air101CoreList:string[] = getAir101DefaultCoreList();
        const air103CoreList:string[] = getAir103DefaultCoreList();
        const air105CoreList:string[] = getAir105DefaultCoreList();
        const air72XCXCoreList:string[] = [];
        const esp32c3CoreList:string[] = [];
        const air101LibList:string[] = []; 
        const air103LibList:string[] = []; 
        const air105LibList:string[] = []; 
        const esp32c3LibList:string[] = [];
        switch (message.command) {
            case 'openNewProjectWebview':
                break;
            case 'openProjectWebview':
                const openProjectUserControlJson:string[]|undefined = await openProject.openProjectUserControl(context);
                if (openProjectUserControlJson!==undefined) {
                    this.openProjectJson = openProjectUserControlJson;
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
                    case '注册':
                        vscode.commands.executeCommand('luatide.register');
                        break;
                }
                break;
            // 用户新建工程信息接收
            case 'projectType':
                console.log(message.text);
                switch (message.text) {
                    case 'pure':
                        // 传送pure所需要的数据至工程
                        homePanel.webview.postMessage(
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
                                        "esp32c3":esp32c3LibList,
                                    },
                                    "coreList": {
                                        "air72XUX/air82XUX": air72XUXCoreList,
                                        "air72XCX":air72XCXCoreList,
                                        "air101": air101CoreList,
                                        "air103": air103CoreList,
                                        "air105": air105CoreList,
                                        "simulator":air72XUXCoreList,
                                        "esp32c3":esp32c3CoreList,
                                    },
                                }
                            }
                        );
                        break;
                    case 'example':
                        // 传送example工程所需数据
                        homePanel.webview.postMessage(
                            {
                                command: 'exampleProjectInitData',
                                text: {
                                    "moduleList": pluginDefaultModuleList,
                                    "exampleList": {
                                        "air72XUX/air82XUX": pluginDefaultAir72XUXExample,
                                        "air72XCX":pluginDefaultAir72XUXExample,
                                        "air101": pluginDefaultAir101Example,
                                        "air103": pluginDefaultAir103Example,
                                        "air105": pluginDefaultAir105Example,
                                        "simulator":pluginDefaultAir72XUXExample,
                                        "esp32c3":pluginDefaultEsp32c3Example,
                                    },
                                    "coreList": {
                                        "air72XUX/air82XUX": air72XUXCoreList,
                                        "air72XCX":air72XCXCoreList,
                                        "air101": air101CoreList,
                                        "air103": air103CoreList,
                                        "air105": air105CoreList,
                                        "simulator":air72XUXCoreList,
                                        "esp32c3":esp32c3CoreList,
                                    },
                                },
                            }
                        );
                        break;
                    case 'ndk':
                        await getNdkProject();
                        pluginDefaultNdkExample = getNdkDefaultExampleList();
                        // 传送ndk工程所需数据
                        homePanel.webview.postMessage({
                            command: 'ndkProjectInitData',
                            text: {
                                "moduleList": ['air72XUX/air82XUX'],
                                "libList": {
                                    "air72XUX/air82XUX": air72XUXLibList,
                                    "air72XCX":[],
                                    "air101": [],
                                    "air103": [],
                                    "air105": [],
                                    "simulator":[],
                                    "esp32c3":[],
                                },
                                "coreList": {
                                    "air72XUX/air82XUX": air72XUXCoreList,
                                    "air72XCX":[],
                                    "air101": [],
                                    "air103": [],
                                    "air105": [],
                                    "simulator":[],
                                    "esp32c3":[],
                                },
                                "exampleList": {
                                    "air72XUX/air82XUX": pluginDefaultNdkExample,
                                    "air72XCX":[],
                                    "air101": [],
                                    "air103": [],
                                    "air105": [],
                                    "simulator":[],
                                    "esp32c3":[],
                                }
                            },
                        }
                        );
                        break;
                    case 'ui':
                        // 传送ui工程所需数据
                        homePanel.webview.postMessage(
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
                                        "esp32c3":esp32c3LibList,
                                    },
                                    "coreList": {
                                        "air72XUX/air82XUX": air72XUXCoreList,
                                        "air72XCX":air72XCXCoreList,
                                        "air101": air101CoreList,
                                        "air103": air103CoreList,
                                        "air105": air105CoreList,
                                        "simulator":air72XUXCoreList,
                                        "esp32c3":esp32c3CoreList,
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
                            homePanel.webview.postMessage(
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
                            homePanel.webview.postMessage(
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
            // 接收webview取消指令，关闭新建工程webview
            case 'cancelProject':
                homePanel.dispose();
                break;
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
            // 用户导入工程信息接收
            case 'importProject':
                // 处理导入工程传过来的路径数据
                this.openProjectReceiveDataHandle(message);
                break;
            // 接收webview提交的打开资源管理器选择用户工程路径请求
            case 'openSourceOpenProject':
                console.log(message.text);
                switch (message.text) {
                    case 'customProjectPathOpenProject':
                        const customProjectOptions = {
                            canSelectFiles: false,		//是否选择文件
                            canSelectFolders: true,		//是否选择文件夹
                            canSelectMany: false,		//是否选择多个文件
                            defaultUri: vscode.Uri.file(activityProjectPath),	//默认打开文件位置
                            openLabel: '选择需要导入工程的文件夹'
                        };
                        const customProjectPathResult = await projectConfigOperation.showOpenDialog(customProjectOptions);
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
                    // 接收webview提交的打开资源管理器选择用户lib路径请求
                    case 'customLibPathOpenProject':
                        const customLibOptions = {
                            canSelectFiles: false,		//是否选择文件
                            canSelectFolders: true,		//是否选择文件夹
                            canSelectMany: false,		//是否选择多个文件
                            defaultUri: vscode.Uri.file(activityProjectPath),	//默认打开文件位置
                            openLabel: '选择需要导入工程的文件夹'
                        };
                        const customLibPathResult = await projectConfigOperation.showOpenDialog(customLibOptions);
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

                    // 接收webview提交的打开资源管理器选择用户core路径请求
                    case 'customCorePathOpenProject':
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
                        const customCorePathResult = await projectConfigOperation.showOpenDialog(customCoreOptions);
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
                                            "air72XCX":[],
                                            "air101": [],
                                            "air103": [],
                                            "air105": [],
                                            "simulator":[],
                                            "esp32c3":[],
                                        },
                                        "coreList": {
                                            "air72XUX/air82XUX": air72XUXCoreList,
                                            "air72XCX":[],
                                            "air101": [],
                                            "air103": [],
                                            "air105": [],
                                            "simulator":[],
                                            "esp32c3":[],
                                        },
                                        "exampleList": pluginDefaultNdkExample,
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
                                        "air72XCX":air72XUXLibList,
                                        "air101": air101LibList,
                                        "air103": air103LibList,
                                        "air105": air105LibList,
                                        "simulator":air72XUXLibList,
                                        "esp32c3":esp32c3LibList,
                                    },
                                    "coreList": {
                                        "air72XUX/air82XUX": air72XUXCoreList,
                                        "air72XCX":air72XCXCoreList,
                                        "air101": air101CoreList,
                                        "air103": air103CoreList,
                                        "air105": air105CoreList,
                                        "simulator":air72XUXCoreList,
                                        "esp32c3":esp32c3CoreList,
                                    },
                                    "exampleList": {
                                        "air72XUX/air82XUX": pluginDefaultAir72XUXExample,
                                        "air72XCX":pluginDefaultAir72XUXExample,
                                        "air101": pluginDefaultAir101Example,
                                        "air103": pluginDefaultAir103Example,
                                        "air105": pluginDefaultAir105Example,
                                        "simulator":pluginDefaultAir72XUXExample,
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
            const projectConfigVersion:string = projectJsonParse.getprojectConfigInitVersion();
            projectJsonParse.setProjectConfigProjectType(openProjectMessage.openProjectProjectType,openProjectMessage.openProjectPath);
            projectJsonParse.setProjectConfigVersion(projectConfigVersion,openProjectMessage.openProjectPath);
            // 获取写入配置文件的实际core路径
            const openProjectCorePath:string = getCreateProjectCorepathHandle(openProjectMessage.openProjectCorePath,openProjectMessage.openProjectModuleModel);
            projectJsonParse.setProjectConfigCorePath(openProjectCorePath,openProjectMessage.openProjectPath);
            // 获取写入配置文件的实际lib路径
            const openProjectLibPath:string = getCreateProjectLibpathHandle(openProjectMessage.openProjectLibPath,openProjectMessage.openProjectModuleModel);
            projectJsonParse.setProjectConfigLibPath(openProjectLibPath,openProjectMessage.openProjectPath);
            projectJsonParse.setProjectConfigModuleModel(openProjectMessage.openProjectModuleModel,openProjectMessage.openProjectPath);
            // vscode.window.showInformationMessage(`工程${openProjectMessage.openProjectName}已导入成功，请切换到用户工程查看`,{modal: true});
            // 执行激活工程到活动工程操作
            projectActiveInterfact(openProjectMessage.openProjectName,openProjectMessage.openProjectPath);
            vscode.commands.executeCommand('luatide-history-project.Project.refresh');
            // vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
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