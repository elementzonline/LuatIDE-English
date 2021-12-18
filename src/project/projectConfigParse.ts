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
    getProjectConfigJson(){
        const activityPath:any = pluginJsonParse.getPluginConfigActivityProject();
        const projectConfigPath:any = path.join(activityPath,'luatide_project.json');
        const projectConfigJson:any  = fs.readFileSync(projectConfigPath);
        const projectConfigJsonObj:any = JSON.parse(projectConfigJson);
        return projectConfigJsonObj;
    }

    // 获取活动工程下载至模块的脚本文件及资源文件列表
    getProjectConfigAppFile(){
        const projectConfigJsonObj:any =  this.getProjectConfigJson();
        const projectConfigAppFile:string = projectConfigJsonObj.appFile;
        return projectConfigAppFile;
    }

    // 获取活动工程lib库文件路径
    getProjectConfigLibPath(){
        const projectConfigJsonObj:any =  this.getProjectConfigJson();
        const projectConfigLibPath:string = projectConfigJsonObj.libPath;
        return projectConfigLibPath;
    }

    // 获取活动工程core文件路径
    getProjectConfigActiveProject(){
        const projectConfigJsonObj:any =  this.getProjectConfigJson();
        const projectConfigCorePath:string = projectConfigJsonObj.corePath;
        return projectConfigCorePath;
    }

    // 获取活动工程配置文件版本号
    getProjectConfigVersion(){
        const projectConfigJsonObj:any =  this.getProjectConfigJson();
        const projectConfigVersion:string = projectConfigJsonObj.version;
        return projectConfigVersion;
    }
    
    // 获取活动工程模块端口号
    getProjectConfigMoudlePort(){
        const projectConfigJsonObj:any =  this.getProjectConfigJson();
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
        const projectJsonObj:any =  this.getProjectConfigJson();
        projectJsonObj.version = version;
        this.refreshProjectJson(projectJsonObj,projectConfigPath);
    }

    // 设置活动工程core文件路径
    setProjectConfigCorePath(corePath:any,projectPath:any){
        const projectConfigPath:string = path.join(projectPath,'luatide_project.json');
        const projectJsonObj:any =  this.getProjectConfigJson();
        projectJsonObj.corePath = corePath;
        this.refreshProjectJson(projectJsonObj,projectConfigPath);
    }

    // 设置活动工程lib文件路径
    setProjectConfigLibPath(libPath:any,projectPath:any){
        const projectConfigPath:string = path.join(projectPath,'luatide_project.json');
        const projectJsonObj:any =  this.getProjectConfigJson();
        projectJsonObj.libPath = libPath;
        this.refreshProjectJson(projectJsonObj,projectConfigPath);
    }

    // 设置活动工程模块型号
    setProjectConfigModuleModel(moduleModel:any,projectPath:any){
        const projectConfigPath:string = path.join(projectPath,'luatide_project.json');
        const projectJsonObj:any =  this.getProjectConfigJson();
        projectJsonObj.moduleModel = moduleModel;
        this.refreshProjectJson(projectJsonObj,projectConfigPath);
    }

    // 设置活动工程下载文件列表
    pushProjectConfigAppFile(appFile:any,projectPath:any){
        const projectConfigPath:string = path.join(projectPath,'luatide_project.json');
        const projectJsonObj:any =  this.getProjectConfigJson();
        projectJsonObj.appFile.push(appFile);
        this.refreshProjectJson(projectJsonObj,projectConfigPath);
    }

    // 设置活动工程模块端口
    setProjectConfigModulePort(modulePort:any,projectPath:any){
        const projectConfigPath:string = path.join(projectPath,'luatide_project.json');
        const projectJsonObj:any =  this.getProjectConfigJson();
        projectJsonObj.modulePort = modulePort;
        this.refreshProjectJson(projectJsonObj,projectConfigPath);
    }

    // 刷新活动工程配置文件
    refreshProjectJson(projectJsonObj:any,projectPath:any){
        const projectConfigPath:string = path.join(projectPath,'luatide_project.json');
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
            muduleModel:'',
            appFile:[],
            modulePort:'',
        };
        this.refreshProjectJson(projectJson,projectConfigPath);
    }
}