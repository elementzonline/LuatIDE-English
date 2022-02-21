import * as fs from "fs";
import * as path from "path";
import * as vscode from 'vscode';
import { getAir101DefaultDemoPath, getAir103DefaultDemoPath, getAir105DefaultDemoPath, getAir10XDefaultMainData, getAir72XUXDefaultLatestDemoPath, getAir72XUXDefaultLatestLibPath, getAir72XUXDefaultMainData, getNdkDefaultDemoPath, getPluginConfigPath } from "../variableInterface";
// import { PluginVariablesInit } from "../config";
import { PluginJsonParse } from "../plugConfigParse";
import { checkSameProjectExistStatusForPluginConfig, copyDir, createFolder, deleteDirRecursive, getCreateProjectCorepathHandle, getCreateProjectLibpathHandle, getFileForDirRecursion, projectActiveInterfact } from "./projectApi";
import { ProjectJsonParse } from './projectConfigParse';

// let pluginVariablesInit = new PluginVariablesInit();
let pluginJsonParse: any = new PluginJsonParse();
let projectJsonParse: any = new ProjectJsonParse();
export class CreateProject {
    constructor() {

    }

    // 新建空白工程
    createPureProject(message: any) {
        let createProjectMessage = {
            createProjectName: message.text['projectName'],
            createProjectPath: message.text['projectPath'],
            createProjectModuleModel: message.text['moduleModel'],
            createProjectLibPath: message.text['libPath'],
            createProjectCorePath: message.text['corePath'],
            // createProjectExample: message.text['project_example'],
        };
        const projectType:string = 'pure';
        const createProjectCheckState: boolean = this.createProjectCheck(message);
        if (!createProjectCheckState) { //新建工程必要条件检查未通过
            return false;
        }
        const nameIndex:number = createProjectMessage.createProjectPath.lastIndexOf("\\");
        const createProjectParentPath:string = createProjectMessage.createProjectPath.substring(0,nameIndex);
        // 将新建工程信息插入插件配置文件
        const projectObj = {
            projectPath: createProjectParentPath,
            projectName: createProjectMessage.createProjectName,
        };
        pluginJsonParse.pushPluginConfigProject(projectObj);
        pluginJsonParse.setPluginConfigActivityProject(createProjectMessage.createProjectPath);
        createFolder(createProjectMessage.createProjectPath);
        const mainLuaPath: string = path.join(createProjectMessage.createProjectPath, "main.lua");
        this.createMainLuaData(createProjectMessage.createProjectModuleModel, mainLuaPath);
        projectJsonParse.generateProjectJson(createProjectMessage.createProjectPath); //初始化写入工程配置文件
        const appFile: string[] | undefined = getFileForDirRecursion(createProjectMessage.createProjectPath);
        if (appFile===undefined) {
            return;
        }
        projectJsonParse.pushProjectConfigAppFile(appFile,createProjectMessage.createProjectPath);
        const projectConfigVersion: string = projectJsonParse.getprojectConfigInitVersion();
        projectJsonParse.setProjectConfigVersion(projectConfigVersion,createProjectMessage.createProjectPath);
        // 获取写入配置文件的实际core路径
        const createProjectCorePath:string = getCreateProjectCorepathHandle(createProjectMessage.createProjectCorePath,createProjectMessage.createProjectModuleModel);
        projectJsonParse.setProjectConfigCorePath(createProjectCorePath,createProjectMessage.createProjectPath);
        // 获取写入配置文件的实际lib路径
        const createProjectLibPath:string = getCreateProjectLibpathHandle(createProjectMessage.createProjectLibPath,createProjectMessage.createProjectModuleModel);
        projectJsonParse.setProjectConfigLibPath(createProjectLibPath,createProjectMessage.createProjectPath);
        projectJsonParse.setProjectConfigModuleModel(createProjectMessage.createProjectModuleModel,createProjectMessage.createProjectPath);
        projectJsonParse.setProjectConfigProjectType(projectType,createProjectMessage.createProjectPath);
        // vscode.window.showInformationMessage(`工程${createProjectMessage.createProjectName}新建成功，请切换到用户工程查看`, { modal: true });
        projectActiveInterfact(createProjectMessage.createProjectName,createProjectMessage.createProjectPath);
        vscode.commands.executeCommand('luatide-history-project.Project.refresh');
        // vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
    }

