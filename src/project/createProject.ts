import * as fs from "fs";
import * as path from "path";
import * as vscode from 'vscode';
import { PluginVariablesInit } from "../config";
import { PluginJsonParse } from "../plugConfigParse";
import { checkSameProjectExistStatusForPluginConfig, copyDir, createFolder, getFileForDirRecursion } from "./projectApi";
import { ProjectJsonParse } from './projectConfigParse';

let pluginVariablesInit = new PluginVariablesInit();
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
        const appFile: string[] = getFileForDirRecursion(createProjectMessage.createProjectPath);
        projectJsonParse.pushProjectConfigAppFile(appFile,createProjectMessage.createProjectPath);
        const projectConfigVersion: string = projectJsonParse.getprojectConfigInitVersion();
        projectJsonParse.setProjectConfigVersion(projectConfigVersion,createProjectMessage.createProjectPath);
        projectJsonParse.setProjectConfigCorePath(createProjectMessage.createProjectCorePath,createProjectMessage.createProjectPath);
        // 获取写入配置文件的实际lib路径
        const createProjectLibPath:string = this.getCreateProjectLibpathHandle(createProjectMessage.createProjectLibPath);
        projectJsonParse.setProjectConfigLibPath(createProjectLibPath,createProjectMessage.createProjectPath);
        projectJsonParse.setProjectConfigModuleModel(createProjectMessage.createProjectModuleModel,createProjectMessage.createProjectPath);
        projectJsonParse.setProjectConfigProjectType(projectType,createProjectMessage.createProjectPath);
        vscode.window.showInformationMessage(`工程${createProjectMessage.createProjectName}新建成功，请切换到用户工程查看`, { modal: true });
        vscode.commands.executeCommand('luatide-history-project.Project.refresh');
        vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
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
        const appFile: string[] = getFileForDirRecursion(createProjectMessage.createProjectPath);
        projectJsonParse.pushProjectConfigAppFile(appFile,createProjectMessage.createProjectPath);
        const projectConfigVersion: string = projectJsonParse.getprojectConfigInitVersion();
        projectJsonParse.setProjectConfigVersion(projectConfigVersion,createProjectMessage.createProjectPath);
        projectJsonParse.setProjectConfigCorePath(createProjectMessage.createProjectCorePath,createProjectMessage.createProjectPath);
        let createProjectLibPath:string;
        // lib库路径初始化写入
        if (createProjectMessage.createProjectModuleModel!=='air10X') {
            createProjectLibPath = pluginVariablesInit.getAir72XDefaultLatestLibPath();
        }
        else{
            createProjectLibPath = '';
        }
        projectJsonParse.setProjectConfigLibPath(createProjectLibPath,createProjectMessage.createProjectPath);  //示例工程的lib采用最新的lib
        projectJsonParse.setProjectConfigModuleModel(createProjectMessage.createProjectModuleModel,createProjectMessage.createProjectPath);
        projectJsonParse.setProjectConfigProjectType(projectType,createProjectMessage.createProjectPath);
        vscode.window.showInformationMessage(`工程${createProjectMessage.createProjectName}新建成功，请切换到用户工程查看`, { modal: true });
        vscode.commands.executeCommand('luatide-history-project.Project.refresh');
        vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
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
            createProjectExample: message.text['project_example'],
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
        const mainLuaPath: string = path.join(createProjectMessage.createProjectPath, "main.lua");
        // 依据示例demo是否选择确定新建工程类型
        if (createProjectMessage.createProjectExample === "") {
            this.createMainLuaData(createProjectMessage.createProjectModuleModel, mainLuaPath);
        }
        else {
            this.copyDemoToProject(createProjectMessage.createProjectModuleModel, createProjectMessage.createProjectExample,
                createProjectMessage.createProjectPath);
        }
        projectJsonParse.generateProjectJson(createProjectMessage.createProjectPath); //初始化写入工程配置文件
        const appFile: string[] = getFileForDirRecursion(createProjectMessage.createProjectPath);
        projectJsonParse.pushProjectConfigAppFile(appFile,createProjectMessage.createProjectPath);
        const projectConfigVersion: string = projectJsonParse.getprojectConfigInitVersion();
        projectJsonParse.setProjectConfigVersion(projectConfigVersion,createProjectMessage.createProjectPath);
        projectJsonParse.setProjectConfigCorePath(createProjectMessage.createProjectCorePath,createProjectMessage.createProjectPath);
        // 获取写入配置文件的实际lib路径
        const createProjectLibPath:string = this.getCreateProjectLibpathHandle(createProjectMessage.createProjectLibPath);
        projectJsonParse.setProjectConfigLibPath(createProjectLibPath);
        projectJsonParse.setProjectConfigModuleModel(createProjectMessage.createProjectModuleModel,createProjectMessage.createProjectPath);
        projectJsonParse.setProjectConfigProjectType(projectType,createProjectMessage.createProjectPath,createProjectMessage.createProjectPath);
        vscode.window.showInformationMessage(`工程${createProjectMessage.createProjectName}新建成功，请切换到用户工程查看`, { modal: true });
        vscode.commands.executeCommand('luatide-history-project.Project.refresh');
        vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
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
        const mainLuaPath: string = path.join(createProjectMessage.createProjectPath, "main.lua");
        this.createMainLuaData(createProjectMessage.createProjectModuleModel, mainLuaPath);
        projectJsonParse.generateProjectJson(createProjectMessage.createProjectPath); //初始化写入工程配置文件
        const appFile: string[] = getFileForDirRecursion(createProjectMessage.createProjectPath);
        projectJsonParse.pushProjectConfigAppFile(appFile,createProjectMessage.createProjectPath);
        const projectConfigVersion: string = projectJsonParse.getprojectConfigInitVersion();
        projectJsonParse.setProjectConfigVersion(projectConfigVersion,createProjectMessage.createProjectPath);
        projectJsonParse.setProjectConfigCorePath(createProjectMessage.createProjectCorePath,createProjectMessage.createProjectPath);
        // 获取写入配置文件的实际lib路径
        const createProjectLibPath:string = this.getCreateProjectLibpathHandle(createProjectMessage.createProjectLibPath);
        projectJsonParse.setProjectConfigLibPath(createProjectLibPath,createProjectMessage.createProjectPath);
        projectJsonParse.setProjectConfigModuleModel(createProjectMessage.createProjectModuleModel,createProjectMessage.createProjectPath);
        projectJsonParse.setProjectConfigProjectType(projectType,createProjectMessage.createProjectPath);
        vscode.window.showInformationMessage(`工程${createProjectMessage.createProjectName}新建成功，请切换到用户工程查看`, { modal: true });
        vscode.commands.executeCommand('luatide-history-project.Project.refresh');
        vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
    }

    // 接收到的webview发送的lib处理
    getCreateProjectLibpathHandle(libPath:string){
        const air72XDefaultLibPath = pluginVariablesInit.getAir72XDefaultLibPath();
        if (fs.existsSync(libPath)) {
            libPath = libPath;
        }
        else if (libPath==='') {
            libPath = pluginVariablesInit.getAir72XDefaultLatestLibPath();
        }
        else{
            libPath = path.join(air72XDefaultLibPath,libPath,'lib');
        }
        return libPath;
    }

    //接收到的webview发送的core路径处理
    getCreateProjectCorepathHandle(corePath:string,moduleModel:string){
        switch(moduleModel){
            case 'air72XUX/air82XUX':
                corePath = this.getCreateProjectAir72XCorepathHandle(corePath);
                break;
            case 'air72XCX':
                corePath = '';
                break;
            case 'air10X':
                corePath = this.getCreateProjectAir10XCorepathHandle(corePath);
                break;
            case 'simulator':
                corePath = this.getCreateProjectAir72XCorepathHandle(corePath);
                break;
        }
        return corePath;
    }

    // 接收到的webview发送的air101的core处理
    getCreateProjectAir10XCorepathHandle(corePath:string){
        const air10XDefaultCorePath = pluginVariablesInit.getAir10XDefaultCorePath();
        if (fs.existsSync(corePath)) {
            corePath = corePath;
        }
        else if (corePath==='') {
            const coreLatestName:string = pluginVariablesInit.getAir10XDefaultLatestCorePath();
            corePath = path.join(air10XDefaultCorePath,coreLatestName);
        }
        else{
            corePath = path.join(air10XDefaultCorePath,corePath);
        }
        return corePath;
    }

    // 接收到的webview发送的air724的core处理
    getCreateProjectAir72XCorepathHandle(corePath:string){
        const air72XDefaultCorePath = pluginVariablesInit.getAir72XDefaultCorePath();
        if (fs.existsSync(corePath)) {
            corePath = corePath;
        }
        else if (corePath==='') {
            const coreLatestName:string = pluginVariablesInit.getAir72XDefaultLatestCorePath();
            corePath = path.join(air72XDefaultCorePath,coreLatestName);
        }
        else{
            corePath = path.join(air72XDefaultCorePath,corePath);
        }
        return corePath;
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
        switch (moduleModel) {
            case 'air72XUX/air82XUX':
                const air72xMainData: string = pluginVariablesInit.getAir72XDefaultMainData();
                fs.writeFileSync(mainLuaPath, air72xMainData);
            case 'air10X':
                const air10xMainData: string = pluginVariablesInit.getAir10XDefaultMainData();
                fs.writeFileSync(mainLuaPath, air10xMainData);
            default:
                const airMainData: string = pluginVariablesInit.getAir72XDefaultMainData();
                fs.writeFileSync(mainLuaPath, airMainData);
        }
    }

    // 向工程中copy用户所选择的demo
    copyDemoToProject(moduleModel: any, projectDemo: any, projectPath: any) {
        let demoPath: any;
        const projectDemoDistPath: string = projectPath;
        switch (moduleModel) {
            case 'air72XUX/air82XUX':
                const air72XDefaultDemoPath: string = pluginVariablesInit.getAir72XDefaultDemoPath();
                demoPath = path.join(air72XDefaultDemoPath, projectDemo);
                copyDir(demoPath, projectDemoDistPath);
                break;
            case 'air10X':
                const air10XDefaultDemoPath: string = pluginVariablesInit.getAir10XDefaultDemoPath();
                demoPath = path.join(air10XDefaultDemoPath, projectDemo);
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
        const pluginJsonPath: string = pluginVariablesInit.getPluginConfigPath();
        fs.writeFileSync(pluginJsonPath, pluginJsonData);
    }

}

