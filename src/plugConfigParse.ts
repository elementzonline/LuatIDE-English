
// import {PluginVariablesInit} from './config';
import * as fs from 'fs';
import * as path from 'path';
import * as variableInterface from './variableInterface';
import * as vscode from 'vscode';
import { activityMemoryProjectPathBuffer } from './extension';

import {
    getAir72XUXDefaultCorePath,
    getAir72XUXDefaultLatestLibPath,
    getAir72XUXDefaultDemoPath,
    getAir72XUXDefaultLibPath,
    getHistoryCorePath,
    getHistoryDemoPath,
    getHistoryLibPath,
    getPluginConfigPath,
    getAir72XCXModuleModelName
} from './variableInterface';
import { copyDir, deleteDirRecursive } from './project/projectApi';
import { getprojectConfigInitVersion } from './project/projectConfigParse';
// let pluginVariablesInit = new PluginVariablesInit();


/**
 * 解析插件配置文件
 */
//  获取用户插件配置文件最新版本号
export function getPluginConfigJsonVersion(){
    const pluginConfigInitVersion:string = '2.3';
    return pluginConfigInitVersion;
}

// 获取用户插件配置文件内容对象
export function getPluginConfigJson() {
    const pluginConfigPath: any = getPluginConfigPath();
    const pluginConfigJson: any = fs.readFileSync(pluginConfigPath, 'utf-8');
    const pluginConfigJsonObj: any = JSON.parse(pluginConfigJson);
    return pluginConfigJsonObj;
}

// 获取用户插件配置文件的用户工程对象列表
export function getPluginConfigUserProjectList(){
    const pluginConfigJsonObj: any = getPluginConfigJson();
    const pluginConfigJsonProjectListObj: any = pluginConfigJsonObj.projectList;
    return pluginConfigJsonProjectListObj;
}

// 设置用户插件配置文件的用户工程对象列表
export function setPluginConfigUserProjectList(projectList:string[]){
    const pluginConfigJsonObj:any = getPluginConfigJson();
    const pluginJsonPath:string = getPluginConfigPath();
    pluginConfigJsonObj.projectList = projectList;
    const projectConfigJson = JSON.stringify(pluginConfigJsonObj, null, "\t");
    fs.writeFileSync(pluginJsonPath, projectConfigJson);
}

// 获取用户插件配置文件内用户工程列表
export function getPluginConfigUserProjectNameList() {
    const pluginConfigJsonObj: any = getPluginConfigJson();
    const pluginConfigJsonProjectListObj: any = pluginConfigJsonObj.projectList;
    const pluginConfigNameList:string[] = pluginConfigJsonProjectListObj.map(x => { x = x.projectName; return x; });
    return pluginConfigNameList;
}

// 获取用户插件配置文件内用户工程完整路径
export function getPluginConfigUserProjectAbsolutePathList() {
    const pluginConfigJsonObj: any = getPluginConfigJson();
    const pluginConfigJsonProjectListObj: any = pluginConfigJsonObj.projectList;
    const pluginConfigPathList:string[] = pluginConfigJsonProjectListObj.map(x => { x = x.projectPath; return x; });
    return pluginConfigPathList;
}

// 获取当前活动工程名称
export function getPluginConfigActivityProject() {
    const activityMemoryProjectPath = activityMemoryProjectPathBuffer['activityMemoryProjectPath'];
    return activityMemoryProjectPath;
}

// 获取实时活动工程名称
export function getCurrentPluginConfigActivityProject() {
    const pluginConfigJsonObj: any = getPluginConfigJson();
    const pluginConfigActivityProject: string = pluginConfigJsonObj.activeProject;
    return pluginConfigActivityProject;
}

// 获取当前插件配置文件版本号
export function getPluginConfigVersion() {
    const pluginConfigJsonObj: any = getPluginConfigJson();
    const pluginConfigVersion: string = pluginConfigJsonObj.version;
    return pluginConfigVersion;
}

