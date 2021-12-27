import { PluginJsonParse } from "../plugConfigParse";
import * as vscode from 'vscode';
import * as fs from "fs";
import * as path from "path";
import { deleteDirRecursive } from './projectApi';
import { ProjectJsonParse } from "./projectConfigParse";
import { NodeDependenciesProvider } from "./projectTreeView";

let pluginJsonParse: any = new PluginJsonParse();
let projectJsonParse: any = new ProjectJsonParse();

// 激活工程处理
export class ProjectActiveHandle {
    constructor() {

    }

    // 激活工程操作
    projectActive(filePath: any) {
        const projectActivePath: string = filePath.path;
        const projectActiveCheckState: boolean = this.projectActiveCheck(projectActivePath);
        if (!projectActiveCheckState) { //激活工程必要条件检查失败
            return false;
        }
        pluginJsonParse.setPluginConfigActiveProject(projectActivePath);
    }

    // 激活工程必要条件检查
    projectActiveCheck(dir: any) {
        const projectList: any = pluginJsonParse.getPluginConfigUserProjectAbsolutePathList();
        if (projectList.indexOf(dir) === -1) {
            vscode.window.showErrorMessage("选择激活工程未在用户工程列表中发现,请重新激活", { modal: true });
            return false;
        }
        if (fs.statSync(dir).isFile()) {
            vscode.window.showErrorMessage("选择激活的不是一个工程,请重新激活", { modal: true });
            return false;
        }
        const configPath: string = path.join(dir, 'luatide_project.json');
        if (!fs.existsSync(configPath)) {    //工程配置文件有效性检查
            vscode.window.showErrorMessage('当前点击激活路径未检测到工程配置文件,不支持激活到活动工程，请重新检查');
            return false;
        }
        return true;
    }

    // 工程配置文件有效性检查
    projectConfigEffectivenessCheck(dir: any) {
        const configPath: string = path.join(dir, 'luatide_project.json');
        if (fs.existsSync(configPath)) {
            return true;
        }
        return false;
    }
}

// 删除工程处理
export class ProjectDeleteHandle {
    constructor() {

    }

    deleteProject(filePath: any) {
        const clickPath: string = filePath.parentPath;
        const deletProjectCheckState: boolean = this.deletProjectCheck(filePath);
        if (!deletProjectCheckState) {   //工程删除必要条件检查未通过
            return false;
        }
        vscode.window.showWarningMessage('是否删除该工程', { modal: true }, '移除工程', '删除本地文件').then(result => {
            this.deleteProjectUserInteractionHint(result, filePath);
        });
    }

    // 工程删除用户交互提示
    deleteProjectUserInteractionHint(result: any, filePath: any) {
        const projectName: string = filePath.label;
        const projectPath = filePath.path;
        let activeProject: string;
        switch (result) {
            case '移除工程':
                pluginJsonParse.popPluginConfigProject(projectName);
                // 活动工程置空
                activeProject = '';
                pluginJsonParse.setPluginConfigActiveProject(activeProject);
                new NodeDependenciesProvider('c://');
                vscode.commands.executeCommand('luatide-history-project.Project.refresh');
                break;
            case '删除本地文件':
                vscode.window.showWarningMessage("该操作会彻底删除本地工程文件夹，是否确定？", { modal: true }, "确定").then(result => {
                    pluginJsonParse.popPluginConfigProject(projectName);
                    // 活动工程置空
                    activeProject = '';
                    pluginJsonParse.setPluginConfigActiveProject(activeProject);
                    deleteDirRecursive(projectPath);
                    new NodeDependenciesProvider('c://');
                    vscode.commands.executeCommand('luatide-history-project.Project.refresh');
                });
                break;
        }
    }

    // 工程删除必要条件检查
    deletProjectCheck(filePath: any) {
        if (!fs.existsSync(filePath.path)) {
            vscode.window.showErrorMessage("选定的路径文件状态已改变，将从配置文件列表中删除该工程");
            return false;
        }
        const pluginConfigAppFile: any = pluginJsonParse.getPluginConfigUserProjectList();
        if (pluginConfigAppFile.indexOf(filePath.label) === -1) {
            vscode.window.showErrorMessage(`用户工程列表中未检测到${filePath.lable}工程,请重新确认`);
            return false;
        }
        if (fs.statSync(filePath.path).isFile()) {
            vscode.window.showErrorMessage("选择删除的不是一个工程,请重新选择");
            return false;
        }
        return true;
    }
}

