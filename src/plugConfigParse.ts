
import {PluginVariablesInit} from './config';
import * as fs from 'fs';
import * as path from 'path';
import {activityMemoryProjectPathBuffer} from './extension';
import * as vscode from 'vscode';
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
        // const context:any = await vscode.commands.executeCommand("getContext") as vscode.ExtensionContext;
        // const activityProject = context.globalState.get('activityMemoryProjectPath');
        // return activityProject;
        // const pluginConfigJsonObj:any =  this.getPluginConfigJson();
        // const pluginConfigActivityProject:string = pluginConfigJsonObj.activeProject;
        // return pluginConfigActivityProject;
        const activityMemoryProjectPath = activityMemoryProjectPathBuffer['activityMemoryProjectPath'];
        return activityMemoryProjectPath;
    }
    
    // 获取实时活动工程名称
    getCurrentPluginConfigActivityProject(){
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

    // 获取2.0,2.1版本插件配置文件初始化对象
    getPluginConfigObjVersionTwo(){
        const luatideWorkspaceJson: any = {
            version: '',
            projectList: [],
            activeProject: '',
        };
        return luatideWorkspaceJson;
    }

     // 插件配置文件兼容
     pluginConfigCompatible() {
        // plugin版本2.0以下兼容
        const pluginConfigPath: string = pluginVariablesInit.getPluginConfigPath();
        const pluginJson: string = fs.readFileSync(pluginConfigPath, 'utf-8');
        const pluginJsonObj = JSON.parse(pluginJson);
        if (Number(pluginJsonObj.version) < 2.0) {
            this.pluginConfigCompatibleVersionLessThanTwo(pluginConfigPath,pluginJsonObj);
        }
        else if (Number(pluginJsonObj.version) === 2.0) {
            this.pluginConfigCompatibleVersionTwo(pluginConfigPath,pluginJsonObj);
        }
     }

    //  插件配置文件2.0以下版本配置文件兼容至2.0版本
    pluginConfigCompatibleVersionLessThanTwo(pluginConfigPath:string,pluginJsonObj:any){
          // 活动工程兼容
          const activityProject: string = pluginJsonObj['active_workspace'];
          const luatideWorkspaceJson:any = this.getPluginConfigObjVersionTwo();
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
    // 插件配置文件2.0版本配置文件兼容至2.1版本
    pluginConfigCompatibleVersionTwo(pluginConfigPath:string,pluginJsonObj:any){
        // Air72X_CORE路径内容复制到Air72XUX_CORE路径下
        const coreDataPath:string = pluginVariablesInit.getHistoryCorePath();
        const air72XOldCorePath:string = path.join(coreDataPath,'Air72X_CORE');
        const air72XUXCorePath:string = pluginVariablesInit.getAir72XUXCorePath();
        this.copyDir(air72XOldCorePath,air72XUXCorePath);
        // Air72X_DEMO路径内容复制到Air72XUX_DEMO路径下
        const demoDataPath:string = pluginVariablesInit.getHistoryDemoPath();
        const air72XOldDemoPath:string = path.join(demoDataPath,'Air72X_DEMO');
        const air72XUXDemoPath:string = pluginVariablesInit.getAir72XUXDemoPath();
        this.copyDir(air72XOldDemoPath,air72XUXDemoPath);
        // Air72X_LIB路径内容复制到Air72XUX_LIB路径下
        const libDataPath:string = pluginVariablesInit.getHistoryLibPath();
        const air72XOldLibPath:string = path.join(libDataPath,'Air72X_LIB');
        const air72XUXLibPath:string = pluginVariablesInit.getAir72XUXLibPath();
        this.copyDir(air72XOldLibPath,air72XUXLibPath);
        // 删除Air72X_CORE所有内容
        this.deleteDirRecursive(air72XOldCorePath);
        // 删除Air72X_DEMO所有内容
        this.deleteDirRecursive(air72XOldDemoPath);
        // 删除Air72X_LIB所有内容
        this.deleteDirRecursive(air72XOldLibPath);
        // 更新插件配置文件版本至2.1
        let activityProject: string = pluginJsonObj.activeProject;
        // 对活动工程的插件配置文件进行兼容
        if (fs.existsSync(activityProject)) {
            this.projectConfigCompatible(activityProject);
        }
        else{
            activityProject='';
        }
        let luatideWorkspaceJson:any = this.getPluginConfigObjVersionTwo();
        luatideWorkspaceJson.activeProject = activityProject;
        luatideWorkspaceJson.projectList = pluginJsonObj.projectList;
        // 插件版本兼容
        luatideWorkspaceJson.version = '2.1';
        const pluginConfigJsonNew = JSON.stringify(luatideWorkspaceJson,null,"\t");
        fs.writeFileSync(pluginConfigPath, pluginConfigJsonNew);
    }
     // 工程配置文件兼容
     projectConfigCompatible(projectPath: string) {
        const projectConfigPath: string = path.join(projectPath, 'luatide_project.json');
        if (!fs.existsSync(projectConfigPath)) {
            return;
        }
        let projectOldJsonObj = this.getProjectConfigObj(projectConfigPath);
        if (projectOldJsonObj.version!=="" && Number(projectOldJsonObj.version) < 2.0) {
            this.projectConfigCompatibleVersionLessThanTwo(projectPath,projectOldJsonObj);
            projectOldJsonObj = this.getProjectConfigObj(projectConfigPath);
            this.projectConfigCompatibleVersionTwo(projectPath,projectOldJsonObj);
            projectOldJsonObj = this.getProjectConfigObj(projectConfigPath);
            this.projectConfigCompatibleVersionTwoPointOne(projectPath,projectOldJsonObj);
        }
        else if(projectOldJsonObj.version!=="" && Number(projectOldJsonObj.version) === 2.0){
            this.projectConfigCompatibleVersionTwo(projectPath,projectOldJsonObj);
            projectOldJsonObj = this.getProjectConfigObj(projectConfigPath);
            this.projectConfigCompatibleVersionTwoPointOne(projectPath,projectOldJsonObj);
        }
        else if (projectOldJsonObj.version!=="" && Number(projectOldJsonObj.version) === 2.1) {
            this.projectConfigCompatibleVersionTwoPointOne(projectPath,projectOldJsonObj);
            }
    }

    // 获取指定路径工程配置的对象
    getProjectConfigObj(projectConfigPath:string){
        const projectOldJson: string = fs.readFileSync(projectConfigPath, 'utf-8');
        const projectOldJsonObj = JSON.parse(projectOldJson);
        return projectOldJsonObj;
    }

    // 获取2.0,2.1版本工程配置文件初始化对象
    getProjectJsonObjVersionTwo(){
        let luatideProjectNewJson: any = {
            version: '',
            projectType: 'pure',
            corePath: '',
            libPath: '',
            moduleModel: '',
            appFile: [],
            modulePort: '',
        };
        return luatideProjectNewJson;
    }

    // 工程配置文件2.0以下版本配置文件兼容至2.0版本
    projectConfigCompatibleVersionLessThanTwo(projectPath:string,projectOldJsonObj:any){
        const projectConfigPath: string = path.join(projectPath, 'luatide_project.json');
        const luatideProjectNewJson:any = this.getProjectJsonObjVersionTwo();
        // 用户core路径兼容
        const corePath: string = projectOldJsonObj['corefile_path'];
        luatideProjectNewJson.corePath = corePath;
        // 用户lib路径兼容
        let libPath: string = projectOldJsonObj['lib_path'];
        if (libPath === '' && projectOldJsonObj['module_model'] !== 'Air10X') {
            libPath = pluginVariablesInit.getAir72XUXDefaultLatestLibPath();
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
        const projectConfigJsonNew = JSON.stringify(luatideProjectNewJson, null, "\t");
        fs.writeFileSync(projectConfigPath, projectConfigJsonNew);
    }

    // 工程配置文件2.0版本配置文件兼容至2.1版本
    projectConfigCompatibleVersionTwo(projectPath:string,projectOldJsonObj:any){
        const projectName:string = path.basename(projectPath);
        const projectConfigPath: string = path.join(projectPath, 'luatide_project.json');
        const luatideProjectNewJson:any = this.getProjectJsonObjVersionTwo();
        // 用户appFile文件兼容
        const appFileOld: string[] = projectOldJsonObj['appFile'];
        for (let i = 0; i < appFileOld.length; i++) {
            const appFilePath:string = appFileOld[i];
            if (fs.existsSync(appFilePath)) {
                if (appFilePath.toLowerCase().indexOf(projectPath.toLowerCase())!==-1) {
                    const appFileRelativePath = path.relative(projectPath,appFilePath);
                    luatideProjectNewJson.appFile.push(appFileRelativePath);
                }
            }
            else{
                const reg = new RegExp(`${projectName}[\\\\|/](.*)`,'ig');
                const array = reg.exec(appFilePath);
                if (array!==null) {
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
        const projectConfigJsonNew = JSON.stringify(luatideProjectNewJson,null,"\t");
        fs.writeFileSync(projectConfigPath, projectConfigJsonNew);
    }

    // 工程配置文件2.1版本配置文件兼容至2.2版本
    projectConfigCompatibleVersionTwoPointOne(projectPath:string,projectOldJsonObj:any){
        const projectConfigPath: string = path.join(projectPath, 'luatide_project.json');
        const luatideProjectNewJson:any = this.getProjectJsonObjVersionTwo();
        // 工程模块型号兼容
        let moduleModel:string = projectOldJsonObj.moduleModel;
        if (moduleModel==='air10X') {
            moduleModel = 'air101';
        }
        // 工程core文件兼容
        let corePath:string = projectOldJsonObj.corePath;
        if (corePath!=='' && corePath.indexOf('Air72X_CORE')!==-1) {
            corePath = corePath.replace('\\LuatIDE\\LuatideLib\\Air72X_CORE','\\LuatIDE\\LuatideLib\\Air72XUX_CORE');
        }
        // 工程lib文件兼容
        let libPath:string = projectOldJsonObj.libPath;
        if (libPath!=='' && libPath.indexOf('Air72X_LIB')!==-1) {
            libPath = libPath.replace('\\LuatIDE\\LuatideLib\\Air72X_LIB','\\LuatIDE\\LuatideLib\\Air72XUX_LIB');
        }
        luatideProjectNewJson.version = '2.2';
        luatideProjectNewJson.projectType = projectOldJsonObj.projectType;
        luatideProjectNewJson.corePath = corePath;
        luatideProjectNewJson.libPath = libPath;
        luatideProjectNewJson.appFile = projectOldJsonObj.appFile;                                                                                                                
        luatideProjectNewJson.moduleModel = moduleModel;
        luatideProjectNewJson.modulePort = projectOldJsonObj.modulePort;
        const projectConfigJsonNew = JSON.stringify(luatideProjectNewJson,null,"\t");
        fs.writeFileSync(projectConfigPath, projectConfigJsonNew);
    }

    /*
    * 复制目录、子目录，及其中的文件
    * @param src {String} 要复制的目录
    * @param dist {String} 复制到目标目录
    */  
    copyDir(src: any, dist: any) {
    var b = fs.existsSync(dist);
    console.log("dist = " + dist);
    if (!b) {
        console.log("mk dist = ", dist);
        fs.mkdirSync(dist);//创建目录
    }
    console.log("_copy start");
    this.copyOperation(src, dist);
    }

/*
* 复制目录子操作
*/
copyOperation(src: any, dist: any) {
    var paths = fs.readdirSync(src);
    paths.forEach((p) => {
        var _src = src + '/' + p;
        var _dist = dist + '/' + p;
        var stat = fs.statSync(_src);
        if (stat.isFile()) {// 判断是文件还是目录
            fs.writeFileSync(_dist, fs.readFileSync(_src));
        } else if (stat.isDirectory()) {
            this.copyDir(_src, _dist);// 当是目录是，递归复制
        }
    });
}
// 递归删除文件夹内容
deleteDirRecursive(dir:any){
    if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        files.forEach( (file) => {
            var curPath = path.join(dir,file);
            // fs.statSync同步读取文件夹文件，如果是文件夹，在重复触发函数
            if (fs.statSync(curPath).isDirectory()) { // recurse
                this.deleteDirRecursive(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(dir);
    }
    else{
        vscode.window.showErrorMessage(`${dir}路径已改变，请重新确认`);
    }
}
 }