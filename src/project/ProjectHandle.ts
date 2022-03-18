// import { PluginJsonParse } from "../plugConfigParse";
import * as vscode from 'vscode';
import * as fs from "fs";
import * as path from "path";
import { deleteDirRecursive, getFileForDirRecursion } from './projectApi';
// import { ProjectJsonParse } from "./projectConfigParse";
import { activityMemoryProjectPathBuffer } from "../extension";
import { getActivityProjectConfigOptionsList, getDefaultWorkspacePath } from "../variableInterface";
import { getPluginConfigActivityProject, getPluginConfigUserProjectAbsolutePathList, getPluginConfigUserProjectList, popPluginConfigProject, projectConfigCompatible, setPluginConfigActivityProject } from '../plugConfigParse';
import { getProjectConfigAppFile, getProjectConfigModuleModel, popProjectConfigAppFile, pushProjectConfigAppFile, setProjectConfigCorePath, setProjectConfigLibPath, setProjectConfigModuleModel } from './projectConfigParse';

import * as ideServer from '../serverInterface';


// 激活工程处理
export class ProjectActiveHandle {
    constructor() {

    }

    // 激活工程操作
    projectActive(filePath: any) {
        const projectActivePath: string = path.join(filePath.path,filePath.label);
        const projectActiveCheckState: boolean = this.projectActiveCheck(projectActivePath);
        if (!projectActiveCheckState) { //激活工程必要条件检查失败
            return false;
        }
        // 激活工程前做兼容性处理
        projectConfigCompatible(projectActivePath);
        // 执行激活到资源管理器命令
        vscode.window.showInformationMessage('请选择激活工程的打开方式',{modal:true},"当前窗口打开","新窗口打开").then(
            result =>{
                if (result==='当前窗口打开') {
                    setPluginConfigActivityProject(projectActivePath);
                    activityMemoryProjectPathBuffer.activityMemoryProjectPath = projectActivePath;
                    vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
                    vscode.commands.executeCommand("vscode.openFolder",vscode.Uri.file(projectActivePath),false);
                }
                else if(result === '新窗口打开'){
                    setPluginConfigActivityProject(projectActivePath);
                    // activityMemoryProjectPathBuffer.activityMemoryProjectPath = projectActivePath;
                    vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
                    vscode.commands.executeCommand("vscode.openFolder",vscode.Uri.file(projectActivePath),true);
                }
            }
        );   
    }

