import { PluginJsonParse } from "../plugConfigParse";
import * as fs  from "fs";
import * as path  from "path";
import * as vscode from 'vscode';
import {
    getAir101DefaultCorePath,
    getAir101DefaultLatestCorePath,
    getAir103DefaultCorePath,
    getAir103DefaultLatestCorePath,
    getAir105DefaultCorePath,
    getAir105DefaultLatestCorePath,
    getAir72XUXDefaultCorePath,
    getAir72XUXDefaultLatestCorePath,
    getAir72XUXDefaultLatestLibPath,
    getAir72XUXDefaultLibPath,
    getEsp32c3DefaultCorePath
} from "../variableInterface";

let pluginJsonParse:any = new PluginJsonParse(); 

// 检查当前工程是否存在用户历史工程中
export function checkSameProjectExistStatusForPluginConfig(projectName:any){
    let userProjectList:any = pluginJsonParse.getPluginConfigUserProjectList();
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
    console.log("dist = " + dist);
    if(!b){
        console.log("mk dist = ",dist);
        fs.mkdirSync(dist);//创建目录
    }
    console.log("_copy start");
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
export function getFileForDirRecursion(dir:any,childrenDir:string='',filesList:string[]|undefined = []){
    if (childrenDir==='') {
        childrenDir = dir;
    }
    const files:any = fs.readdirSync(childrenDir);
    for (let index = 0; index < files.length; index++) {
        const filePath:string = path.join(childrenDir,files[index]);
        if (fs.statSync(filePath).isDirectory()) {
            filesList.push(path.relative(dir,filePath));
            const filesChildrenList = getFileForDirRecursion(dir,filePath,filesList);
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
                vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
                vscode.commands.executeCommand("vscode.openFolder",vscode.Uri.file(activityProjectPath),false);
            }
            else if(result === '新窗口打开'){
                vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
                vscode.commands.executeCommand("vscode.openFolder",vscode.Uri.file(activityProjectPath),true);
            }
        }
    ); 
}

 // 接收到的webview发送的lib处理
 export function getCreateProjectLibpathHandle(libPath:string,moduleModel:string){
    const air72XUXDefaultLibPath = getAir72XUXDefaultLibPath();
    if (fs.existsSync(libPath)) {
        libPath = libPath;
    }
    else if (libPath==='' && moduleModel!=='air101'  && moduleModel!=='air103'  && moduleModel!=='air105') {
        libPath = getAir72XUXDefaultLatestLibPath();
    }
    else if (libPath==='' && moduleModel==='air101'  || moduleModel ==='air103'  || moduleModel==='air105' || moduleModel === 'esp32c3') {
        libPath = '';
    }
    else{
        libPath = path.join(air72XUXDefaultLibPath,libPath,'lib');
    }
    return libPath;
}

 //接收到的webview发送的core路径处理
 export function getCreateProjectCorepathHandle(corePath:string,moduleModel:string){
    switch(moduleModel){
        case 'air72XUX/air82XUX':
            corePath = getCreateProjectAir72XUXCorepathHandle(corePath);
            break;
        case 'air72XCX':
            corePath = '';
            break;
        case 'air101':
            corePath = getCreateProjectAir101CorepathHandle(corePath);
            break;
        case 'air103':
            corePath = getCreateProjectAir103CorepathHandle(corePath);
            break;
        case 'air105':
            corePath = getCreateProjectAir105CorepathHandle(corePath);
            break;
        case 'simulator':
            corePath = getCreateProjectAir72XUXCorepathHandle(corePath);
            break;
        case 'esp32c3':
            corePath = getCreateProjectEsp32CorepathHandle(corePath);
    }
    return corePath;
}

// 接收到的webview发送的esp32c3的core处理
export function getCreateProjectEsp32CorepathHandle(corePath:string){
    const esp32c3DefaultCorePath = getEsp32c3DefaultCorePath();
    if (fs.existsSync(corePath)) {
        corePath = corePath;
    }
    else if (corePath==='') {
        corePath = getAir101DefaultLatestCorePath();
    }
    else{
        corePath = path.join(esp32c3DefaultCorePath,corePath);
    }
    return corePath;
}

// 接收到的webview发送的air101的core处理
export function getCreateProjectAir101CorepathHandle(corePath:string){
    const air101DefaultCorePath = getAir101DefaultCorePath();
    if (fs.existsSync(corePath)) {
        corePath = corePath;
    }
    else if (corePath==='') {
        corePath = getAir101DefaultLatestCorePath();
    }
    else{
        corePath = path.join(air101DefaultCorePath,corePath);
    }
    return corePath;
}

// 接收到的webview发送的air103的core处理
export function getCreateProjectAir103CorepathHandle(corePath:string){
    const air103DefaultCorePath = getAir103DefaultCorePath();
    if (fs.existsSync(corePath)) {
        corePath = corePath;
    }
    else if (corePath==='') {
        corePath = getAir103DefaultLatestCorePath();
    }
    else{
        corePath = path.join(air103DefaultCorePath,corePath);
    }
    return corePath;
}

// 接收到的webview发送的air105的core处理
export function getCreateProjectAir105CorepathHandle(corePath:string){
    const air105DefaultCorePath = getAir105DefaultCorePath();
    if (fs.existsSync(corePath)) {
        corePath = corePath;
    }
    else if (corePath==='') {
        corePath = getAir105DefaultLatestCorePath();
    }
    else{
        corePath = path.join(air105DefaultCorePath,corePath);
    }
    return corePath;
}

// 接收到的webview发送的air72XUX的core处理
export function getCreateProjectAir72XUXCorepathHandle(corePath:string){
    const air72XUXDefaultCorePath = getAir72XUXDefaultCorePath();
    if (fs.existsSync(corePath)) {
        corePath = corePath;
    }
    else if (corePath==='') {
        corePath = getAir72XUXDefaultLatestCorePath();
    }
    else{
        corePath = path.join(air72XUXDefaultCorePath,corePath);
    }
    return corePath;
}