import * as fs from 'fs';
import { PluginJsonParse } from '../plugConfigParse';
import * as path from "path";
let pluginJsonParse = new PluginJsonParse();

/**
 * 解析工程配置文件
 */
 export class ProjectJsonParse {
    constructor() {
        
    }
    // 获取当前工程文件初始化版本号
    getprojectConfigInitVersion(){
        const projectConfigInitVersion:string = '2.0';
        return projectConfigInitVersion;
    }

    // 获取工程配置文件内容对象
    getProjectConfigJson(projectPath:any){
        // const activityPath:any = pluginJsonParse.getPluginConfigActivityProject();
        const projectConfigPath:any = path.join(projectPath,'luatide_project.json');
        const projectConfigJson:any  = fs.readFileSync(projectConfigPath);
        const projectConfigJsonObj:any = JSON.parse(projectConfigJson);
        return projectConfigJsonObj;
    }

    // 获取活动工程下载至模块的脚本文件及资源文件列表
    getProjectConfigAppFile(projectPath:any){
        const projectConfigJsonObj:any =  this.getProjectConfigJson(projectPath);
        const projectConfigAppFile:string = projectConfigJsonObj.appFile;
        return projectConfigAppFile;
    }

    // 获取活动工程lib库文件路径
    getProjectConfigLibPath(projectPath:any){
        const projectConfigJsonObj:any =  this.getProjectConfigJson(projectPath);
        const projectConfigLibPath:string = projectConfigJsonObj.libPath;
        return projectConfigLibPath;
    }
    // 获取活动工程配置的模块型号
    getProjectConfigModuleModel(projectPath:any){
        const projectConfigJsonObj:any =  this.getProjectConfigJson(projectPath);
        const projectConfigCorePath:string = projectConfigJsonObj.moduleModel;
        return projectConfigCorePath;
    }

    // 获取活动工程core文件路径
    getProjectConfigActiveProject(projectPath:any){
        const projectConfigJsonObj:any =  this.getProjectConfigJson(projectPath);
        const projectConfigCorePath:string = projectConfigJsonObj.corePath;
        return projectConfigCorePath;
    }

    // 获取活动工程配置文件版本号
    getProjectConfigVersion(projectPath:any){
        const projectConfigJsonObj:any =  this.getProjectConfigJson(projectPath);
        const projectConfigVersion:string = projectConfigJsonObj.version;
        return projectConfigVersion;
    }
    
    // 获取活动工程模块端口号
    getProjectConfigMoudlePort(projectPath:any){
        const projectConfigJsonObj:any =  this.getProjectConfigJson(projectPath);
        const projectConfigModulePort:string = projectConfigJsonObj.modulePort;
        return projectConfigModulePort;
    }

    // 获取最新活动工程对象
    getProjectJson(){
        const projectJsonObj:any = this.getProjectJson();
        return projectJsonObj;
    }

    // 设置活动工程版本号
    setProjectConfigVersion(version:any,projectPath:any){
        const projectConfigPath:string = path.join(projectPath,'luatide_project.json');
        const projectJsonObj:any =  this.getProjectConfigJson(projectPath);
        projectJsonObj.version = version;
        this.refreshProjectJson(projectJsonObj,projectConfigPath);
    }

    // 设置活动工程core文件路径
    setProjectConfigCorePath(corePath:any,projectPath:any){
        const projectConfigPath:string = path.join(projectPath,'luatide_project.json');
        const projectJsonObj:any =  this.getProjectConfigJson(projectPath);
        projectJsonObj.corePath = corePath;
        this.refreshProjectJson(projectJsonObj,projectConfigPath);
    }

    // 设置活动工程lib文件路径
    setProjectConfigLibPath(libPath:any,projectPath:any){
        const projectConfigPath:string = path.join(projectPath,'luatide_project.json');
        const projectJsonObj:any =  this.getProjectConfigJson(projectPath);
        projectJsonObj.libPath = libPath;
        this.refreshProjectJson(projectJsonObj,projectConfigPath);
    }

    // 设置活动工程模块型号
    setProjectConfigModuleModel(moduleModel:any,projectPath:any){
        const projectConfigPath:string = path.join(projectPath,'luatide_project.json');
        const projectJsonObj:any =  this.getProjectConfigJson(projectPath);
        projectJsonObj.moduleModel = moduleModel;
        this.refreshProjectJson(projectJsonObj,projectConfigPath);
    }

    // 添加文件路径到活动工程下载文件列表
    pushProjectConfigAppFile(appFile:any,projectPath:any){
        const projectConfigPath:string = path.join(projectPath,'luatide_project.json');
        const projectJsonObj:any =  this.getProjectConfigJson(projectPath);
        for (let index = 0; index < appFile.length; index++) {
            const element = appFile[index];
            projectJsonObj.appFile.push(element);
        }
        
        this.refreshProjectJson(projectJsonObj,projectConfigPath);
    }

    // 删除文件路径从活动工程下载文件列表
    popProjectConfigAppFile(appFile:any,projectPath:any){
        const projectConfigPath:string = path.join(projectPath,'luatide_project.json');
        const projectJsonObj:any =  this.getProjectConfigJson(projectPath);
        const index = projectJsonObj.appFile.indexOf(appFile);
        if (index!==-1) {
            projectJsonObj.appFile.splice(appFile);
            this.refreshProjectJson(projectJsonObj,projectConfigPath);
        }
        else{
            console.log(`AppFile中未检测到该路径${appFile}`);
        }
    }

    // 设置活动工程模块端口
    setProjectConfigModulePort(modulePort:any,projectPath:any){
        const projectConfigPath:string = path.join(projectPath,'luatide_project.json');
        const projectJsonObj:any =  this.getProjectConfigJson(projectPath);
        projectJsonObj.modulePort = modulePort;
        this.refreshProjectJson(projectJsonObj,projectConfigPath);
    }

    // 刷新活动工程配置文件
    refreshProjectJson(projectJsonObj:any,projectConfigPath:any){
        // const projectConfigPath:string = path.join(projectPath,'luatide_project.json');
        const projectJson:string = JSON.stringify(projectJsonObj,null,'\t');
        fs.writeFileSync(projectConfigPath,projectJson);
    }

    // 生成活动工程默认配置文件
    generateProjectJson(projectPath:any){
        const projectConfigPath:string = path.join(projectPath,'luatide_project.json');
        const projectJson:any = {
            version:'',
            corePath:'',
            libPath:'',
            moduleModel:'',
            appFile:[],
            modulePort:'',
        };
        this.refreshProjectJson(projectJson,projectConfigPath);
    }
}