// 工程配置项处理
export class ProjectConfigOperation {
    constructor() {

    }

    // 工程配置项处理
    projectConfigOperation() {
        const activityProjectPath = pluginJsonParse.getPluginConfigActiveProject();
        if (activityProjectPath === '') {
            return false;
        }
        this.projectConfigOperationUserInteractionInit();
    }

    // 活动工程配置操作用户交互提示
    projectConfigOperationUserInteractionInit() {
        vscode.window.showQuickPick(
            [
                "添加文件",
                "添加文件夹",
                "配置core文件",
                "配置lib库文件",
                "配置模块型号/模拟器",
                "显示配置文件"
            ],
            {
                canPickMany: false,
                ignoreFocusOut: false,
                matchOnDescription: true,
                matchOnDetail: true,
                placeHolder: '请选择配置项'
            })
            .then((msg) => this.projectConfigOperationHandle(msg));
    }

    // 活动工程配置操作分析处理
    projectConfigOperationHandle(msg: any) {
        switch (msg) {
            case "配置core文件":
                this.selectProjectCorePathOperation();
            case "配置lib库文件":
                this.selectProjectLibPathOperation();
            case "添加文件":
                this.selectProjectFileAddOperation();
            case "添加文件夹":
                this.selectProjectFolderAddOperation();
            case "配置模块型号/模拟器":
                this.selectProjectModuleModel();
            case "显示配置文件":
                this.openShowProjectConfig();
        }
    }

    // 打开文件资源管理器接口选择core文件
    selectProjectCorePathOperation() {
        const activityProjectPath = pluginJsonParse.getPluginConfigActiveProject();
        const options = {
            canSelectFiles: true,		//是否选择文件
            canSelectFolders: false,		//是否选择文件夹
            canSelectMany: false,		//是否选择多个文件
            defaultUri: vscode.Uri.file(activityProjectPath),	//默认打开文件位置
            openLabel: '选择底包',
            filters: {
                json: ['pac', "soc"], // 文件类型过滤
            },
        };
        const corePath: any = this.showOpenDialog(options);
        if (corePath !== undefined) {
            projectJsonParse.setProjectConfigCorePath(corePath, activityProjectPath);
        }
    }

    // 打开文件资源管理器接口选择lib文件
    selectProjectLibPathOperation() {
        const activityProjectPath = pluginJsonParse.getPluginConfigActiveProject();
        const options = {
            canSelectFiles: false,		//是否选择文件
            canSelectFolders: true,		//是否选择文件夹
            canSelectMany: false,		//是否选择多个文件
            defaultUri: vscode.Uri.file(activityProjectPath),	//默认打开文件位置
            openLabel: '选择lib库'
        };
        const libPath: any = this.showOpenDialog(options);
        if (libPath !== undefined) {
            projectJsonParse.setProjectConfigLibPath(libPath, activityProjectPath);
        }
    }

    // 打开文件资源管理器接口选择添加文件
    selectProjectFileAddOperation() {
        const activityProjectPath = pluginJsonParse.getPluginConfigActiveProject();
        const options = {
			canSelectFiles: true,		//是否选择文件
			canSelectFolders: false,		//是否选择文件夹
			canSelectMany: true,		//是否选择多个文件
			defaultUri: vscode.Uri.file(activityProjectPath),	//默认打开文件位置
			openLabel: '选择需要导入工程的文件'
		};
        const fileObjList: any = this.showOpenDialog(options);
        if (fileObjList!==undefined) {
           for (let index = 0; index < fileObjList.length; index++) {
               const filePath:string = fileObjList[index].fsPath;
               const projectAddCheckState:boolean = this.projectAddCheck(filePath);
               if (!projectAddCheckState) {
                   return false;
               }
               projectJsonParse.pushProjectConfigAppFile(filePath,activityProjectPath);
           } 
        }
    }

