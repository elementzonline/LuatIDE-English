// import { PluginJsonParse } from "../plugConfigParse";
import * as fs  from "fs";
import * as path  from "path";
import * as vscode from 'vscode';
import { activityMemoryProjectPathBuffer } from "../extension";
import { getPluginConfigUserProjectNameList, setPluginConfigActivityProject } from "../plugConfigParse";
import {
    getAir72XUXDefaultLatestLibPath,
    getAir72XUXDefaultLibPath,
    getCorePathBaseModuleModel,
    getDefaultLatestCorePath,
    getPluginAirModuleList,
    getPluginUnsupportedCoreModuleList,
} from "../variableInterface";

// let pluginJsonParse:any = new PluginJsonParse(); 

// 检查当前工程是否存在用户历史工程中
export function checkSameProjectExistStatusForPluginConfig(projectName:any){
    let userProjectList:any = getPluginConfigUserProjectNameList();
    if (userProjectList.indexOf(projectName)!==-1) {
        return true;
    }
    return false;
}

// 新建文件夹
export function createFolder(dir:any){
    fs.mkdirSync(dir);
}

/*
* 复制目录、子目录，及其中的文件
* @param src {String} 要复制的目录
* @param dist {String} 复制到目标目录
*/  
export function copyDir(src:any,dist:any){
    var b = fs.existsSync(dist);
    if(!b){
        fs.mkdirSync(dist);//创建目录
    }
    copyOperation(src,dist);
    }

/*
* 复制目录子操作
*/  
export function copyOperation(src:any, dist:any) {
    var paths = fs.readdirSync(src);
    paths.forEach((p) => {
        var _src = src + '/' +p;
        var _dist = dist + '/' +p;
        var stat = fs.statSync(_src);
        if(stat.isFile()) {// 判断是文件还是目录
            fs.writeFileSync(_dist, fs.readFileSync(_src));
        } else if(stat.isDirectory()) {
            copyDir(_src, _dist);// 当是目录是，递归复制
        }
    });
    }
    
/*
* 获取指定文件夹内所有基于基于指定文件夹的文件相对路径列表
* @param dir{String} 指定文件夹路径
* @param childrenDir{String} 目录内子文件夹路径
* @param filesList{stringList} 文件路径列表
* @returns filesList 指定路径内所有文件夹的名称
*/  
export function getFileForDirRecursion(dir:any,childrenDir:string=''){
    if (childrenDir==='') {
        childrenDir = dir;
    }
    let filesList:string[] = [];
    const files:any = fs.readdirSync(childrenDir);
    for (let index = 0; index < files.length; index++) {
        const filePath:string = path.join(childrenDir,files[index]);
        if (fs.statSync(filePath).isDirectory()) {
            filesList.push(path.relative(dir,filePath));
            const filesChildrenList = getFileForDirRecursion(dir,filePath);
            if (filesChildrenList!==undefined) {
                filesList = filesList?.concat(filesChildrenList);
            }
            else{
                return undefined;
            }
        }
        else{
            for (let i = 0; i < filesList.length; i++) {
                const element = filesList[i];
                if (path.basename(element)===path.basename(filePath) && filePath.indexOf('ndk')===-1) {
                    vscode.window.showErrorMessage(`检测到工程内有同名文件${path.basename(filePath)},工程组织失败!!`);
                    return undefined;
                }
            }
            filesList.push(path.relative(dir,filePath));
        }
    }
    return filesList;
}

// 递归删除文件夹内容
export function deleteDirRecursive(dir:any){
    if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        files.forEach( (file) => {
            var curPath = path.join(dir,file);
            // fs.statSync同步读取文件夹文件，如果是文件夹，在重复触发函数
            if (fs.statSync(curPath).isDirectory()) { // recurse
                deleteDirRecursive(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        try {
            fs.rmdirSync(dir);
        } catch (error) {
            console.log('删除失败',error);
        }
        
    }
    else{
        vscode.window.showErrorMessage(`${dir}路径已改变，请重新确认`);
    }
}

export function projectActiveInterfact(activityProjectName:string,activityProjectPath:string) {
    // 执行激活到资源管理器命令
    vscode.window.showInformationMessage(`请选择激活${activityProjectName}工程的打开方式`,{modal:true},"当前窗口打开","新窗口打开").then(
        result =>{
            if (result==='当前窗口打开') {
                setPluginConfigActivityProject(activityProjectPath);
                activityMemoryProjectPathBuffer.activityMemoryProjectPath = activityProjectPath;
                vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
                vscode.commands.executeCommand("vscode.openFolder",vscode.Uri.file(activityProjectPath),false);
            }
            else if(result === '新窗口打开'){
                setPluginConfigActivityProject(activityProjectPath);
                vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
                vscode.commands.executeCommand("vscode.openFolder",vscode.Uri.file(activityProjectPath),true);
            }
        }
    ); 
}

 // 接收到的webview发送的lib处理
 export function getCreateProjectLibpathHandle(libPath:string,moduleModel:string){
    const air72XUXDefaultLibPath = getAir72XUXDefaultLibPath();
    const airModuleList:string[] = getPluginAirModuleList();
    if (fs.existsSync(libPath)) {
        libPath = libPath;
    }
    else{
        if (libPath==='' && airModuleList.indexOf(moduleModel)!==-1) {
            libPath = getAir72XUXDefaultLatestLibPath();
        }
        else if (libPath!=='' && airModuleList.indexOf(moduleModel)!==-1) {
            libPath = path.join(air72XUXDefaultLibPath,libPath,'lib');
        }
        else{
            libPath = '';
        }
    }
 
    return libPath;
}

 //接收到的webview发送的core路径处理
 export function getCreateProjectCorepathHandle(corePath:string,moduleModel:string){
    const defaultCorePath:string = getCorePathBaseModuleModel(moduleModel);
    if (fs.existsSync(corePath)) {
        corePath = corePath;
    }
    else if (getPluginUnsupportedCoreModuleList().indexOf(moduleModel)!==-1) {
        corePath = '';
    }
    else if (corePath==='') {
        corePath  = getDefaultLatestCorePath(moduleModel);
    }
    else{
        corePath = path.join(defaultCorePath,corePath);
    }
    return corePath;
 }

// 获取指定路径文件对象
export function getJsonObj(path:string) {
    const fileContent:string = fs.readFileSync(path).toString();
    const fileObj:any = JSON.parse(fileContent);
    return fileObj;
}


// 新增ignore列表
export function getProjectIgnoreList(){
    const projectIgnoreList:string[] = [".pac",'.soc','.zip',".dfota.bin",".txt","doc",".md",'.pdf'];
    return projectIgnoreList;
}