// 刷新插件配置文件
export function refreshPlugintJson(plugintJsonObj: any) {
    const pluginConfigPath: any = getPluginConfigPath();
    const projectJson: string = JSON.stringify(plugintJsonObj, null, '\t');
    fs.writeFileSync(pluginConfigPath, projectJson);
}

// 设置插件配置文件的版本号
export function setPluginConfigVersion(version: any) {
    const pluginJsonObj: any = getPluginConfigJson();
    pluginJsonObj.version = version;
    refreshPlugintJson(pluginJsonObj);
}

// 推送工程至插件配置文件工程列表
export function pushPluginConfigProject(project: any) {
    const pluginJsonObj: any = getPluginConfigJson();
    pluginJsonObj.projectList.push(project);
    refreshPlugintJson(pluginJsonObj);
}

// 设置插件配置文件活动工程
export function setPluginConfigActivityProject(activeProject: any) {
    const pluginJsonObj: any = getPluginConfigJson();
    pluginJsonObj.activeProject = activeProject;
    refreshPlugintJson(pluginJsonObj);
}

// 删除指定工程从插件配置文件列表中
export function popPluginConfigProject(projectName: any) {
    const pluginJsonObj: any = getPluginConfigJson();
    for (let i = 0; i < pluginJsonObj.projectList.length; i++) {
        const projectObj: any = pluginJsonObj.projectList[i];
        if (projectObj.projectName === projectName) {
            pluginJsonObj.projectList.splice(i, 1);
        }
    }
    refreshPlugintJson(pluginJsonObj);
}

// 获取2.0,2.1版本插件配置文件初始化对象
export function getPluginConfigObjVersionTwo() {
    const luatideWorkspaceJson: any = {
        version: '',
        projectList: [],
        activeProject: '',
    };
    return luatideWorkspaceJson;
}

// 插件配置文件兼容
export function pluginConfigCompatible() {
    // plugin版本2.0以下兼容
    const pluginConfigPath: string = getPluginConfigPath();
    try {
        while (true) {  
            const pluginJson: string = fs.readFileSync(pluginConfigPath, 'utf-8');
            const pluginJsonObj = JSON.parse(pluginJson);
            if(pluginJsonObj.version===getPluginConfigJsonVersion()){
                return;
            }
            if (Number(pluginJsonObj.version) < 2.0) {
                pluginConfigCompatibleVersionLessThanTwo(pluginConfigPath, pluginJsonObj);
            }
            else if (Number(pluginJsonObj.version) === 2.0) {
                pluginConfigCompatibleVersionTwo(pluginConfigPath, pluginJsonObj);
            }
            else if(Number(pluginJsonObj.version) === 2.1){
                pluginConfigCompatibleVersionTwoPointOne(pluginConfigPath,pluginJsonObj);
            }
            else if(Number(pluginJsonObj.version) === 2.2){
                pluginConfigCompatibleVersionTwoPointTwo(pluginConfigPath,pluginJsonObj);
            }
            else{
                break;
            }
        }
    } catch (error) {
        console.log("插件配置文件兼容异常",error);
        vscode.window.showErrorMessage("插件配置文件兼容异常，请检查或重置插件配置文件");
    }

}

//  插件配置文件2.0以下版本配置文件兼容至2.0版本
export function pluginConfigCompatibleVersionLessThanTwo(pluginConfigPath: string, pluginJsonObj: any) {
    // 活动工程兼容
    const activityProject: string = pluginJsonObj['active_workspace'];
    const luatideWorkspaceJson: any = getPluginConfigObjVersionTwo();
    luatideWorkspaceJson.activeProject = activityProject;
    // 用户工程数据兼容
    for (let index = 0; index < pluginJsonObj.data.length; index++) {
        const projectObjType = pluginJsonObj.data[index];
        if (projectObjType.type === 'user') {
            for (let i = 0; i < projectObjType.projects.length; i++) {
                const userProjectObj = projectObjType.projects[i];
                const projectName = userProjectObj['project_name'];
                const projectPath = userProjectObj['project_path'];
                let projectObjNew = {
                    projectName: projectName,
                    projectPath: projectPath
                };
                luatideWorkspaceJson.projectList.push(projectObjNew);
            }
        }
    }
    // 插件版本兼容
    luatideWorkspaceJson.version = '2.0';
    const pluginConfigJsonNew = JSON.stringify(luatideWorkspaceJson, null, "\t");
    fs.writeFileSync(pluginConfigPath, pluginConfigJsonNew);
}

