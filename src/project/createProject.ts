import * as fs  from "fs";
import * as path  from "path";
import * as vscode from 'vscode';
import { PluginVariablesInit } from "../config";
import { PluginJsonParse } from "../plugConfigParse";
import { checkSameProjectExistStatusForPluginConfig, copyDir, createFolder, getFileForDir } from "./projectApi";
import {ProjectJsonParse} from './projectConfigParse';

let pluginVariablesInit = new PluginVariablesInit();
let pluginJsonParse:any = new PluginJsonParse(); 
let projectJsonParse:any = new ProjectJsonParse(); 

export class CreateProject {
    constructor() {
        
    }

    // 创建工程
    createProject(message:any){
        let createProjectMessage = {
            createProjectName: message.text['project_name'],
            createProjectPath: message.text['project_path'],
            createProjectModuleModel: message.text['module_type'],
            createProjectLibPath: message.text['lib_path'],
            createProjectCorePath: message.text['core_path'],
            createProjectExample: message.text['project_example'],
        };
        const createProjectCheckState:boolean = this.createProjectCheck(message);
        if (!createProjectCheckState) { //新建工程必要条件检查未通过
            return false;
        }
        // 将新建工程信息插入插件配置文件
        const projectObj = {
            projectPath:createProjectMessage.createProjectPath,
            projectName:createProjectMessage.createProjectName,
        };
        pluginJsonParse.pushPluginConfigProject(projectObj);
        createFolder(createProjectMessage.createProjectPath);
        const mainLuaPath:string = path.join(createProjectMessage.createProjectPath,"main.lua");
        // 依据示例demo是否选择确定新建工程类型
        if (createProjectMessage.createProjectExample==="") {
            this.createMainLuaData(createProjectMessage.createProjectModuleModel,mainLuaPath);
        }
        else{
            this.copyDemoToProject(createProjectMessage.createProjectModuleModel,createProjectMessage.createProjectExample,
                createProjectMessage.createProjectPath);
        }
        projectJsonParse.generateProjectJson(createProjectMessage.createProjectPath); //初始化写入工程配置文件
        const appFile:string = getFileForDir(createProjectMessage.createProjectPath);
        projectJsonParse.setProjectConfigAppFile(appFile);
        const projectConfigVersion:string = projectJsonParse.getprojectConfigInitVersion();
        projectJsonParse.setProjectConfigVersion(projectConfigVersion);
        projectJsonParse.setProjectConfigCorePath(createProjectMessage.createProjectPath);
        projectJsonParse.setProjectConfigLibPath(createProjectMessage.createProjectLibPath);
        projectJsonParse.setProjectConfigModuleModel(createProjectMessage.createProjectModuleModel);
        vscode.window.showInformationMessage(`工程${createProjectMessage.createProjectName}新建成功，请切换到用户工程查看`,{modal:true});
    }

    // 工程新建必要条件检查
    createProjectCheck(message:any){
        const projectName:any = message.text['project_name'];
        const projectPath:any = message.text['project_path'];
        const projectModule:any = message.text['module_type'];
        if (projectName === "" || projectPath  === "" || projectModule === "") {
            vscode.window.showErrorMessage("webview数据接收失败!!",{modal: true});
        }
        if (fs.existsSync(projectPath)) {
            vscode.window.showErrorMessage("该路径已存在同名文件，请重新创建工程" ,{modal: true});
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

    // 向工程中写入初始的main脚本
    createMainLuaData(moduleModel:any,mainLuaPath:any){
        switch(moduleModel){
            case 'Air72XUX/Air82XUX':
                const air72xMainData:string = pluginVariablesInit.getAir72XDefaultMainData();
                fs.writeFileSync(mainLuaPath,air72xMainData);
            case 'Air10X':
                const air10xMainData:string = pluginVariablesInit.getAir10XDefaultMainData();
                fs.writeFileSync(mainLuaPath,air10xMainData);
            default:
                const airMainData:string = pluginVariablesInit.getAir72XDefaultMainData();
                fs.writeFileSync(mainLuaPath,airMainData);
        }
    }

    // 向工程中copy用户所选择的demo
    copyDemoToProject(moduleModel:any,projectDemo:any,projectPath:any){
        let demoPath:any;
        const projectDemoDistPath:string = path.join(projectPath,projectDemo);
        switch(moduleModel){
            case 'Air72XUX/Air82XUX':
                const air72XDefaultDemoPath:string = pluginVariablesInit.getAir72XDefaultDemoPath();
                demoPath = path.join(air72XDefaultDemoPath,projectDemo);
                copyDir(demoPath,projectDemoDistPath);
            case 'Air10X':
                const air10XDefaultDemoPath:string = pluginVariablesInit.getAir10XDefaultDemoPath();
                demoPath = path.join(air10XDefaultDemoPath,projectDemo);
                copyDir(demoPath,projectDemoDistPath);   
        }
    }  

    // 依据示例demo是否选择确定新建工程类型
    selectCreateProjectType(projectDemo:any){
        if (projectDemo==="") {
            this.createMainLuaData;
        }
    }

    // 新增工程写入插件配置json文件
    writeProjectToPluginJson(projectName:any,projectPath:any){
        let userProject:any = {};
        userProject['project_path'] =projectPath;
        userProject['project_name'] =projectName;
        let pluginJson:any =  pluginJsonParse.getPluginConfigJson();
        let pluginnJsonObj:any = JSON.parse(pluginJson);
        for (let i = 0; i < pluginJson.length; i++) {
            const element = pluginJson[i];
            if (element['type']==='user') {
                // 插件配置用户json对象更新
                pluginnJsonObj['data'][i]['projects'].push(userProject);
                break;
            }
        }
        const pluginJsonData:string = JSON.stringify(pluginnJsonObj,null,'\t');
        const pluginJsonPath:string = pluginVariablesInit.getPluginConfigPath();
        fs.writeFileSync(pluginJsonPath,pluginJsonData);
    }

}