    // 新建示例工程
    createExampleProject(message: any) {
        const projectType:string = 'example';
        let createProjectMessage = {
            createProjectName: message.text['projectName'],
            createProjectPath: message.text['projectPath'],
            createProjectModuleModel: message.text['moduleModel'],
            createProjectCorePath: message.text['corePath'],
            createProjectExample: message.text['example'],
        };
        const createProjectCheckState: boolean = this.createProjectCheck(message);
        if (!createProjectCheckState) { //新建工程必要条件检查未通过
            return false;
        }
        const nameIndex:number = createProjectMessage.createProjectPath.lastIndexOf("\\");
        const createProjectParentPath:string = createProjectMessage.createProjectPath.substring(0,nameIndex); 
        // 将新建工程信息插入插件配置文件
        const projectObj = {
            projectPath: createProjectParentPath,
            projectName: createProjectMessage.createProjectName,
        };
        pluginJsonParse.pushPluginConfigProject(projectObj);
        pluginJsonParse.setPluginConfigActivityProject(createProjectMessage.createProjectPath);
        createFolder(createProjectMessage.createProjectPath);
        this.copyDemoToProject(createProjectMessage.createProjectModuleModel, createProjectMessage.createProjectExample,
            createProjectMessage.createProjectPath);
        projectJsonParse.generateProjectJson(createProjectMessage.createProjectPath);      //初始化写入工程配置文件
        const appFile: string[]|undefined = getFileForDirRecursion(createProjectMessage.createProjectPath);
        if (appFile===undefined) {
            return;
        }
        projectJsonParse.pushProjectConfigAppFile(appFile,createProjectMessage.createProjectPath);
        const projectConfigVersion: string = projectJsonParse.getprojectConfigInitVersion();
        projectJsonParse.setProjectConfigVersion(projectConfigVersion,createProjectMessage.createProjectPath);
        // 获取写入配置文件的实际core路径
        const createProjectCorePath:string = getCreateProjectCorepathHandle(createProjectMessage.createProjectCorePath,createProjectMessage.createProjectModuleModel);
        projectJsonParse.setProjectConfigCorePath(createProjectCorePath,createProjectMessage.createProjectPath);
        let createProjectLibPath:string;
        // lib库路径初始化写入
        if (createProjectMessage.createProjectModuleModel!=='air101' && createProjectMessage.createProjectModuleModel!=='air103' && createProjectMessage.createProjectModuleModel!=='air105' && createProjectMessage.createProjectModuleModel!=='esp32c3') {
            createProjectLibPath = getAir72XUXDefaultLatestLibPath();
        }
        else{
            createProjectLibPath = '';
        }
        projectJsonParse.setProjectConfigLibPath(createProjectLibPath,createProjectMessage.createProjectPath);  //示例工程的lib采用最新的lib
        projectJsonParse.setProjectConfigModuleModel(createProjectMessage.createProjectModuleModel,createProjectMessage.createProjectPath);
        projectJsonParse.setProjectConfigProjectType(projectType,createProjectMessage.createProjectPath);
        // vscode.window.showInformationMessage(`工程${createProjectMessage.createProjectName}新建成功，请切换到用户工程查看`, { modal: true });
        projectActiveInterfact(createProjectMessage.createProjectName,createProjectMessage.createProjectPath);
        vscode.commands.executeCommand('luatide-history-project.Project.refresh');
        // vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
    }

