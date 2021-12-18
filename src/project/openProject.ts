import * as vscode from 'vscode';
import * as fs from 'fs';
import { PluginJsonParse } from '../plugConfigParse';
import {ProjectJsonParse} from './projectConfigParse';
import {checkSameProjectExistStatusForPluginConfig, getFileForDir} from './projectApi';

let pluginJsonParse:any = new PluginJsonParse(); 
let projectJsonParse:any = new ProjectJsonParse(); 
export class OpenProject {
    constructor() {
    }

    // 打开工程
    openProject(message:any){
        let openProjectMessage = {
            openProjectName: message.text['project_name'],
            openProjectPath: message.text['project_path'],
            openProjectModuleModel: message.text['module_type'],
            openProjectLibPath: message.text['lib_path'],
            openProjectCorePath: message.text['core_path'],
            openProjectExample: message.text['project_example'],
        };
        const openProjectCheckState:boolean = this.openProjectCheck(message);
        if (!openProjectCheckState) { //新建工程必要条件检查未通过
            return false;
        }
        // 将打开工程名称和路径信息插入插件配置文件
        const projectObj = {
            projectPath:openProjectMessage.openProjectPath,
            projectName:openProjectMessage.openProjectName,
        };
        pluginJsonParse.pushPluginConfigProject(projectObj);
        projectJsonParse.generateProjectJson(openProjectMessage.openProjectPath); //初始化写入工程配置文件
        const appFile:string = getFileForDir(openProjectMessage.openProjectPath);
        projectJsonParse.setProjectConfigAppFile(appFile);
        const projectConfigVersion:string = projectJsonParse.getprojectConfigInitVersion();
        projectJsonParse.setProjectConfigVersion(projectConfigVersion);
        projectJsonParse.setProjectConfigCorePath(openProjectMessage.openProjectPath);
        projectJsonParse.setProjectConfigLibPath(openProjectMessage.openProjectLibPath);
        projectJsonParse.setProjectConfigModuleModel(openProjectMessage.openProjectModuleModel);
        vscode.window.showInformationMessage(`工程${openProjectMessage.openProjectName}已导入成功，请切换到用户工程查看`,{modal: true});
    }

    // 打开工程必要条件检查
    openProjectCheck(message:any){
        const projectName:any = message.text['project_name'];
        const projectPath:any = message.text['project_path'];
        const projectModule:any = message.text['module_type'];
        if (projectName === "" || projectPath  === "" || projectModule === "") {
            vscode.window.showErrorMessage("打开工程webview数据接收失败!!",{modal: true});
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