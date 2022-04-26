import path = require('path');
import * as vscode from 'vscode';
import { getPluginConfigActivityProject } from '../plugConfigParse';
import { getAir72XCXModuleModelName } from '../variableInterface';
import { activeProjectConfig } from '../webview/configWebview';
import { getFileForDirRecursion } from './projectApi';
import { getProjectConfigAppFile, pushProjectConfigAppFile, setProjectConfigCorePath, setProjectConfigLibPath, setProjectConfigModuleModel } from './projectConfigParse';

// 工程配置项处理
export function projectConfigOperation(context: vscode.ExtensionContext) {
    const activityProjectPath = getPluginConfigActivityProject();
    if (activityProjectPath === '') {
        vscode.window.showErrorMessage("当前未检测到活动工程,请先激活工程后再配置");
        return false;
    }
    
    activeProjectConfig(context);
}

// // 活动工程配置操作用户交互提示
// function projectConfigOperationUserInteractionInit(moduleModel: string) {
//     vscode.window.showQuickPick(
//         getActivityProjectConfigOptionsList(moduleModel),
//         {
//             canPickMany: false,
//             ignoreFocusOut: false,
//             matchOnDescription: true,
//             matchOnDetail: true,
//             placeHolder: '请选择配置项'
//         })
//         .then((msg) => projectConfigOperationHandle(msg));
// }

// // 活动工程配置操作分析处理
// function projectConfigOperationHandle(msg: any) {
//     switch (msg) {
//         case "配置core文件":
//             selectProjectCorePathOperation();
//             break;
//         case "配置lib库文件":
//             selectProjectLibPathOperation();
//             break;
//         case "添加文件":
//             selectProjectFileAddOperation();
//             break;
//         case "添加文件夹":
//             selectProjectFolderAddOperation();
//             break;
//         case "配置模块型号/模拟器":
//             selectProjectModuleModel();
//             break;
//         case "显示配置文件":
//             openShowProjectConfig();
//             break;
//     }
// }

// 打开文件资源管理器接口选择core文件
export async function selectProjectCorePathOperation() {
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
    const options = {
        canSelectFiles: false,		//是否选择文件
        canSelectFolders: true,		//是否选择文件夹
        canSelectMany: false,		//是否选择多个文件
        defaultUri: vscode.Uri.file(activityProjectPath),	//默认打开文件位置
        openLabel: '选择lib库'
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
        openLabel: '选择需要导入工程的文件'
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
        openLabel: '选择需要导入工程的文件夹'
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
        vscode.window.showErrorMessage("LuatIDE不支持添加非工程内文件至工程", { modal: true });
        return false;
    }

    if (filePath.toLocaleLowerCase() === activityPath.toLocaleLowerCase()) {
        vscode.window.showErrorMessage("不支持导入工程自身", { modal: true });
        return false;
    }
    if (filePath.toLocaleLowerCase() === path.join(activityPath, 'luatide_project.json').toLocaleLowerCase()) {
        vscode.window.showErrorMessage("不支持导入LuatIDE工程配置文件", { modal: true });
        return false;
    }
    for (let index = 0; index < appFile.length; index++) {
        const appFilePath: string = appFile[index];
        if (path.join(activityPath, appFilePath).toLocaleLowerCase() === filePath.toLocaleLowerCase()) {
            vscode.window.showErrorMessage("该文件已存在于工程，不能重复添加", { modal: true });
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
        vscode.window.showErrorMessage("不支持设置工程自身", { modal: true });
        return false;
    }
    if (filePath.toLocaleLowerCase() === path.join(activityPath, 'luatide_project.json').toLocaleLowerCase()) {
        vscode.window.showErrorMessage("不支持设置LuatIDE工程配置文件", { modal: true });
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

// 选择配置模块型号,模拟器
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
            "simulator",
            "esp32c3"
        ],
        {
            canPickMany: false,
            ignoreFocusOut: false,
            matchOnDescription: true,
            matchOnDetail: true,
            placeHolder: '请选择模块型号'
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
