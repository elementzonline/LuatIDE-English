
import {PluginVariablesInit} from './config';
import * as fs from 'fs';

let pluginVariablesInit = new PluginVariablesInit();
/**
 * 解析插件配置文件
 */
 export class PluginJsonParse {
    public projectList:any = [];
    public pluginConfigJson = {
        version:'',
        projectList:this.projectList,
        activeProject:'',
    };
    constructor() {
        
    }

    // 获取用户插件配置文件内容对象
    getPluginConfigJson(){
        const pluginConfigPath:any = pluginVariablesInit.getPluginConfigPath;
        const pluginConfigJson:any  = fs.readFileSync(pluginConfigPath);
        const pluginConfigJsonObj:any = JSON.parse(pluginConfigJson);
        return pluginConfigJsonObj;
    }

    // 获取用户插件配置文件内用户工程列表
    getPluginConfigUserProjectList(){
        const pluginConfigJsonObj:any =  this.getPluginConfigJson();
        const pluginConfigJsonProjectListObj:any = pluginConfigJsonObj.projectList;
        let pluginConfigProjectList:any = [];
        for (let i = 0; i < pluginConfigJsonProjectListObj.length; i++) {
            const element = pluginConfigJsonProjectListObj[i];
            pluginConfigProjectList.push(element.projectName);
        }
        return pluginConfigProjectList;
    }

    // 获取当前活动工程名称
    getPluginConfigActivityProject(){
        const pluginConfigJsonObj:any =  this.getPluginConfigJson();
        const pluginConfigActivityProject:string = pluginConfigJsonObj.activityProject;
        return pluginConfigActivityProject;
    }

    // 获取当前插件配置文件版本号
    getPluginConfigVersion(){
        const pluginConfigJsonObj:any =  this.getPluginConfigJson();
        const pluginConfigVersion:string = pluginConfigJsonObj.version;
        return pluginConfigVersion;
    }

    // 刷新插件配置文件
    refreshPlugintJson(plugintJsonObj:any){
        const pluginConfigPath:any = pluginVariablesInit.getPluginConfigPath; 
        const projectJson:string = JSON.stringify(plugintJsonObj,null,'\t');
        fs.writeFileSync(pluginConfigPath,projectJson);
    }

    // 设置插件配置文件的版本号
    setPluginConfigVersion(version:any){
        const pluginJsonObj:any = this.getPluginConfigJson();
        pluginJsonObj.version = version;
        this.refreshPlugintJson(pluginJsonObj);
    }

    // 推送工程至插件配置文件工程列表
    pushPluginConfigProject(project:any){
        const pluginJsonObj:any = this.getPluginConfigJson();
        pluginJsonObj.projectList.push(project);
        this.refreshPlugintJson(pluginJsonObj);
    }

    // 设置插件配置文件活动工程
    setPluginConfigActiveProject(activeProject:any){
        const pluginJsonObj:any = this.getPluginConfigJson();
        pluginJsonObj.activeProject = activeProject;
        this.refreshPlugintJson(pluginJsonObj);
    }

    // 删除指定工程从插件配置文件列表中
    popPluginConfigProject(projectName:any){
        const pluginJsonObj:any = this.getPluginConfigJson();
        for (let i = 0; i <pluginJsonObj.projectList.length; i++) {
            const projectObj:any = pluginJsonObj.projectList[i];
            if (projectObj.projectName===projectName) {
                pluginJsonObj.splice(i,1);
            }
        }
        this.refreshPlugintJson(pluginJsonObj);
    }
}