    // 激活工程必要条件检查
    projectActiveCheck(dir: any) {
        const projectList: any = getPluginConfigUserProjectAbsolutePathList();
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

    async deleteProject(filePath: any) {
        // const clickPath: string = filePath.path;
        const deletProjectCheckState: boolean = await this.deletProjectCheck(filePath);
        if (!deletProjectCheckState) {   //工程删除必要条件检查未通过
            return false;
        }
        await vscode.window.showWarningMessage('是否删除该工程', { modal: true }, '移除工程', '删除本地文件').then(async result => {
            await this.deleteProjectUserInteractionHint(result, filePath);
        });
    }

    // 工程删除用户交互提示
    async deleteProjectUserInteractionHint(result: any, filePath: any) {
        const projectName: string = filePath.label;
        const projectParentPath:string = filePath.path;
        const projectPath:string = path.join(projectParentPath,projectName);
        let activeProject: string = getPluginConfigActivityProject();
        switch (result) {
            case '移除工程':
                popPluginConfigProject(projectName);
                if (activeProject!=='' && projectPath.toLowerCase().indexOf(activeProject.toLowerCase())!==-1) {
                    // 活动工程置空
                    activeProject = '';
                    activityMemoryProjectPathBuffer.activityMemoryProjectPath = '';
                    setPluginConfigActivityProject(activeProject);
                }
                vscode.commands.executeCommand('luatide-history-project.Project.refresh');
                vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
                break;
            case '删除本地文件':
                await vscode.window.showWarningMessage("该操作会彻底删除本地工程文件夹，是否确定？", { modal: true }, "确定").then(async result => {
                    await popPluginConfigProject(projectName);
                    if (activeProject!=='' && projectPath.toLocaleLowerCase().indexOf(activeProject.toLocaleLowerCase())!==-1) {
                        // 活动工程置空
                        activeProject = '';
                        activityMemoryProjectPathBuffer.activityMemoryProjectPath = '';
                        await setPluginConfigActivityProject(activeProject);
                    }
                    vscode.workspace.updateWorkspaceFolders(0,vscode.workspace.workspaceFolders?.length);
                    await deleteDirRecursive(projectPath);
                    await vscode.commands.executeCommand('luatide-history-project.Project.refresh');
                    await vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
                });
                break;
        }
    }

    // 工程删除必要条件检查
    deletProjectCheck(filePath: any) {
        if (!fs.existsSync(path.join(filePath.path,filePath.label))) {
            popPluginConfigProject(filePath.label);
            const activityProjectPath:string = getPluginConfigActivityProject();
            if (path.join(filePath.path,filePath.label).toLocaleLowerCase()===activityProjectPath.toLocaleLowerCase()) {
                setPluginConfigActivityProject('');
            }
            vscode.window.showInformationMessage(`选定的${filePath.label}工程路径状态已改变，已从配置文件列表中删除该工程`);
            vscode.commands.executeCommand('luatide-history-project.Project.refresh');
            vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
            return false;
        }
        const pluginConfigAppFile: any = getPluginConfigUserProjectList();
        if (pluginConfigAppFile.indexOf(filePath.label) === -1) {
            vscode.window.showInformationMessage(`用户工程列表中未检测到${filePath.label}工程,已为您刷新用户工程`);
            vscode.commands.executeCommand('luatide-history-project.Project.refresh');
            vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
            return false;
        }
        if (fs.statSync(path.join(filePath.path,filePath.label)).isFile()) {
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
        const activityProjectPath = getPluginConfigActivityProject();
        if (activityProjectPath === '') {
            vscode.window.showErrorMessage("当前未检测到活动工程,请先激活工程后再配置");
            return false;
        }
        const moduleModel:string = getProjectConfigModuleModel(activityProjectPath);
        this.projectConfigOperationUserInteractionInit(moduleModel);
    }

    // 活动工程配置操作用户交互提示
    projectConfigOperationUserInteractionInit(moduleModel:string) {
        vscode.window.showQuickPick(
            getActivityProjectConfigOptionsList(moduleModel),
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
                break;
            case "配置lib库文件":
                this.selectProjectLibPathOperation();
                break;
            case "添加文件":
                this.selectProjectFileAddOperation();
                break;
            case "添加文件夹":
                this.selectProjectFolderAddOperation();
                break;
            case "配置模块型号/模拟器":
                this.selectProjectModuleModel();
                break;
            case "显示配置文件":
                this.openShowProjectConfig();
                break;
        }
    }

    // 打开文件资源管理器接口选择core文件
    async selectProjectCorePathOperation() {
        const activityProjectPath = getPluginConfigActivityProject();
        const options = {
            canSelectFiles: true,		//是否选择文件
            canSelectFolders: false,		//是否选择文件夹
            canSelectMany: false,		//是否选择多个文件
            defaultUri: vscode.Uri.file(activityProjectPath),	//默认打开文件位置
            openLabel: '选择底包',
            filters: {
                json: ['pac', "soc", "zip"], // 文件类型过滤
            },
        };
        const corePathList: any = await this.showOpenDialog(options);
        if (corePathList !== undefined) {
            for (let index = 0; index < corePathList.length; index++) {
                const filePath: string = corePathList[index].fsPath;
                const libCoreCheckState: boolean = this.libCoreCheck(filePath);
                if (!libCoreCheckState) {
                    return false;
                }
                setProjectConfigCorePath(filePath, activityProjectPath);
                vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
            }
        }
    }

    // 打开文件资源管理器接口选择lib文件
    async selectProjectLibPathOperation() {
        const activityProjectPath = getPluginConfigActivityProject();
        const options = {
            canSelectFiles: false,		//是否选择文件
            canSelectFolders: true,		//是否选择文件夹
            canSelectMany: false,		//是否选择多个文件
            defaultUri: vscode.Uri.file(activityProjectPath),	//默认打开文件位置
            openLabel: '选择lib库'
        };
        const libPathList: any = await this.showOpenDialog(options);
        if (libPathList !== undefined) {
            for (let index = 0; index < libPathList.length; index++) {
                const filePath: string = libPathList[index].fsPath;
                const libCoreCheckState: boolean = this.libCoreCheck(filePath);
                if (!libCoreCheckState) {
                    return false;
                }
                setProjectConfigLibPath(filePath, activityProjectPath);
                vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
            }
        }
    }

    // 打开文件资源管理器接口选择添加文件
    async selectProjectFileAddOperation() {
        const activityProjectPath = getPluginConfigActivityProject();
        const options = {
			canSelectFiles: true,		//是否选择文件
			canSelectFolders: false,		//是否选择文件夹
			canSelectMany: true,		//是否选择多个文件
			defaultUri: vscode.Uri.file(activityProjectPath),	//默认打开文件位置
			openLabel: '选择需要导入工程的文件'
		};
        const fileObjList: any = await this.showOpenDialog(options);
        if (fileObjList !== undefined) {
            const filePathList: string[] = [];
            for (let index = 0; index < fileObjList.length; index++) {
                const filePath: string = fileObjList[index].fsPath;
                const projectAddCheckState: boolean = this.projectAddCheck(filePath);
                if (!projectAddCheckState) {
                    return false;
                }
                const relativeFilePath:string = path.relative(activityProjectPath,filePath);
                filePathList.push(relativeFilePath);
            }
            pushProjectConfigAppFile(filePathList, activityProjectPath);
            vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
        }
    }

    // 打开文件资源管理器接口选择添加文件夹
    async selectProjectFolderAddOperation() {
        const activityProjectPath = getPluginConfigActivityProject();
        const options = {
            canSelectFiles: false,		//是否选择文件
            canSelectFolders: true,		//是否选择文件夹
            canSelectMany: true,		//是否选择多个文件
            defaultUri: vscode.Uri.file(activityProjectPath),	//默认打开文件位置
            openLabel: '选择需要导入工程的文件夹'
        };
        const fileObjList: any = await this.showOpenDialog(options);
        if (fileObjList !== undefined) {
            let folderPathList: string[] = [];
            for (let index = 0; index < fileObjList.length; index++) {
                const filePath: string = fileObjList[index].fsPath;
                const relativeFilePath:string = path.relative(activityProjectPath,filePath);
                const projectAddCheckState: boolean = this.projectAddCheck(filePath);
                if (!projectAddCheckState) {
                    return false;
                }
                // 获取添加文件夹内所有子文件夹内容并加上文件夹自身
                const folderChildrenList:string[]|undefined = getFileForDirRecursion(activityProjectPath,filePath);
                if (folderChildrenList===undefined) {
                    return;
                }
                folderChildrenList.push(relativeFilePath);
                folderPathList = folderPathList.concat(folderChildrenList);
            }
            pushProjectConfigAppFile(folderPathList, activityProjectPath);
            vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
        }
    }

    // 添加至活动工程的文件、文件夹必要条件校验
    projectAddCheck(filePath:string){
        const activityPath:string = getPluginConfigActivityProject();
        const appFile:any = getProjectConfigAppFile(activityPath);
        if (filePath.toLocaleLowerCase().indexOf(activityPath.toLocaleLowerCase())===-1) {
            vscode.window.showErrorMessage("LuatIDE不支持添加非工程内文件至工程",{modal: true});
            return false;
        }
        if (appFile.indexOf(filePath)!==-1) {
            vscode.window.showErrorMessage("该文件已存在于工程，不能重复添加",{modal: true});
            return false;
        }
        if (filePath.toLocaleLowerCase()===activityPath.toLocaleLowerCase()){
            vscode.window.showErrorMessage("不支持导入工程自身",{modal: true});
            return false;
        }
        if (filePath.toLocaleLowerCase()===path.join(activityPath,'luatide_project.json').toLocaleLowerCase()) {
            vscode.window.showErrorMessage("不支持导入LuatIDE工程配置文件",{modal: true});
            return false;
        }
        return true;
    }

    // lib库及core文件设置必要条件校验
    libCoreCheck(filePath:string){
        const activityPath:string = getPluginConfigActivityProject();
        // const appFile:any = projectJsonParse.getProjectConfigAppFile(activityPath);
        if (filePath.toLocaleLowerCase()===activityPath.toLocaleLowerCase()){
            vscode.window.showErrorMessage("不支持设置工程自身",{modal: true});
            return false;
        }
        if (filePath.toLocaleLowerCase()===path.join(activityPath,'luatide_project.json').toLocaleLowerCase()) {
            vscode.window.showErrorMessage("不支持设置LuatIDE工程配置文件",{modal: true});
            return false;
        }
        return true;
    }

    // 打开文件资源管理器接口
    async showOpenDialog(options: any) {
        const addFileList = await vscode.window.showOpenDialog(options).then(result => {
            if (result !== undefined && result.length===1) {
                // 显示用户选择的路径
                // const selectPath: string = result[0].fsPath;
                return result;
            }
            if (result !== undefined && result.length>=1) {
                // 显示用户选择的列表对象
                return result;
            }
            return undefined;
        });
        return addFileList;
    }
      
    // 选择配置模块型号,模拟器
    async selectProjectModuleModel(){
        const activityPath:string = getPluginConfigActivityProject();
        const result:any = await vscode.window.showQuickPick(
			[
				"air72XUX/Air82XUX",
				"air72XCX",
				"air101",
                "air103",
                "air105",
				"simulator"
			],
			{
				canPickMany:false,
				ignoreFocusOut:false,
				matchOnDescription:true,
				matchOnDetail:true,
				placeHolder:'请选择模块型号'
			}).then((msg) =>{
                    return msg;
            });
            if (result!==undefined) {
                setProjectConfigModuleModel(result,activityPath);
                vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
            }
		}
    
    //显示配置文件
    openShowProjectConfig(){
        const activityProjectPath:string = getPluginConfigActivityProject();
        const activityProjectConfigPath:string = path.join(activityProjectPath,'luatide_project.json');
        vscode.window.showTextDocument(vscode.Uri.file(activityProjectConfigPath));
    }
}

// 工程内资源文件删除处理
export class ProjectSoruceFileDelete{
    constructor(){

    }

    //删除活动工程所有内容处理
    deleteActivityProject(){
        if (activityMemoryProjectPathBuffer==='') {
            return;
        }
        setPluginConfigActivityProject('');
        activityMemoryProjectPathBuffer.activityMemoryProjectPath = '';
        vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
    }  

    // 删除工程内指定文件或文件夹
    projectSourceFileDelete(filePath:any){
        const selectPath:any = path.join(filePath.parentPath,filePath.label);
        if (!fs.existsSync(selectPath)) {
            vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
            return;
        }
        const activityPath:string = getPluginConfigActivityProject();
        const projectAppFile:any = getProjectConfigAppFile(activityPath);
        const relativeSelectFilePath:string = path.relative(activityPath,selectPath);
        if (selectPath===activityPath) {
            this.deleteActivityProject();
        }
        else if (projectAppFile.indexOf(relativeSelectFilePath)!==-1) {
            this.projectSourceFileDeleteHint(selectPath);
        }
    }
    
    // 删除工程内文件提示
    projectSourceFileDeleteHint(dirPath:string){
        const activityProjectPath = getPluginConfigActivityProject();
        vscode.window.showWarningMessage("【从工程中删除选中文件（不删除本地文件）】", { modal: true }, "确定").then(result => {
            if (result === '确定') {
                popProjectConfigAppFile(dirPath,activityProjectPath);
                vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
            }
        });
    }
}

// 获取用户工程默认工作空间当前最新工程默认序号列表
export function getDefaultWorkspaceProjectSerialNumberArray() {
    const pluginDefaultWorkspacePath:string = getDefaultWorkspacePath();
    // 获取当前文件夹下的所有工程名称
    const projectArray:string[] = fs.readdirSync(pluginDefaultWorkspacePath);
    let projectSerialNumberArray:number[] = [];
    for (let i = 0; i < projectArray.length; i++) {
        const projectName = projectArray[i];
        // 对工程名称进行正则解析提取出序号
        const reg:any = /myProject([\d]+)/ig;
        const projectSerialNumberRegArray:any = reg.exec(projectName);
        if (projectSerialNumberRegArray) {
            const projectNumber:number = Number(projectSerialNumberRegArray[1]);
            projectSerialNumberArray.push(projectNumber);
        }
    }
   
    return projectSerialNumberArray;
    // return 序号列表 
} 

// 默认工程名称递归增加
export function getDefaultProjectName() {
    const projectSerialNumberArray:number[] = getDefaultWorkspaceProjectSerialNumberArray();
    for (let defaultProjectSerialNumber:number = 1; defaultProjectSerialNumber <= 1000; defaultProjectSerialNumber++) {
        if (projectSerialNumberArray.indexOf(defaultProjectSerialNumber)===-1) {
            return 'myProject'+defaultProjectSerialNumber;
        }
    }
    console.log('默认工作空间工程数量达到最大限制值1000');
    return 'myProject';
}

// 导出量产文件
export async function exportProducFile() {
    // 这里返回false的话说明不在调试状态，中端没有启动，我需要先去启动中端
    if(ideServer.connectStatus()===false)
    {
        await ideServer.open(null);
        const activeWorkspace = getPluginConfigActivityProject();	
        ideServer.sendData(ideServer.cmdType.server,"work_path",activeWorkspace);
        const plugPath: string = path.join(__dirname, "../..");
        ideServer.sendData(ideServer.cmdType.server,"plug_path",plugPath);
        ideServer.sendData(ideServer.cmdType.server, "producFileGen", "");
        ideServer.close();
        return;
    }
    // 如果中端正在运行，就直接发送指令
    ideServer.sendData(ideServer.cmdType.server, "producFileGen", "");
}