    // 新建ndk工程
    createNdkProject(message: any) {
        const projectType:string = 'ndk';
        let createProjectMessage = {
            createProjectName: message.text['projectName'],
            createProjectPath: message.text['projectPath'],
            createProjectModuleModel: message.text['moduleModel'],
            createProjectLibPath: message.text['libPath'],
            createProjectCorePath: message.text['corePath'],
            createProjectExample: message.text['example'],
        };
        const createProjectCheckState: boolean = this.createProjectCheck(message);
        if (!createProjectCheckState) { //新建工程必要条件检查未通过
            return false;
        }
        const nameIndex:number = createProjectMessage.createProjectPath.lastIndexOf("\\");
        const createProjectParentPath:string = createProjectMessage.createProjectPath.substring(0,nameIndex); 
        // 将新建工程信息插入插件配置文件
        const projectObj = {
            projectPath: createProjectParentPath,
            projectName: createProjectMessage.createProjectName,
        };
        pluginJsonParse.pushPluginConfigProject(projectObj);
        pluginJsonParse.setPluginConfigActivityProject(createProjectMessage.createProjectPath);
        createFolder(createProjectMessage.createProjectPath);
        // const mainLuaPath: string = path.join(createProjectMessage.createProjectPath, "main.lua");
        // 依据示例demo是否选择确定新建工程类型
        // if (createProjectMessage.createProjectExample === "") {
        //     this.createMainLuaData(createProjectMessage.createProjectModuleModel, mainLuaPath);
        // }
        // else {
        //     this.copyDemoToProject(createProjectMessage.createProjectModuleModel, createProjectMessage.createProjectExample,
        //         createProjectMessage.createProjectPath);
        // }
        if (createProjectMessage.createProjectExample === undefined) {
            vscode.window.showErrorMessage('未检测到ndk工程所需demo文件,NDK工程创建失败');
            return;
        }
        else{
            this.ndkHandler(createProjectMessage.createProjectPath,createProjectMessage.createProjectExample);
        }
        projectJsonParse.generateProjectJson(createProjectMessage.createProjectPath); //初始化写入工程配置文件
        const appFile: string[]|undefined = getFileForDirRecursion(createProjectMessage.createProjectPath);
        if (appFile===undefined) {
            return;
        }
        projectJsonParse.pushProjectConfigAppFile(appFile,createProjectMessage.createProjectPath);
        const projectConfigVersion: string = projectJsonParse.getprojectConfigInitVersion();
        projectJsonParse.setProjectConfigVersion(projectConfigVersion,createProjectMessage.createProjectPath);
         // 获取写入配置文件的实际core路径
         const createProjectCorePath:string = getCreateProjectCorepathHandle(createProjectMessage.createProjectCorePath,createProjectMessage.createProjectModuleModel);
         projectJsonParse.setProjectConfigCorePath(createProjectCorePath,createProjectMessage.createProjectPath); 
        // 获取写入配置文件的实际lib路径
        const createProjectLibPath:string = getCreateProjectLibpathHandle(createProjectMessage.createProjectLibPath,createProjectMessage.createProjectModuleModel);
        projectJsonParse.setProjectConfigLibPath(createProjectLibPath,createProjectMessage.createProjectPath);
        projectJsonParse.setProjectConfigModuleModel(createProjectMessage.createProjectModuleModel,createProjectMessage.createProjectPath);
        projectJsonParse.setProjectConfigProjectType(projectType,createProjectMessage.createProjectPath,createProjectMessage.createProjectPath);
        // vscode.window.showInformationMessage(`工程${createProjectMessage.createProjectName}新建成功，请切换到用户工程查看`, { modal: true });
        projectActiveInterfact(createProjectMessage.createProjectName,createProjectMessage.createProjectPath);
        vscode.commands.executeCommand('luatide-history-project.Project.refresh');
        // vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
    }