// 插件配置文件2.0版本配置文件兼容至2.1版本
export function pluginConfigCompatibleVersionTwo(pluginConfigPath: string, pluginJsonObj: any) {
    // Air72X_CORE路径内容复制到Air72XUX_CORE路径下
    const coreDataPath: string = getHistoryCorePath();
    const air72XOldCorePath: string = path.join(coreDataPath, 'Air72X_CORE');
    const air72XUXCorePath: string = getAir72XUXDefaultCorePath();
    copyDir(air72XOldCorePath, air72XUXCorePath);
    // Air72X_DEMO路径内容复制到Air72XUX_DEMO路径下
    const demoDataPath: string = getHistoryDemoPath();
    const air72XOldDemoPath: string = path.join(demoDataPath, 'Air72X_DEMO');
    const air72XUXDemoPath: string = getAir72XUXDefaultDemoPath();
    copyDir(air72XOldDemoPath, air72XUXDemoPath);
    // Air72X_LIB路径内容复制到Air72XUX_LIB路径下
    const libDataPath: string = getHistoryLibPath();
    const air72XOldLibPath: string = path.join(libDataPath, 'Air72X_LIB');
    const air72XUXLibPath: string = getAir72XUXDefaultLibPath();
    copyDir(air72XOldLibPath, air72XUXLibPath);
    // 删除Air72X_CORE所有内容
    deleteDirRecursive(air72XOldCorePath);
    // 删除Air72X_DEMO所有内容
    deleteDirRecursive(air72XOldDemoPath);
    // 删除Air72X_LIB所有内容
    deleteDirRecursive(air72XOldLibPath);
    // 更新插件配置文件版本至2.1
    let activityProject: string = pluginJsonObj.activeProject;
    // 对活动工程的工程配置文件进行兼容
    if (fs.existsSync(activityProject)) {
        projectConfigCompatible(activityProject);
    }
    else {
        activityProject = '';
    }
    let luatideWorkspaceJson: any = getPluginConfigObjVersionTwo();
    luatideWorkspaceJson.activeProject = activityProject;
    luatideWorkspaceJson.projectList = pluginJsonObj.projectList;
    // 插件版本兼容
    luatideWorkspaceJson.version = '2.1';
    const pluginConfigJsonNew = JSON.stringify(luatideWorkspaceJson, null, "\t");
    fs.writeFileSync(pluginConfigPath, pluginConfigJsonNew);
}

// 插件配置文件2.1版本配置文件兼容至2.2版本
// 本次兼容主要是为了解决配置文件升级的问题
export function pluginConfigCompatibleVersionTwoPointOne(pluginConfigPath: string, pluginJsonObj: any) {
    let activeProject: string = pluginJsonObj.activeProject;
    // 遍历用户工程，对工程名称做升级处理，
    pluginJsonObj.projectList = pluginJsonObj.projectList.map(x => {
        x.projectPath = path.join(x.projectPath, x.projectName);
        projectConfigCompatible(x.projectPath);
        return x;
    });
    let luatideWorkspaceJson: any = getPluginConfigObjVersionTwo();
    luatideWorkspaceJson.activeProject = activeProject;
    luatideWorkspaceJson.projectList = pluginJsonObj.projectList;
    luatideWorkspaceJson.version = '2.2';
    const pluginConfigJsonNew = JSON.stringify(luatideWorkspaceJson, null, "\t");
    fs.writeFileSync(pluginConfigPath, pluginConfigJsonNew);
}

