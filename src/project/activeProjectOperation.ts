import path = require('path');
import * as vscode from 'vscode';
import { getActiveProjectFileList } from '../activeProjectCheck';
import { getPluginConfigActivityProject } from '../plugConfigParse';
import { getAir72XCXModuleModelName, getHistoryCorePath, getHistoryLibPath } from '../variableInterface';
//import { activeProjectConfig } from '../webview/configWebview';
// import { downloadConfigDisplay } from './checkFile';
import { activeProjectManage } from './checkFileWebview';
import { getFileForDirRecursion } from './projectApi';
import { getProjectConfigAppFile, pushProjectConfigAppFile, setProjectConfigCorePath, setProjectConfigLibPath, setProjectConfigModuleModel } from './projectConfigParse';

// 工程配置项处理
export async function projectConfigOperation(context: vscode.ExtensionContext) {
    const activityProjectPath = getPluginConfigActivityProject();
    if (activityProjectPath === '') {
        vscode.window.showErrorMessage("No active project is currently detected, please activate the project before configuring");
        return false;
    }
    //activeProjectConfig(context);
    let all = await getActiveProjectFileList(activityProjectPath);
    let json = {
        "all": all,
        "new": [],
    };
    // await downloadConfigDisplay(context, json, true);
    activeProjectManage(context,json,true,false);
}

// 打开文件资源管理器接口选择core文件
export async function selectProjectCorePathOperation() {
    const activityProjectPath = getPluginConfigActivityProject();
    const corePath = getHistoryCorePath();
    const options = {
        canSelectFiles: true,		//是否选择文件
        canSelectFolders: false,		//是否选择文件夹
        canSelectMany: false,		//是否选择多个文件
        defaultUri: vscode.Uri.file(corePath),	//默认打开文件位置
        openLabel: 'Choose format',
        filters: {
            json: ['pac', "soc", "zip"], // 文件类型过滤
        },
    };
    const corePathList: any = await showOpenDialog(options);
    if (corePathList !== undefined) {
        for (let index = 0; index < corePathList.length; index++) {
            const filePath: string = corePathList[index].fsPath;
            const libCoreCheckState: boolean = libCoreCheck(filePath);
            if (!libCoreCheckState) {
                return "";
            }
            setProjectConfigCorePath(filePath, activityProjectPath);
            return filePath;
        }
    }
}

// 打开文件资源管理器接口选择lib文件
export async function selectProjectLibPathOperation() {
    const activityProjectPath = getPluginConfigActivityProject();
    const libPath = getHistoryLibPath();
    const options = {
        canSelectFiles: false,		//是否选择文件
        canSelectFolders: true,		//是否选择文件夹
        canSelectMany: false,		//是否选择多个文件
        defaultUri: vscode.Uri.file(libPath),	//默认打开文件位置
        openLabel: 'Select library'
    };
    const libPathList: any = await showOpenDialog(options);
    if (libPathList !== undefined) {
        for (let index = 0; index < libPathList.length; index++) {
            const filePath: string = libPathList[index].fsPath;
            const libCoreCheckState: boolean = libCoreCheck(filePath);
            if (!libCoreCheckState) {
                return "";
            }
            setProjectConfigLibPath(filePath, activityProjectPath);
            // vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
            return filePath;
        }
    }
}

// 打开文件资源管理器接口选择添加文件
export async function selectProjectFileAddOperation() {
    const activityProjectPath = getPluginConfigActivityProject();
    const options = {
        canSelectFiles: true,		//是否选择文件
        canSelectFolders: false,		//是否选择文件夹
        canSelectMany: true,		//是否选择多个文件
        defaultUri: vscode.Uri.file(activityProjectPath),	//默认打开文件位置
        openLabel: 'Select the file to import the project'
    };
    const fileObjList: any = await showOpenDialog(options);
    if (fileObjList !== undefined) {
        const filePathList: string[] = [];
        for (let index = 0; index < fileObjList.length; index++) {
            const filePath: string = fileObjList[index].fsPath;
            const projectAddCheckState: boolean = projectAddCheck(filePath);
            if (!projectAddCheckState) {
                return false;
            }
            const relativeFilePath: string = path.relative(activityProjectPath, filePath);
            filePathList.push(relativeFilePath);
        }
        pushProjectConfigAppFile(filePathList, activityProjectPath);
        vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
    }
}