    // 新建ui工程
    createUiProject(message: any) {
        const projectType:string = 'ui';
        let createProjectMessage = {
            createProjectName: message.text['projectName'],
            createProjectPath: message.text['projectPath'],
            createProjectModuleModel: message.text['moduleModel'],
            createProjectLibPath: message.text['libPath'],
            createProjectCorePath: message.text['corePath'],
            // createProjectExample: message.text['project_example'],
        };
        const createProjectCheckState: boolean = this.createProjectCheck(message);
        if (!createProjectCheckState) { //新建工程必要条件检查未通过
            return false;
        }
        const nameIndex:number = createProjectMessage.createProjectPath.lastIndexOf("\\");
        const createProjectParentPath:string = createProjectMessage.createProjectPath.substring(0,nameIndex); 
        // 将新建工程信息插入插件配置文件
        const projectObj = {
            projectPath: createProjectParentPath,
            projectName: createProjectMessage.createProjectName,
        };
        pluginJsonParse.pushPluginConfigProject(projectObj);
        pluginJsonParse.setPluginConfigActivityProject(createProjectMessage.createProjectPath);
        createFolder(createProjectMessage.createProjectPath);
        // const mainLuaPath: string = path.join(createProjectMessage.createProjectPath, "main.lua");
        // this.createMainLuaData(createProjectMessage.createProjectModuleModel, mainLuaPath);
        this.createUiData(createProjectMessage.createProjectPath);
        // vscode.commands.executeCommand('luatide-ui.design');
        projectJsonParse.generateProjectJson(createProjectMessage.createProjectPath); //初始化写入工程配置文件
        const appFile: string[]|undefined = getFileForDirRecursion(createProjectMessage.createProjectPath);
        if (appFile===undefined) {
            return;
        }
        projectJsonParse.pushProjectConfigAppFile(appFile,createProjectMessage.createProjectPath);
        const projectConfigVersion: string = projectJsonParse.getprojectConfigInitVersion();
        projectJsonParse.setProjectConfigVersion(projectConfigVersion,createProjectMessage.createProjectPath);
        // 获取写入配置文件的实际core路径
        const createProjectCorePath:string = getCreateProjectCorepathHandle(createProjectMessage.createProjectCorePath,createProjectMessage.createProjectModuleModel);
        projectJsonParse.setProjectConfigCorePath(createProjectCorePath,createProjectMessage.createProjectPath);
        // 获取写入配置文件的实际lib路径
        const createProjectLibPath:string = getCreateProjectLibpathHandle(createProjectMessage.createProjectLibPath,createProjectMessage.createProjectModuleModel);
        projectJsonParse.setProjectConfigLibPath(createProjectLibPath,createProjectMessage.createProjectPath);
        projectJsonParse.setProjectConfigModuleModel(createProjectMessage.createProjectModuleModel,createProjectMessage.createProjectPath);
        projectJsonParse.setProjectConfigProjectType(projectType,createProjectMessage.createProjectPath);
        // vscode.window.showInformationMessage(`工程${createProjectMessage.createProjectName}新建成功，请切换到用户工程查看`, { modal: true });
        projectActiveInterfact(createProjectMessage.createProjectName,createProjectMessage.createProjectPath);
        vscode.commands.executeCommand('luatide-history-project.Project.refresh');
        // vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
    }

    // 工程新建必要条件检查
    createProjectCheck(message: any) {
        const projectName: any = message.text['projectName'];
        const projectPath: any = message.text['projectPath'];
        const projectModule: any = message.text['moduleModel'];
        if (projectName === "" || projectPath === "" || projectModule === "") {
            vscode.window.showErrorMessage("webview数据接收失败!!", { modal: true });
        }
        if (fs.existsSync(projectPath)) {
            vscode.window.showErrorMessage("该路径已存在同名文件，请重新创建工程", { modal: true });
            return false;
        }
        const sameProjectExistStatus: boolean = checkSameProjectExistStatusForPluginConfig(projectName);
        // 检查用户历史工程看工程名称是否重复
        if (sameProjectExistStatus) {
            vscode.window.showErrorMessage("该工程已被建立，不能重新建立", { modal: true });
            return false;
        }
        return true;
    }

    // 向工程中写入初始的main脚本
    createMainLuaData(moduleModel: any, mainLuaPath: any) {
        const air10xMainData: string = getAir10XDefaultMainData();
        switch (moduleModel) {
            case 'air72XUX/air82XUX':
                const air72XUXMainData: string = getAir72XUXDefaultMainData();
                fs.writeFileSync(mainLuaPath, air72XUXMainData);
                break;
            case 'air101':
                fs.writeFileSync(mainLuaPath, air10xMainData);
                break;
            case 'air103':
                fs.writeFileSync(mainLuaPath, air10xMainData);
                break;
            case 'air105':
                fs.writeFileSync(mainLuaPath, air10xMainData);
                break;
            case 'esp32c3':
                // esp32c3 默认demo与air101系列相同
                fs.writeFileSync(mainLuaPath,air10xMainData);  
            default:
                const airMainData: string = getAir72XUXDefaultMainData();
                fs.writeFileSync(mainLuaPath, airMainData);
                break;
        }
    }