// 插件配置文件2.2版本配置文件兼容至2.3版本
// 本次兼容主要是为了解决air103资源拉取接口V0010版本误放入了air101的固件文件问题
export function pluginConfigCompatibleVersionTwoPointTwo(pluginConfigPath: string, pluginJsonObj: any) {
    const air103DefaultCorePath  = variableInterface.getAir103DefaultCorePath();
    const files = fs.readdirSync(air103DefaultCorePath);
    for (const file of files) {
        if(file==="LuatOS-SoC_V0010_AIR101.soc"){
            fs.unlinkSync(path.join(air103DefaultCorePath,file));
        }
        if(file==="LuatOS-SoC_V0010_AIR101_BLE.soc"){
            fs.unlinkSync(path.join(air103DefaultCorePath,file));
        }
    }
    let luatideWorkspaceJson: any = getPluginConfigObjVersionTwo();
    let activeProject: string = pluginJsonObj.activeProject;
    luatideWorkspaceJson.activeProject = activeProject;
    luatideWorkspaceJson.projectList = pluginJsonObj.projectList;
    luatideWorkspaceJson.version = '2.3';
    const pluginConfigJsonNew = JSON.stringify(luatideWorkspaceJson, null, "\t");
    fs.writeFileSync(pluginConfigPath, pluginConfigJsonNew);
}

// 工程配置文件兼容
export function projectConfigCompatible(projectPath: string) {
    const projectConfigPath: string = path.join(projectPath, 'luatide_project.json');
    if (!fs.existsSync(projectConfigPath)) {
        return;
    }
    try {
        while (true){
            let projectOldJsonObj = getProjectConfigObj(projectConfigPath);
            if(projectOldJsonObj.version === "" || projectOldJsonObj.version === getprojectConfigInitVersion()){
                return;
            }
            if (projectOldJsonObj.version !== "" && Number(projectOldJsonObj.version) < 2.0) {
                projectConfigCompatibleVersionLessThanTwo(projectPath, projectOldJsonObj);
            }
            else if (projectOldJsonObj.version !== "" && Number(projectOldJsonObj.version) === 2.0) {
                projectConfigCompatibleVersionTwo(projectPath, projectOldJsonObj);
            }
            else if (projectOldJsonObj.version !== "" && Number(projectOldJsonObj.version) === 2.1) {
                projectConfigCompatibleVersionTwoPointOne(projectPath, projectOldJsonObj);
            }
            else if (projectOldJsonObj.version !== "" && Number(projectOldJsonObj.version) === 2.2) {
                projectConfigCompatibleVersionTwoPointThree(projectPath, projectOldJsonObj);
            }
            else if (projectOldJsonObj.version !== "" && Number(projectOldJsonObj.version) === 2.3) {
                projectConfigCompatibleVersionTwoPointFour(projectPath, projectOldJsonObj);
            }
            else if(projectOldJsonObj.version !== "" && Number(projectOldJsonObj.version) === 2.4){
                projectConfigCompatibleVersionTwoPointFive(projectPath,projectOldJsonObj);
            }
            else if(projectOldJsonObj.version !== "" && Number(projectOldJsonObj.version) === 2.5){
                projectConfigCompatibleVersionTwoPointSix(projectPath,projectOldJsonObj);
            }
        }                                
    } catch (error) {
        console.log("工程配置文件兼容异常",error);
        vscode.window.showErrorMessage("工程配置文件兼容异常，请检查或重置插件配置文件");
    }
}

// 获取指定路径工程配置的对象  
export function getProjectConfigObj(projectConfigPath: string) {
    const projectOldJson: string = fs.readFileSync(projectConfigPath, 'utf-8');
    const projectOldJsonObj = JSON.parse(projectOldJson);
    return projectOldJsonObj;
}

// 获取版本工程配置文件初始化对象
export function getProjectJsonObjVersionTwo() {
    let luatideProjectNewJson: any = {
        version: '',
        projectName:'',
        projectType: 'pure',
        moduleModel: '',
        simulatorRun:'',
        corePath: '',
        libPath: '',
        modulePort: '',
        appFile: [],
        ignore: [],
    };
    return luatideProjectNewJson;
}

