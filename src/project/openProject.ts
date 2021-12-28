import * as vscode from 'vscode';
import { PluginJsonParse } from '../plugConfigParse';
import {ProjectJsonParse} from './projectConfigParse';
import {checkSameProjectExistStatusForPluginConfig, getFileForDir} from './projectApi';
import { ProjectConfigOperation } from './ProjectHandle';
import * as path from 'path';
import * as fs from 'fs';
import { OpenProjectManage } from '../webview/openProjectWebview';

let pluginJsonParse:any = new PluginJsonParse(); 
let projectJsonParse:any = new ProjectJsonParse(); 
let projectConfigOperation:any = new ProjectConfigOperation();
export class OpenProject {
    constructor() {
    }

    // 打开工程
    async openProject(context:vscode.ExtensionContext){
        const options = {
			canSelectFiles: false,		//是否选择文件
			canSelectFolders: true,		//是否选择文件夹
			canSelectMany: false,		//是否选择多个文件
			defaultUri: vscode.Uri.file("C://"),	//默认打开文件位置
			openLabel: '选择需要导入工程的文件'
		};
        const importProjectPath: any = await this.getOpenProjectUserSelectdPath(options);
        if (importProjectPath === undefined) {
            return;
        }
        // 解析活动工程配置传送至打开工程webview
        const openProjectJson  = this.openProjectDataParse(importProjectPath);
        let openProjectManage =  new OpenProjectManage();
        openProjectManage.openProjectManage(context,openProjectJson);
    }

    openProjectDataParse(importProjectPath:any){
        const nameIndex:number = importProjectPath.lastIndexOf("\\");
        const projectConfigProjectPath:string = importProjectPath.substring(0,nameIndex);
        const projectConfigProjectName:string = importProjectPath.substring(nameIndex+1);
        const projectConfigProjectType:string =  projectJsonParse.getProjectConfigProjectType(importProjectPath);
        const porjectConfigVersion:string = projectJsonParse.getProjectConfigVersion(importProjectPath);
        const porjectConfigModuleModel:string = projectJsonParse.getProjectConfigModuleModel(importProjectPath);
        const projectConfigCorePath:string = projectJsonParse.getProjectConfigCorePath(importProjectPath);
        const projectConfigLibPath:string = projectJsonParse.getProjectConfigLibPath(importProjectPath);
        const projectConfigModulePort:string = projectJsonParse.getProjectConfigMoudlePort(importProjectPath);
        const projectConfigAppFile:string = projectJsonParse.getProjectConfigAppFile(importProjectPath);
        let openProjectJson:any = {};
        openProjectJson.type = projectConfigProjectType;
        openProjectJson.importInitData = '';
        openProjectJson.correctData = {};
        openProjectJson.correctData.projectName = projectConfigProjectName;
        openProjectJson.correctData.projectPath = projectConfigProjectPath;
        openProjectJson.correctData.moduleModel = porjectConfigModuleModel;
        openProjectJson.correctData.libPath = projectConfigLibPath;
        openProjectJson.correctData.corePath = projectConfigCorePath;
        openProjectJson.errorData = '';
        return openProjectJson;
    }

    // 获取打开工程用户交互选择的工程路径
    async getOpenProjectUserSelectdPath(options:any){
        let importProjectPath = await vscode.window.showOpenDialog(options).then(
            async result => {
			if (result !== undefined) {
				const importProjectPath = result[0].fsPath.toString();
				if (!fs.existsSync(path.join(importProjectPath,'luatide_project.json'))) {
					await vscode.window.showErrorMessage("该项目未配置工程，是否配置？", { modal: true }, "是", "否").then(result => {
						if (result === '是') {
                            projectJsonParse.generateProjectJson(importProjectPath);
                            return importProjectPath;
						}
						else if (result === '否') {
							vscode.window.showInformationMessage("不是有效的工程,请重新选择");
                            return undefined;
						}
				});
            }
				else {
                    return  importProjectPath;
				}
            };
        });
        return importProjectPath;
    }

    openProjectReceiveDataHandle(message:any){
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