    // 向工程中写入初始化的ui工程
    createUiData(projectPath:string){
        const uiLuaData: string = `{
            "device": {
                "width": 640,
                "height": 480
            },
            "screens": [
                {
                    "name": "ScreenA",
                    "layout": {
                        "type": "free",
                        "blocks": [
                            {
                                "width": 230,
                                "height": 33,
                                "name": "LvglBar1",
                                "body": "LvglBar1",
                                "x": 183,
                                "y": 109
                            }
                        ]
                    }
                }
            ],
            "schema": {
                "LvglBar1": {
                    "comType": "LvglBar",
                    "comConf": {
                        "anim": "OFF",
                        "defaultStatus": {
                            "bgPart": {},
                            "indicPart": {}
                        }
                    }
                }
            }
        }`;
        if (!fs.existsSync(path.join(projectPath, ".luatide"))) {
            fs.mkdirSync(path.join(projectPath, ".luatide"));
        }
        const mainUiPath: string = path.join(projectPath, ".luatide",'test.ui');
        fs.writeFileSync(mainUiPath,uiLuaData);
    }
    // 向工程中copy用户所选择的demo
    copyDemoToProject(moduleModel: any, projectDemo: any, projectPath: any) {
        let demoPath: any;
        const projectDemoDistPath: string = projectPath;
        const air101DefaultDemoPath: string = getAir101DefaultDemoPath();
        const air103DefaultDemoPath: string = getAir103DefaultDemoPath();
        const air105DefaultDemoPath: string = getAir105DefaultDemoPath();
        switch (moduleModel) {
            case 'air72XUX/air82XUX':
                const air72XUXDefaultVersionDemoPath: string = getAir72XUXDefaultLatestDemoPath();
                demoPath = path.join(air72XUXDefaultVersionDemoPath, projectDemo);
                copyDir(demoPath, projectDemoDistPath);
                break;
            case 'simulator':
                const simulatorDefaultVersionDemoPath: string = getAir72XUXDefaultLatestDemoPath();
                demoPath = path.join(simulatorDefaultVersionDemoPath, projectDemo);
                copyDir(demoPath, projectDemoDistPath);
                break;
            case 'air101':
                demoPath = path.join(air101DefaultDemoPath, projectDemo);
                copyDir(demoPath, projectDemoDistPath);
                break;
            case 'air103':
                demoPath = path.join(air103DefaultDemoPath, projectDemo);
                copyDir(demoPath, projectDemoDistPath);
                break;
            case 'air105':
                demoPath = path.join(air105DefaultDemoPath, projectDemo);
                copyDir(demoPath, projectDemoDistPath);
                break;
            case 'esp32c3':
                // esp32 demo暂未出来,先使用101的demo
                demoPath = path.join(air101DefaultDemoPath, projectDemo);
                copyDir(demoPath, projectDemoDistPath);
                break;
        }
    }

    // 依据示例demo是否选择确定新建工程类型
    selectCreateProjectType(projectDemo: any) {
        if (projectDemo === "") {
            this.createMainLuaData;
        }
    }

    // 新增工程写入插件配置json文件
    writeProjectToPluginJson(projectName: any, projectPath: any) {
        let userProject: any = {};
        userProject['project_path'] = projectPath;
        userProject['project_name'] = projectName;
        let pluginJson: any = pluginJsonParse.getPluginConfigJson();
        let pluginnJsonObj: any = JSON.parse(pluginJson);
        for (let i = 0; i < pluginJson.length; i++) {
            const element = pluginJson[i];
            if (element['type'] === 'user') {
                // 插件配置用户json对象更新
                pluginnJsonObj['data'][i]['projects'].push(userProject);
                break;
            }
        }
        const pluginJsonData: string = JSON.stringify(pluginnJsonObj, null, '\t');
        const pluginJsonPath: string = getPluginConfigPath();
        fs.writeFileSync(pluginJsonPath, pluginJsonData);
    }

    // 对接收到的ndk数据进行工程环境初始化处理
    ndkHandler(projectPath:string,exampleName:string){
        const ndkDefaultDemoPath:string = getNdkDefaultDemoPath();
        const ndkDefaultDemoAbsolutePath:string = path.join(ndkDefaultDemoPath,exampleName);
        const ndkProjectDemoDistPath: string = projectPath;
        copyDir(ndkDefaultDemoAbsolutePath,ndkProjectDemoDistPath);
        copyDir(path.join(ndkProjectDemoDistPath,'lua'),ndkProjectDemoDistPath);
        deleteDirRecursive(path.join(ndkProjectDemoDistPath,'lua'));
        fs.renameSync(path.join(ndkProjectDemoDistPath,'c'),path.join(ndkProjectDemoDistPath,'ndk'));
    }
}