// 工程配置文件2.0以下版本配置文件兼容至2.0版本
export function projectConfigCompatibleVersionLessThanTwo(projectPath: string, projectOldJsonObj: any) {
    const projectConfigPath: string = path.join(projectPath, 'luatide_project.json');
    const luatideProjectNewJson: any = getProjectJsonObjVersionTwo();
    // 用户core路径兼容
    const corePath: string = projectOldJsonObj['corefile_path'];
    luatideProjectNewJson.corePath = corePath;
    // 用户lib路径兼容
    let libPath: string = projectOldJsonObj['lib_path'];
    if (libPath === '' && projectOldJsonObj['module_model'] !== 'Air10X') {
        libPath = getAir72XUXDefaultLatestLibPath();
    }
    luatideProjectNewJson.libPath = libPath;
    // 用户模块型号判断
    const moduleModelOld: string = projectOldJsonObj['module_model'];
    switch (moduleModelOld) {
        case 'Air72XUX/Air82XUX':
            luatideProjectNewJson.moduleModel = 'air72XUX/air82XUX';
            break;
        case 'Air72XCX':
            luatideProjectNewJson.moduleModel = 'air72XCX';
            break;
        case 'Air10X':
            luatideProjectNewJson.moduleModel = 'air10X';
            break;

    }
    // 用户appFile文件兼容
    const appFileOld: string[] = projectOldJsonObj['app_file'];
    for (let i = 0; i < appFileOld.length; i++) {
        const appFileOldPath: string = appFileOld[i];
        if (appFileOldPath.indexOf(projectPath) !== -1) {
            luatideProjectNewJson.appFile.push(appFileOldPath);
        }
    }
    // 用户工程版本兼容
    luatideProjectNewJson.version = '2.0';
    //用户modulePort兼容
    if (projectOldJsonObj['module_port']) {
        luatideProjectNewJson.modulePort = projectOldJsonObj['module_port'];
    }
    const projectConfigJsonNew = JSON.stringify(luatideProjectNewJson, null, "\t");
    fs.writeFileSync(projectConfigPath, projectConfigJsonNew);
}

// 工程配置文件2.0版本配置文件兼容至2.1版本
export function projectConfigCompatibleVersionTwo(projectPath: string, projectOldJsonObj: any) {
    const projectName: string = path.basename(projectPath);
    const projectConfigPath: string = path.join(projectPath, 'luatide_project.json');
    const luatideProjectNewJson: any = getProjectJsonObjVersionTwo();
    // 用户appFile文件兼容
    const appFileOld: string[] = projectOldJsonObj['appFile'];
    for (let i = 0; i < appFileOld.length; i++) {
        const appFilePath: string = appFileOld[i];
        if (fs.existsSync(appFilePath)) {
            if (appFilePath.toLowerCase().indexOf(projectPath.toLowerCase()) !== -1) {
                const appFileRelativePath = path.relative(projectPath, appFilePath);
                luatideProjectNewJson.appFile.push(appFileRelativePath);
            }
        }
        else {
            const reg = new RegExp(`${projectName}[\\\\|/](.*)`, 'ig');
            const array = reg.exec(appFilePath);
            if (array !== null) {
                const appFileRelativePath = array[1];
                luatideProjectNewJson.appFile.push(appFileRelativePath);
            }
        }
    }
    luatideProjectNewJson.version = '2.1';
    luatideProjectNewJson.projectType = projectOldJsonObj.projectType;
    luatideProjectNewJson.corePath = projectOldJsonObj.corePath;
    luatideProjectNewJson.libPath = projectOldJsonObj.libPath;
    luatideProjectNewJson.moduleModel = projectOldJsonObj.moduleModel;
    luatideProjectNewJson.modulePort = projectOldJsonObj.modulePort;
    const projectConfigJsonNew = JSON.stringify(luatideProjectNewJson, null, "\t");
    fs.writeFileSync(projectConfigPath, projectConfigJsonNew);
}

