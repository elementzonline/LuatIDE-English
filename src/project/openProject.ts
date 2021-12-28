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
			openLabel: '选择您需要打开的工程目录'
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
                            const appFile:string = getFileForDir(importProjectPath);
                            projectJsonParse.pushProjectConfigAppFile(appFile,importProjectPath);
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
}