import * as fs from 'fs';
// import { PluginJsonParse } from '../plugConfigParse';
import * as path from "path";
import { getAir72XUXDefaultLatestLibPath, getDefaultLatestCorePath } from '../variableInterface';
// let pluginJsonParse = new PluginJsonParse();

/**
 * 解析工程配置文件
 */

    // 获取当前工程文件初始化版本号
export function getprojectConfigInitVersion(){
        const projectConfigInitVersion:string = '2.5';
        return projectConfigInitVersion;
    }

    // 获取工程配置文件内容对象
export function getProjectConfigJson(projectPath:any){
        // const activityPath:any = pluginJsonParse.getPluginConfigActivityProject();
        const projectConfigPath:any = path.join(projectPath,'luatide_project.json');
        const projectConfigJson:any  = fs.readFileSync(projectConfigPath);
        const projectConfigJsonObj:any = JSON.parse(projectConfigJson);
        return projectConfigJsonObj;
    }
    
    // 获取工程配置类型
export function  getProjectConfigType(projectPath:any){
        const projectConfigJsonObj:any =  getProjectConfigJson(projectPath);
        const projectConfigType:string = projectConfigJsonObj.projectType;
        return projectConfigType;
    }

    
    // 获取工程下载至模块的脚本文件及资源文件列表
export function  getProjectConfigAppFile(projectPath:any){
        const projectConfigJsonObj:any =  getProjectConfigJson(projectPath);
        const projectConfigAppFile:string[] = projectConfigJsonObj.appFile;
        return projectConfigAppFile;
    }

    // 获取工程lib库文件路径
export function getProjectConfigLibPath(projectPath:any){
        const projectConfigJsonObj:any =  getProjectConfigJson(projectPath);
        const projectConfigLibPath:string = projectConfigJsonObj.libPath;
        return projectConfigLibPath;
    }
    // 获取工程配置的模块型号
export function getProjectConfigModuleModel(projectPath:any){
    const projectConfigJsonObj:any =  getProjectConfigJson(projectPath);
    const projectConfigCorePath:string = projectConfigJsonObj.moduleModel;
    return projectConfigCorePath;
}

// 获取工程core文件路径
export function getProjectConfigCorePath(projectPath:any){
    const projectConfigJsonObj:any =  getProjectConfigJson(projectPath);
    const projectConfigCorePath:string = projectConfigJsonObj.corePath;
    return projectConfigCorePath;
}

// 获取工程配置文件版本号
export function getProjectConfigVersion(projectPath:any){
    const projectConfigJsonObj:any =  getProjectConfigJson(projectPath);
    const projectConfigVersion:string = projectConfigJsonObj.version;
    return projectConfigVersion;
}

// 获取工程配置文件工程名称
export function getProjectconfigName(projectPath:any){
    const projectConfigJsonObj:any = getProjectConfigJson(projectPath);
    const projectConfigProjectName:string = projectConfigJsonObj.projectName;
    return projectConfigProjectName;
}
    
// 获取工程模块端口号
export function getProjectConfigMoudlePort(projectPath:any){
    const projectConfigJsonObj:any =  getProjectConfigJson(projectPath);
    const projectConfigModulePort:string = projectConfigJsonObj.modulePort;
    return projectConfigModulePort;
}

// 获取工程配置文件工程类型
export function getProjectConfigProjectType(projectPath:any){
    const projectConfigJsonObj:any =  getProjectConfigJson(projectPath);
    let projectConfigProjectType:string;
    if (projectConfigJsonObj.projectType && projectConfigJsonObj.projectTypero!=='') {
        projectConfigProjectType =projectConfigJsonObj.projectType;
    }
    else{
        projectConfigProjectType = 'pure';    //兼容无工程类型的工程配置
    }
    return projectConfigProjectType;
}

// 获取最新活动工程对象
export function getProjectJson(){
    const projectJsonObj:any = getProjectJson();
    return projectJsonObj;
}

    // 设置活动工程版本号
export function  setProjectConfigVersion(version:any,projectPath:any){
        const projectConfigPath:string = path.join(projectPath,'luatide_project.json');
        const projectJsonObj:any =  getProjectConfigJson(projectPath);
        projectJsonObj.version = version;
        refreshProjectJson(projectJsonObj,projectConfigPath);
    }

// 设置活动工程工程名称
export function setProjectConfigProjectName(projectName:string,projectPath:string){
    const projectConfigPath = path.join(projectPath,'luatide_project.json');
    const projectJsonObj:any = getProjectConfigJson(projectPath);
    projectJsonObj.projectName = projectName;
    refreshProjectJson(projectJsonObj,projectConfigPath);
}

    // 设置活动工程core文件路径
export function setProjectConfigCorePath(corePath:any,projectPath:any){
        const projectConfigPath:string = path.join(projectPath,'luatide_project.json');
        const projectJsonObj:any =  getProjectConfigJson(projectPath);
        projectJsonObj.corePath = corePath;
        refreshProjectJson(projectJsonObj,projectConfigPath);
    }

    // 设置活动工程lib文件路径