// 工程配置文件2.1版本配置文件兼容至2.2版本
export function projectConfigCompatibleVersionTwoPointOne(projectPath: string, projectOldJsonObj: any) {
    const projectConfigPath: string = path.join(projectPath, 'luatide_project.json');
    const luatideProjectNewJson: any = getProjectJsonObjVersionTwo();
    // 工程模块型号兼容
    let moduleModel: string = projectOldJsonObj.moduleModel;
    if (moduleModel === 'air10X') {
        moduleModel = 'air101';
    }
    // 工程core文件兼容
    let corePath: string = projectOldJsonObj.corePath;
    if (corePath !== '' && corePath.indexOf('Air72X_CORE') !== -1) {
        corePath = corePath.replace('\\LuatIDE\\LuatideCore\\Air72X_CORE', '\\LuatIDE\\LuatideCore\\Air72XUX_CORE');
    }
    // 工程lib文件兼容
    let libPath: string = projectOldJsonObj.libPath;
    if (libPath !== '' && libPath.indexOf('Air72X_LIB') !== -1) {
        libPath = libPath.replace('\\LuatIDE\\LuatideLib\\Air72X_LIB', '\\LuatIDE\\LuatideLib\\Air72XUX_LIB');
    }
    luatideProjectNewJson.version = '2.2';
    luatideProjectNewJson.projectType = projectOldJsonObj.projectType;
    luatideProjectNewJson.corePath = corePath;
    luatideProjectNewJson.libPath = libPath;
    luatideProjectNewJson.appFile = projectOldJsonObj.appFile;
    luatideProjectNewJson.moduleModel = moduleModel;
    luatideProjectNewJson.modulePort = projectOldJsonObj.modulePort;
    const projectConfigJsonNew = JSON.stringify(luatideProjectNewJson, null, "\t");
    fs.writeFileSync(projectConfigPath, projectConfigJsonNew);
}

// 工程配置文件2.2版本配置文件兼容至2.3版本
export function projectConfigCompatibleVersionTwoPointThree(projectPath: string, projectOldJsonObj: any) {
    const projectConfigPath: string = path.join(projectPath, 'luatide_project.json');
    const luatideProjectNewJson: any = getProjectJsonObjVersionTwo();
    // 工程lib文件兼容
    let libPath: string = projectOldJsonObj.libPath;
    if (libPath !== '' && (projectOldJsonObj.moduleModel === 'air101') || (projectOldJsonObj.moduleModel === 'air103') || (projectOldJsonObj.moduleModel === 'air105') || ((projectOldJsonObj.moduleModel === 'esp32c3'))) {
        libPath = libPath.replace('\\LuatIDE\\LuatideLib\\Air72X_LIB', '\\LuatIDE\\LuatideLib\\Air72XUX_LIB');
    }
    luatideProjectNewJson.version = '2.3';
    luatideProjectNewJson.projectType = projectOldJsonObj.projectType;
    luatideProjectNewJson.libPath = libPath;
    luatideProjectNewJson.appFile = projectOldJsonObj.appFile;
    luatideProjectNewJson.modulePort = projectOldJsonObj.modulePort;
    luatideProjectNewJson.corePath = projectOldJsonObj.corePath;
    luatideProjectNewJson.moduleModel = projectOldJsonObj.moduleModel;
    luatideProjectNewJson.ignore = [];
    const projectConfigJsonNew = JSON.stringify(luatideProjectNewJson, null, "\t");
    fs.writeFileSync(projectConfigPath, projectConfigJsonNew);
}

