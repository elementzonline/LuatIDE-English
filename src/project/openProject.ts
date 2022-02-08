import * as vscode from 'vscode';
import { PluginJsonParse } from '../plugConfigParse';
import {ProjectJsonParse} from './projectConfigParse';
// import {checkSameProjectExistStatusForPluginConfig, getFileForDirRecursion} from './projectApi';
import {getFileForDirRecursion} from './projectApi';
// import { ProjectConfigOperation } from './ProjectHandle';
import * as path from 'path';
import * as fs from 'fs';
// import { getCoreListBaseMoudeleMode, getExampleListBaseMoudeleMode, getLibListBaseMoudeleMode } from '../variableInterface';
// import { openProjectManage } from '../webview/openProjectWebview';
// import { PluginVariablesInit } from '../config';

let pluginJsonParse:any = new PluginJsonParse(); 
let projectJsonParse:any = new ProjectJsonParse(); 
// let pluginVariablesInit = new PluginVariablesInit();
// let projectConfigOperation:any = new ProjectConfigOperation();
export class OpenProject {
    constructor() {
    }

    // 点击侧边栏打开工程显示
    async openProject(context:vscode.ExtensionContext,homeManageObj:any){
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
        // 打开工程导入前做兼容性处理
        pluginJsonParse.projectConfigCompatible(importProjectPath);
        // 解析活动工程配置传送至打开工程webview
        const openProjectJson  = this.openProjectDataParse(importProjectPath);
        homeManageObj.homeManage(context,'loadOpenProjectModelBox',openProjectJson);
    }

    // 用户点击home界面内打开工程显示内容 
    async openProjectUserControl(context:vscode.ExtensionContext){
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
        // 打开工程导入前做兼容性处理
        pluginJsonParse.projectConfigCompatible(importProjectPath);
        // 解析活动工程配置传送至打开工程webview
        const openProjectJson  = this.openProjectDataParse(importProjectPath);
        return openProjectJson;
    }

    //打开工程工程配置文件数据处理 
    openProjectDataParse(importProjectPath:any){
        const nameIndex:number = importProjectPath.lastIndexOf("\\");
        const projectConfigProjectPath:string = importProjectPath.substring(0,nameIndex);
        const projectConfigProjectName:string = importProjectPath.substring(nameIndex+1);
        const projectConfigProjectType:string =  projectJsonParse.getProjectConfigProjectType(importProjectPath);
        // const porjectConfigVersion:string = projectJsonParse.getProjectConfigVersion(importProjectPath);
        let porjectConfigModuleModel:string = projectJsonParse.getProjectConfigModuleModel(importProjectPath);
        const projectConfigCorePath:string = projectJsonParse.getProjectConfigCorePath(importProjectPath);
        const projectConfigLibPath:string = projectJsonParse.getProjectConfigLibPath(importProjectPath);
        // const projectConfigModulePort:string = projectJsonParse.getProjectConfigMoudlePort(importProjectPath);
        // const projectConfigAppFile:string = projectJsonParse.getProjectConfigAppFile(importProjectPath);
        let openProjectJson:any = {};
        openProjectJson.type = projectConfigProjectType;
        openProjectJson.importInitData = '';
        openProjectJson.correctData = {};
        openProjectJson.errorData = {};
        openProjectJson.correctData.projectName = projectConfigProjectName;
        openProjectJson.correctData.projectPath = projectConfigProjectPath;
        if (porjectConfigModuleModel==='') {
            porjectConfigModuleModel = 'air72XUX/air82XUX';
        }
        openProjectJson.correctData.moduleModel = porjectConfigModuleModel;
        if (!fs.existsSync(projectConfigCorePath)) {
            openProjectJson.errorData.corePath = projectConfigCorePath;
        }
        else{
            openProjectJson.correctData.corePath = projectConfigCorePath;
        }
        if (!fs.existsSync(projectConfigLibPath)) {
            openProjectJson.errorData.libPath = projectConfigLibPath;
        }
        else{
            openProjectJson.correctData.libPath = projectConfigLibPath;
        }
        return openProjectJson;
    }

    // 获取打开工程用户交互选择的工程路径
    async getOpenProjectUserSelectdPath(options:any){
        let importProjectPathResult = await vscode.window.showOpenDialog(options).then(
            async (result) => {
			if (result !== undefined) {
				const importProjectPath = result[0].fsPath.toString();
				if (!fs.existsSync(path.join(importProjectPath,'luatide_project.json'))) {
					const selectProjectPath:any =  await vscode.window.showErrorMessage("该项目未配置工程，是否配置？", { modal: true }, "是").then(optionsResult =>  {
						if (optionsResult === '是') {
                            projectJsonParse.generateProjectJson(importProjectPath);
                            const appFile:string[] = getFileForDirRecursion(importProjectPath);
                            projectJsonParse.pushProjectConfigAppFile(appFile,importProjectPath);
                            return importProjectPath;
						}
				});
                return selectProjectPath;
            }
				else {
                    return  importProjectPath;
				}
                
            };
        });
        return importProjectPathResult;
    }
}