import * as vscode from 'vscode';
import { PluginJsonParse } from '../plugConfigParse';
import {ProjectJsonParse} from './projectConfigParse';
// import {checkSameProjectExistStatusForPluginConfig, getFileForDirRecursion} from './projectApi';
import {getFileForDirRecursion} from './projectApi';
// import { ProjectConfigOperation } from './ProjectHandle';
import * as path from 'path';
import * as fs from 'fs';
import { OpenProjectManage } from '../webview/openProjectWebview';
import { PluginVariablesInit } from '../config';

let pluginJsonParse:any = new PluginJsonParse(); 
let projectJsonParse:any = new ProjectJsonParse(); 
let pluginVariablesInit = new PluginVariablesInit();
// let projectConfigOperation:any = new ProjectConfigOperation();
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
        // 打开工程导入前做兼容性处理
        pluginJsonParse.projectConfigCompatible(importProjectPath);
        // 解析活动工程配置传送至打开工程webview
        const openProjectJson  = this.openProjectDataParse(importProjectPath);
        const projectJson = projectJsonParse.getProjectConfigJson(importProjectPath);
        const importProjectInitJson = this.getImportProjectInitJson(projectJson);
        let openProjectManage =  new OpenProjectManage();
        openProjectManage.openProjectManage(context,openProjectJson,importProjectInitJson);
    }

    // 获取数据接口工程
    getImportProjectInitJson(projectJson:any){
        let importProjectInitJson = {
            "projectType":"",
            "data":{
                "libList":[],
                "coreList":[],
                "exampleList":[]
            }
        };
        const projectType:string = projectJson.projectType;
        const moudleModel:string = projectJson.moduleModel;
        const libList = pluginVariablesInit.getLibListBaseMoudeleMode(moudleModel);
        const coreList = pluginVariablesInit.getCoreListBaseMoudeleMode(moudleModel);
        const exampleList = pluginVariablesInit.getExampleListBaseMoudeleMode(moudleModel);
        importProjectInitJson.projectType=projectType;
        importProjectInitJson.data.libList=libList;
        importProjectInitJson.data.coreList=coreList;
        if (projectType==='example') {
            importProjectInitJson.data.exampleList=exampleList;
        }
        return importProjectInitJson;
    }   


    //打开工程工程配置文件数据处理 
    openProjectDataParse(importProjectPath:any){
        const nameIndex:number = importProjectPath.lastIndexOf("\\");
        const projectConfigProjectPath:string = importProjectPath.substring(0,nameIndex);
        const projectConfigProjectName:string = importProjectPath.substring(nameIndex+1);
        const projectConfigProjectType:string =  projectJsonParse.getProjectConfigProjectType(importProjectPath);
        // const porjectConfigVersion:string = projectJsonParse.getProjectConfigVersion(importProjectPath);
        const porjectConfigModuleModel:string = projectJsonParse.getProjectConfigModuleModel(importProjectPath);
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
						// else if (optionsResult === '否') {
						// 	vscode.window.showInformationMessage("不是有效的工程,请重新选择");
                        //     return undefined;
						// }
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