export function  setProjectConfigLibPath(libPath:any,projectPath:any){
        const projectConfigPath:string = path.join(projectPath,'luatide_project.json');
        const projectJsonObj:any =  getProjectConfigJson(projectPath);
        projectJsonObj.libPath = libPath;
        refreshProjectJson(projectJsonObj,projectConfigPath);
    }

    // 设置活动工程模块型号
export function setProjectConfigModuleModel(moduleModel:any,projectPath:any){
        const projectConfigPath:string = path.join(projectPath,'luatide_project.json');
        const projectJsonObj:any =  getProjectConfigJson(projectPath);
        projectJsonObj.moduleModel = moduleModel;
        refreshProjectJson(projectJsonObj,projectConfigPath);
    }

// 添加文件路径到活动工程下载文件列表
export function pushProjectConfigAppFile(appFile:any,projectPath:any){
    const projectConfigPath:string = path.join(projectPath,'luatide_project.json');
    const projectJsonObj:any =  getProjectConfigJson(projectPath);
    for (let index = 0; index < appFile.length; index++) {
        const appFilePath:string = appFile[index];
        projectJsonObj.appFile.push(appFilePath);
    }
    refreshProjectJson(projectJsonObj,projectConfigPath);
}

// 添加文件路径到活动工程忽略文件列表
export function pushProjectConfigIgnoreFile(ignoreFile:any,projectPath:any){
    const projectConfigPath:string = path.join(projectPath,'luatide_project.json');
    const projectJsonObj:any =  getProjectConfigJson(projectPath);
    for (let index = 0; index < ignoreFile.length; index++) {
        const ignoreFilePath:string = ignoreFile[index];
        projectJsonObj.ignore.push(ignoreFilePath);
    }
    refreshProjectJson(projectJsonObj,projectConfigPath);
}

    // 删除文件路径从活动工程下载文件列表
export function popProjectConfigAppFile(appFilePath:any,projectPath:any){
        const projectConfigPath:string = path.join(projectPath,'luatide_project.json');
        const projectJsonObj:any =  getProjectConfigJson(projectPath);
        const relativeFilePath:string = path.relative(projectPath,appFilePath);
        const index = projectJsonObj.appFile.indexOf(relativeFilePath);
        if (index!==-1) {
            if (!fs.existsSync(appFilePath) || fs.statSync(appFilePath).isDirectory()) {
                // 若用户删除的是文件夹，则删除appfile目录中其所有子文件
                for (let i = 0; i < projectJsonObj.appFile.length; i++) {
                    const element:string = projectJsonObj.appFile[i];
                    if (element.indexOf(relativeFilePath)!==-1) {
                        projectJsonObj.appFile.splice(i,1);
                        i = i-1;
                    }
                }
            }
            else{
                projectJsonObj.appFile.splice(index,1);
            }
            refreshProjectJson(projectJsonObj,projectConfigPath);
        }
        else{
            console.log(`工程appFile中未检测到该路径${appFilePath}`);
        }
    }

    // 设置活动工程模块端口
export function  setProjectConfigModulePort(modulePort:any,projectPath:any){
        const projectConfigPath:string = path.join(projectPath,'luatide_project.json');
        const projectJsonObj:any =  getProjectConfigJson(projectPath);
        projectJsonObj.modulePort = modulePort;
        refreshProjectJson(projectJsonObj,projectConfigPath);
    }

    // 设置活动工程工程类型
export function  setProjectConfigProjectType(projectType:string,projectPath:any){
        const projectConfigPath = path.join(projectPath,'luatide_project.json');
        const projectJsonObj:any =  getProjectConfigJson(projectPath);
        projectJsonObj.projectType = projectType;
        refreshProjectJson(projectJsonObj,projectConfigPath);
    }

    // 刷新活动工程配置文件
export function refreshProjectJson(projectJsonObj:any,projectConfigPath:any){
        // const projectConfigPath:string = path.join(projectPath,'luatide_project.json');
        const projectJson:string = JSON.stringify(projectJsonObj,null,'\t');
        fs.writeFileSync(projectConfigPath,projectJson);
    }

    // 生成活动工程默认配置文件
export function  generateProjectJson(projectPath:any){
        const projectConfigPath:string = path.join(projectPath,'luatide_project.json');
        const projectJson:any = {
            version:'',
            projectName:'',
            projectType:'pure',
            corePath:'',
            libPath:'',
            moduleModel:'',
            appFile:[],
            modulePort:'',
            ignore:[],
        };
        refreshProjectJson(projectJson,projectConfigPath);
    }
    
    // 导入空文件夹生成默认配置文件
export function  generateImportProjectInitJson(projectPath:any){
        const projectConfigPath:string = path.join(projectPath,'luatide_project.json');
        // const corePath:string = getAir72XUXDefaultLatestCorePath();
        const corePath:string = getDefaultLatestCorePath('air72XUX/air82XUX');
        const libPath:string = getAir72XUXDefaultLatestLibPath();
        const projectJson:any = {
            version:'',
            projectName:'',
            projectType:'pure',
            corePath:'',
            libPath:'',
            moduleModel:'',
            appFile:[],
            modulePort:'',
            ignore:[],
        };
        projectJson.corePath = corePath;
        projectJson.libPath = libPath;
        refreshProjectJson(projectJson,projectConfigPath);
    }