// 打开文件资源管理器接口选择添加文件夹
export async function selectProjectFolderAddOperation() {
    const activityProjectPath = getPluginConfigActivityProject();
    const options = {
        canSelectFiles: false,		//是否选择文件
        canSelectFolders: true,		//是否选择文件夹
        canSelectMany: true,		//是否选择多个文件
        defaultUri: vscode.Uri.file(activityProjectPath),	//默认打开文件位置
        openLabel: 'Select the folder where you want to import the project'
    };
    const fileObjList: any = await showOpenDialog(options);
    if (fileObjList !== undefined) {
        let folderPathList: string[] = [];
        for (let index = 0; index < fileObjList.length; index++) {
            const filePath: string = fileObjList[index].fsPath;
            const relativeFilePath: string = path.relative(activityProjectPath, filePath);
            const projectAddCheckState: boolean = projectAddCheck(filePath);
            if (!projectAddCheckState) {
                return false;
            }
            // 获取添加文件夹内所有子文件夹内容并加上文件夹自身
            const folderChildrenList: string[] | undefined = getFileForDirRecursion(activityProjectPath, filePath);
            if (folderChildrenList === undefined) {
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
export function projectAddCheck(filePath: string) {
    const activityPath: string = getPluginConfigActivityProject();
    const appFile: any = getProjectConfigAppFile(activityPath);
    if (filePath.toLocaleLowerCase().indexOf(activityPath.toLocaleLowerCase()) === -1) {
        vscode.window.showErrorMessage("LuatIDE does not support adding non-project files to the project", { modal: true });
        return false;
    }

    if (filePath.toLocaleLowerCase() === activityPath.toLocaleLowerCase()) {
        vscode.window.showErrorMessage("Importing the project itself is not supported", { modal: true });
        return false;
    }
    if (filePath.toLocaleLowerCase() === path.join(activityPath, 'luatide_project.json').toLocaleLowerCase()) {
        vscode.window.showErrorMessage("Importing LuatIDE project configuration files is not supported", { modal: true });
        return false;
    }
    for (let index = 0; index < appFile.length; index++) {
        const appFilePath: string = appFile[index];
        if (path.join(activityPath, appFilePath).toLocaleLowerCase() === filePath.toLocaleLowerCase()) {
            vscode.window.showErrorMessage("The file already exists in the project and cannot be added repeatedly", { modal: true });
            return false;
        }
    }
    return true;
}

// lib库及core文件设置必要条件校验
export function libCoreCheck(filePath: string) {
    const activityPath: string = getPluginConfigActivityProject();
    // const appFile:any = projectJsonParse.getProjectConfigAppFile(activityPath);
    if (filePath.toLocaleLowerCase() === activityPath.toLocaleLowerCase()) {
        vscode.window.showErrorMessage("Setting the project itself is not supported", { modal: true });
        return false;
    }
    if (filePath.toLocaleLowerCase() === path.join(activityPath, 'luatide_project.json').toLocaleLowerCase()) {
        vscode.window.showErrorMessage("Setting the LuatIDE project configuration file is not supported", { modal: true });
        return false;
    }
    return true;
}

// 打开文件资源管理器接口
export async function showOpenDialog(options: any) {
    const addFileList = await vscode.window.showOpenDialog(options).then(result => {
        if (result !== undefined && result.length === 1) {
            // 显示用户选择的路径
            // const selectPath: string = result[0].fsPath;
            return result;
        }
        if (result !== undefined && result.length >= 1) {
            // 显示用户选择的列表对象
            return result;
        }
        return undefined;
    });
    return addFileList;
}

// 选择配置模块型号
export async function selectProjectModuleModel() {
    const activityPath: string = getPluginConfigActivityProject();
    const air72XCXModuleModelName = getAir72XCXModuleModelName();
    const result: any = await vscode.window.showQuickPick(
        [
            "air72XUX/Air82XUX",
            air72XCXModuleModelName,
            "air101",
            "air103",
            "air105",
            "esp32c3"
        ],
        {
            canPickMany: false,
            ignoreFocusOut: false,
            matchOnDescription: true,
            matchOnDetail: true,
            placeHolder: 'Please select the module model'
        }).then((msg) => {
            return msg;
        });
    if (result !== undefined) {
        setProjectConfigModuleModel(result, activityPath);
        vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
    }
}

//显示配置文件
export function openShowProjectConfig() {
    const activityProjectPath: string = getPluginConfigActivityProject();
    const activityProjectConfigPath: string = path.join(activityProjectPath, 'luatide_project.json');
    vscode.window.showTextDocument(vscode.Uri.file(activityProjectConfigPath));
}