    // 打开文件资源管理器接口选择添加文件夹
    selectProjectFolderAddOperation() {
        const activityProjectPath = pluginJsonParse.getPluginConfigActiveProject();
        const options = {
            canSelectFiles: false,		//是否选择文件
            canSelectFolders: true,		//是否选择文件夹
            canSelectMany: true,		//是否选择多个文件
            defaultUri: vscode.Uri.file(activityProjectPath),	//默认打开文件位置
            openLabel: '选择需要导入工程的文件夹'
        };
        const fileObjList: any = this.showOpenDialog(options);
        if (fileObjList!==undefined) {
            for (let index = 0; index < fileObjList.length; index++) {
                const filePath:string = fileObjList[index].fsPath;
                const projectAddCheckState:boolean = this.projectAddCheck(filePath);
                if (!projectAddCheckState) {
                    return false;
                }
                projectJsonParse.pushProjectConfigAppFile(filePath,activityProjectPath);
            } 
        }
    }

    // 添加至活动工程的文件、文件夹必要条件校验
    projectAddCheck(filePath:string){
        const activityPath:string = pluginJsonParse.getPluginConfigActiveProject();
        const appFile:any = projectJsonParse.getProjectConfigAppFile();
        if (filePath.indexOf(activityPath)!==-1) {
            vscode.window.showErrorMessage("LuatIDE不支持添加非工程内文件至工程",{modal: true});
            return false;
        }
        if (appFile.indexOf(filePath)!==-1) {
            vscode.window.showErrorMessage("该文件已存在于工程，不能重复添加",{modal: true});
            return false;
        }
        if (filePath===activityPath){
            vscode.window.showErrorMessage("不支持导入工程自身",{modal: true});
            return false;
        }
        if (filePath===path.join(activityPath,'luatide_project.json')) {
            vscode.window.showErrorMessage("不支持导入LuatIDE工程配置文件",{modal: true});
            return false;
        }
        return true;
    }

    // 打开文件资源管理器接口
    async showOpenDialog(options: any) {
        let result = await vscode.window.showOpenDialog(options).then(result => {
            if (result !== undefined && result.length===1) {
                // 显示用户选择的路径
                const selectPath: string = result[0].fsPath;
                return selectPath;
            }
            if (result !== undefined && result.length>=1) {
                // 显示用户选择的列表对象
                return result;
            }
            return undefined;
        });
        return result;
    }
      
    // 选择配置模块型号,模拟器
    selectProjectModuleModel(){
        vscode.window.showQuickPick(
			[
				"air72XUX/Air82XUX",
				"air72XCX",
				"air10X",
				"simulator"
			],
			{
				canPickMany:false,
				ignoreFocusOut:false,
				matchOnDescription:true,
				matchOnDetail:true,
				placeHolder:'请选择模块型号'
			}).then((msg) =>{
                if (msg!==undefined) {
                    projectJsonParse.setProjectConfigModuleModel(msg);
                }
            });
		}
    
    //显示配置文件
    openShowProjectConfig(){
        const activityProjectPath:string = pluginJsonParse.getPluginConfigActiveProject();
        const activityProjectConfigPath:string = path.join(activityProjectPath,'luatide_project.json');
        vscode.window.showTextDocument(vscode.Uri.file(activityProjectConfigPath));
    }
}

// 工程内资源文件删除处理
export class ProjectSoruceFileDelete{
    constructor(){

    }

    // 删除工程内指定文件或文件夹
    projectSourceFileDelete(filePath:any){
        const projectAppFile:any = projectJsonParse.getProjectConfigAppFile();
        const selectPath:any = path.join(filePath.parentPath,filePath.label);
        if (projectAppFile.indexOf(filePath)!==-1) {
            this.projectSourceFileDeleteHint(selectPath);
        }
    }
    
    // 删除工程内文件提示
    projectSourceFileDeleteHint(dirPath:string){
        const activityProjectPath = pluginJsonParse.getPluginConfigActiveProject();
        vscode.window.showWarningMessage("【从工程中删除选中文件（不删除本地文件）】", { modal: true }, "确定").then(result => {
            if (result === '确定') {
                projectJsonParse.popProjectConfigAppFile(dirPath,activityProjectPath);
            }
        });
    }
}
