import { PluginJsonParse } from "../plugConfigParse";
import * as fs  from "fs";
import * as path  from "path";
import * as vscode from 'vscode';

let pluginJsonParse:any = new PluginJsonParse(); 

// 检查当前工程是否存在用户历史工程中
export function checkSameProjectExistStatusForPluginConfig(projectName:any){
    let userProjectArray:any = pluginJsonParse.getPluginConfigUserArray();
    if (userProjectArray.indexOf(projectName)!==-1) {
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
    
// 获取文件夹内文件列表
export function getFileForDir(dir:any){
    const files:any = fs.readdirSync(dir);
    return files;
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
        fs.rmdirSync(dir);
    }
    else{
        vscode.window.showErrorMessage(`${dir}路径已改变，请重新确认`);
    }
}