// 工程配置文件2.3版本配置文件兼容至2.4版本
export function projectConfigCompatibleVersionTwoPointFour(projectPath: string, projectOldJsonObj: any) {
    const projectConfigPath: string = path.join(projectPath, 'luatide_project.json');
    const luatideProjectNewJson: any = getProjectJsonObjVersionTwo();
    luatideProjectNewJson.version = '2.4';
    luatideProjectNewJson.projectType = projectOldJsonObj.projectType;
    luatideProjectNewJson.libPath = projectOldJsonObj.libPath;
    luatideProjectNewJson.corePath = projectOldJsonObj.corePath;
    luatideProjectNewJson.appFile = projectOldJsonObj.appFile;
    let moduleModel: string = projectOldJsonObj.moduleModel;
    if (moduleModel === 'air72XCX') {
        moduleModel = getAir72XCXModuleModelName();
    }
    luatideProjectNewJson.moduleModel = moduleModel;
    luatideProjectNewJson.modulePort = projectOldJsonObj.modulePort;
    luatideProjectNewJson.ignore = projectOldJsonObj.ignore;
    const projectConfigJsonNew = JSON.stringify(luatideProjectNewJson, null, "\t");
    fs.writeFileSync(projectConfigPath, projectConfigJsonNew);
}

// 工程配置文件2.4版本配置文件兼容至2.5版本
// 本次兼容主要是为了解除工程名称同文件夹名称的绑定
export function projectConfigCompatibleVersionTwoPointFive(projectPath: string, projectOldJsonObj: any) {
    const projectConfigPath: string = path.join(projectPath, 'luatide_project.json');
    const luatideProjectNewJson: any = getProjectJsonObjVersionTwo();
    luatideProjectNewJson.version = '2.5';
    luatideProjectNewJson.projectType = projectOldJsonObj.projectType;
    luatideProjectNewJson.libPath = projectOldJsonObj.libPath;
    luatideProjectNewJson.corePath = projectOldJsonObj.corePath;
    luatideProjectNewJson.appFile = projectOldJsonObj.appFile;
    luatideProjectNewJson.moduleModel = projectOldJsonObj.moduleModel;
    luatideProjectNewJson.modulePort = projectOldJsonObj.modulePort;
    luatideProjectNewJson.ignore = projectOldJsonObj.ignore;
    //新增工程名称配置项，旧版本工程配置升级工程名称以工程所在路径文件夹名称替代
    luatideProjectNewJson.projectName = path.basename(projectPath);
    const projectConfigJsonNew = JSON.stringify(luatideProjectNewJson, null, "\t");
    fs.writeFileSync(projectConfigPath, projectConfigJsonNew);
}


// 工程配置文件2.5版本配置文件兼容至2.6版本
// 本次兼容主要是为了去除模块型号中的simulator
export function projectConfigCompatibleVersionTwoPointSix(projectPath: string, projectOldJsonObj: any) {
    const projectConfigPath: string = path.join(projectPath, 'luatide_project.json');
    const luatideProjectNewJson: any = getProjectJsonObjVersionTwo();
    luatideProjectNewJson.version = '2.6';
    luatideProjectNewJson.projectType = projectOldJsonObj.projectType;
    luatideProjectNewJson.projectName = projectOldJsonObj.projectName;
    // 新增simulatorRun标志，标识是否启用模拟器运行
    if(projectOldJsonObj.moduleModel === "simulator")
    {
        luatideProjectNewJson.moduleModel = "air72XUX/air82XUX";
        luatideProjectNewJson.simulatorRun = "enable";
        luatideProjectNewJson.corePath = variableInterface.getDefaultLatestCorePath(luatideProjectNewJson.moduleModel);
        luatideProjectNewJson.libPath = variableInterface.getAir72XUXDefaultLatestLibPath();
    }
    else
    {
        luatideProjectNewJson.moduleModel = projectOldJsonObj.moduleModel;
        luatideProjectNewJson.simulatorRun = "disable";
        luatideProjectNewJson.corePath = projectOldJsonObj.corePath;
        luatideProjectNewJson.libPath = projectOldJsonObj.libPath;
    }
    luatideProjectNewJson.modulePort = projectOldJsonObj.modulePort;
    luatideProjectNewJson.appFile = projectOldJsonObj.appFile;
    luatideProjectNewJson.ignore = projectOldJsonObj.ignore;
    
    const projectConfigJsonNew = JSON.stringify(luatideProjectNewJson, null, "\t");
    fs.writeFileSync(projectConfigPath, projectConfigJsonNew);
}
