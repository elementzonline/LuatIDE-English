
import {PluginVariablesInit} from './config';
import * as fs from 'fs';
import * as path from 'path';

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
        const pluginConfigPath:any = pluginVariablesInit.getPluginConfigPath();
        const pluginConfigJson:any  = fs.readFileSync(pluginConfigPath,'utf-8');
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

    // 获取用户插件配置文件内用户工程完整路径
    getPluginConfigUserProjectAbsolutePathList(){
        const pluginConfigJsonObj:any =  this.getPluginConfigJson();
        const pluginConfigJsonProjectListObj:any = pluginConfigJsonObj.projectList;
        let pluginConfigProjecAbsolutePathtList:any = [];
        for (let i = 0; i < pluginConfigJsonProjectListObj.length; i++) {
            const element = pluginConfigJsonProjectListObj[i];
            pluginConfigProjecAbsolutePathtList.push(path.join(element.projectPath,element.projectName));
        }
        return pluginConfigProjecAbsolutePathtList;
    }

    // 获取当前活动工程名称
    getPluginConfigActivityProject(){
        const pluginConfigJsonObj:any =  this.getPluginConfigJson();
        const pluginConfigActivityProject:string = pluginConfigJsonObj.activeProject;
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
        const pluginConfigPath:any = pluginVariablesInit.getPluginConfigPath(); 
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
    setPluginConfigActivityProject(activeProject:any){
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
                pluginJsonObj.projectList.splice(i,1);
            }
        }
        this.refreshPlugintJson(pluginJsonObj);
    }

     // 插件配置文件兼容
     pluginConfigCompatible() {
         // plugin版本2.0以下兼容
         const pluginConfigPath: string = pluginVariablesInit.getPluginConfigPath();
         const pluginJson: string = fs.readFileSync(pluginConfigPath, 'utf-8');
         const pluginJsonObj = JSON.parse(pluginJson);
         let luatideWorkspaceJson: any = {
             version: '',
             projectList: [],
             activeProject: '',
         };
         if (Number(pluginJsonObj.version) < 2.0) {
             // 活动工程兼容
             const activityProject: string = pluginJsonObj['active_workspace'];
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
             const pluginConfigJsonNew = JSON.stringify(luatideWorkspaceJson,null,"\t");
             fs.writeFileSync(pluginConfigPath, pluginConfigJsonNew);
         }
     }

     // 工程配置文件兼容
     projectConfigCompatible(projectPath: string) {
         const projectConfigPath: string = path.join(projectPath, 'luatide_project.json');
         if (!fs.existsSync(projectConfigPath)) {
             return;
         }
         const projectOldJson: string = fs.readFileSync(projectConfigPath, 'utf-8');
         const projectOldJsonObj = JSON.parse(projectOldJson);
         let luatideProjectNewJson: any = {
             version: '',
             projectType: 'pure',
             corePath: '',
             libPath: '',
             modulePath: '',
             appFile: [],
             modulePort: '',
         };
         if (projectOldJsonObj.version!=="" &&Number(projectOldJsonObj.version) < 2.0) {
             // 用户core路径兼容
             const corePath: string = projectOldJsonObj['corefile_path'];
             luatideProjectNewJson.corePath = corePath;
             // 用户lib路径兼容
             let libPath: string = projectOldJsonObj['lib_path'];
             if (libPath === '' && projectOldJsonObj['module_model'] !== 'Air10X') {
                 libPath = pluginVariablesInit.getAir72XDefaultLatestLibPath();
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
                 case 'Simulator':
                     luatideProjectNewJson.moduleModel = 'simulator';
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
             const projectConfigJsonNew = JSON.stringify(luatideProjectNewJson,null,"\t");
             fs.writeFileSync(projectConfigPath, projectConfigJsonNew,);
         }
     }
 }