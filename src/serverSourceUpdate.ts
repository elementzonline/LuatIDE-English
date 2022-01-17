/*
*本文件用于更新LuatIDE资源文件，包括core文件、demo文件、lib文件
*/
import * as fetch from 'node-fetch';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as compressing from 'compressing';
import { PluginVariablesInit } from './config';
import * as path from 'path';
let plugVariablesInit = new PluginVariablesInit();

/*
*请求接口api获取各资源的路径json对象
*@param interfaceUrl 接口url的路径
*@returns jsonResult 返回接口请求的资源集合json对象
*/
async function getSourceHubJsonObj(interfaceUrl:string) {
    const response: any = await fetch(interfaceUrl);
    const jsonResult: any = await response.json();
    return jsonResult;
}

/*
*检查air72XUX资源文件是否有更新
*@returns checkAir72xScriptUpdateState air72x脚本资源更新状态 true:固件有更新,false:固件没有更新
*/
async function checkAir72XScriptUpdate(){
    const localScriptReg = /V([\d\.]+)/ig;
    const localScriptPath = plugVariablesInit.getAir72XDefaultLatestLibPath();
    const localScriptVersion:string|undefined = getLocalLatestSourceVersion(localScriptReg,localScriptPath);
    const remoteScriptReg = /V([\d\.]+)\.zip/ig;
    const apiName:string = '8910_script';
    const remoteScriptVersion:string|undefined = await  getRemoteScriptVersion(remoteScriptReg,apiName);
    // console.log(localScriptVersion,remoteScriptVersion);
    const checkAir72xScriptUpdateState:boolean = checkUpdateState(localScriptVersion,remoteScriptVersion);
    return checkAir72xScriptUpdateState;
}

/*
*检查air72XUX固件是否有更新
*@returns checkAir72xScriptUpdateState air72x固件资源更新状态 true:固件有更新,false:固件没有更新
*/
async function checkAir72XCoreUpdate(){
    const localScriptReg = /V([\d]+)_/ig;
    const localCorePath = plugVariablesInit.getAir72XDefaultLatestCorePath();
    const localCoreVersion:string|undefined = getLocalLatestSourceVersion(localScriptReg,localCorePath);
    const remoteScriptReg = /V([\d\.]+)\.zip/ig;
    const apiName:string = '8910_lua_lod';
    const remoteCoreVersion:string|undefined = await  getRemoteScriptVersion(remoteScriptReg,apiName);
    // console.log('====',localCoreVersion,remoteCoreVersion);
    const checkAir72xCoreUpdateState:boolean = checkUpdateState(localCoreVersion,remoteCoreVersion);
    return checkAir72xCoreUpdateState;
}

/*
*检查air101是否有更新
*@returns checkAir101UpdateState air101资源更新状态 true:固件有更新,false:固件没有更新
*/
async function checkAir101SourceUpdate() {
    const localScriptReg = /V([\d]+)_/ig;
    const localSourcePath:string = plugVariablesInit.getAir101DefaultLatestCorePath();
    const localScriptVersion:string|undefined = getLocalLatestSourceVersion(localScriptReg,localSourcePath);
    const remoteScriptReg = /V([\d]+)\.zip/ig;
    const apiName:string = '101_lua_lod';
    const remoteScriptVersion:string|undefined = await  getRemoteScriptVersion(remoteScriptReg,apiName);
    // console.log(localScriptVersion,remoteScriptVersion);
    const checkAir101UpdateState:boolean = checkUpdateState(localScriptVersion,remoteScriptVersion);
    return checkAir101UpdateState;
}

/*
*检查air103是否有更新
*@returns checkAir103UpdateState air103资源更新状态 true:固件有更新,false:固件没有更新
*/
async function checkAir103SourceUpdate() {
    const localScriptReg = /V([\d]+)_/ig;
    const localSourcePath:string = plugVariablesInit.getAir103DefaultLatestCorePath();
    const localScriptVersion:string|undefined = getLocalLatestSourceVersion(localScriptReg,localSourcePath);
    const remoteScriptReg = /V([\d]+)\.zip/ig;
    const apiName:string = '103_lua_lod';
    const remoteScriptVersion:string|undefined = await  getRemoteScriptVersion(remoteScriptReg,apiName);
    // console.log(localScriptVersion,remoteScriptVersion);
    const checkAir103UpdateState:boolean = checkUpdateState(localScriptVersion,remoteScriptVersion);
    return checkAir103UpdateState;
}

/*
*检查air105是否有更新
*@returns checkAir105UpdateState air105资源更新状态 true:固件有更新,false:固件没有更新
*/
async function checkAir105SourceUpdate() {
    const localScriptReg = /V([\d]+)_/ig;
    const localSourcePath:string = plugVariablesInit.getAir105DefaultLatestCorePath();
    const localScriptVersion:string|undefined = getLocalLatestSourceVersion(localScriptReg,localSourcePath);
    const remoteScriptReg = /V([\d]+)\.zip/ig;
    const apiName:string = '105_lua_lod';
    const remoteScriptVersion:string|undefined = await  getRemoteScriptVersion(remoteScriptReg,apiName);
    // console.log(localScriptVersion,remoteScriptVersion);
    const checkAir105UpdateState:boolean = checkUpdateState(localScriptVersion,remoteScriptVersion);
    return checkAir105UpdateState;
}

/*
*检查服务器是否有新的版本更新，通过输入本地资源版本号及远端资源版本号进行比对
*@param localSourceVersion 本地资源版本号
*@param remoteSourceVersion 远端资源版本号
*@returns true:固件有更新,false:固件没有更新
*/
function checkUpdateState(localSourceVersion:string|undefined,remoteSourceVersion:string|undefined){
    if (remoteSourceVersion === undefined) {
        console.log('检查服务器更新失败');
        return false;
    }
    else if (localSourceVersion === undefined) {
        return true;
    }
    else if (remoteSourceVersion>localSourceVersion) {
        return true;
    }
    return false;
}

/*
*获取远端服务器最新资源版本名称，通过指定的正则表达式的规则表达式及解析字符串名称处理得到
*@param reg 正则表达式将要解析过滤的规则表达式
*@param apiName 从api接口的json对象中将要获取的名称
*@returns remoteScriptVersion 解析后的远端最新版本名称
*/
async function getRemoteScriptVersion(reg:any,apiName:string) {
    const interfaceUrl:string = 'https://luatos.com/api/luatools/files';
    const jsonObj:any  = await getSourceHubJsonObj(interfaceUrl);
    const versionRegResultArray = reg.exec(jsonObj[apiName]);
    if (versionRegResultArray===null) {
        return undefined;
    }
    const remoteSourceVersion:string = versionRegResultArray[1];
    return remoteSourceVersion;
}

/*
*获取本地最新资源版本名称，通过指定的正则表达式的规则表达式及解析字符串名称处理得到
*@param reg 正则表达式将要解析过滤的规则表达式
*@param apiName 从api接口的json对象中将要获取的名称
*@returns remoteScriptVersion 解析后的远端最新版本名称
*/
function getLocalLatestSourceVersion(reg:any,localSourcePath:string) {
    const versionRegResultArray = reg.exec(localSourcePath);
    if (versionRegResultArray===null) {
        return undefined;
    }
    const localSourceVersion:string = versionRegResultArray[1];
    return localSourceVersion;
}

/*
*下载指定url的zip压缩文件到指定的本地目录
*@param url 远端指定的url接口
*@param filePath 存储到本地的目录位置
*/
async function download(url: any, filePath: any) {
    let headers:any = {};
    headers['Content-Type'] = 'application/x-zip-compressed';
    await fetch(url, {
        method: 'GET',
        headers: headers,
    }).then(res => res.buffer()).then(_ => {
        fs.writeFileSync(filePath, _, 'binary');
    });
  }

/*
*解压缩指定路径的zip文件到目的路径
*@param srcPath ZIP文件所在的源路径
*@param distPath 解压到的指定目的路径 
*/
async function unzip(srcPath: any, distPath: any) {
    await compressing.zip.uncompress(srcPath, distPath,{zipFileNameEncoding:'GBK'})
        .then(() => {
            console.log('unzip', 'success');
        })
        .catch(err => {
            console.error('unzip', err);
        });
}

/*
* 复制目录、子目录，及其中的文件
* @param src {String} 要复制的目录
* @param dist {String} 复制到目标目录
*/  
export function copyDir(src:any,dist:any){
    var b = fs.existsSync(dist);
    // console.log("dist = " + dist);
    if(!b){
        // console.log("mk dist = ",dist);
        fs.mkdirSync(dist);//创建目录
    }
    // console.log("_copy start");
    copyOperation(src,dist);
    }

/*
* 复制目录子操作
* @param src {String} 要复制的目录
* @param dist {String} 复制到目标目录
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
*递归删除文件夹内所有内容
*@param url 需要递归删除的文件目录名称
*/
async function deleteFolderRecursive(url: any) {
    if (fs.existsSync(url)) {
        let files = fs.readdirSync(url);
        files.forEach((file, index) => {
            var curPath = path.join(url, file);
            if (fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(url);
    } else {
        console.log('给定的路径不存在，请给出正确的路径');
    }
}

/*
*提示用户更新信息，进行信息交互若用户选择更新则执行更新操作流程
*@param downloadReadyHint 准备下载用户提示信息
*@param downloadingHint 下载过程中用户提示信息
*@param updateFunction 具体的下载函数
*/
async function updateHintForUser(downloadReadyHint:string,downloadingHint:string,updateFunction:any) {
    await vscode.window.showInformationMessage(downloadReadyHint, { modal: true }, '是').then(async result => {
        if (result !== undefined) {
            await updateProgressView(result,downloadingHint,updateFunction);
        }
    });
}

/*
*提示用户更新信息，进行信息交互若用户选择更新则执行更新操作流程
*@param result 用户选择的信息
*@param downloadReadyHint 用户提示信息
*@param updateFunction 具体的下载函数
*/
async function updateProgressView(result: string,downloadingHint:string,updateFunction:any) {
    if (result === '是') {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: downloadingHint,
            cancellable: true,
        }, async (progress, token) => {
            token.onCancellationRequested(() => {
                console.log('用户取消了更新');
            });
            progress.report({ increment: 0, message: '正在更新...' });
            progress.report({ increment: 10, message: '正在更新...' });
            await updateFunction;
            setTimeout(() => {
                progress.report({ increment: 50, message: '正在更新...' });
            }, 1000);

            const promise = new Promise<void>(resolve => {
                setTimeout(() => {
                    resolve();
                }, 5000);
            });
            return promise;
        });
    }
}

/*
*根据apiName获取下载资源临时存放路径,并对资源临时存储路径做初始化处理
*@param apiName 从api接口的json对象中将要获取的名称,区分服务器资源的类型
*@returns apiNameTempSavePath 拉取到本地的资源要存储的临时路径
*/
function getTempSavePath(apiName:string) {
    const luatideDataPath:string = plugVariablesInit.getLuatIDEDataPath();
    const tempSavePath:string = path.join(luatideDataPath,'temp');
    const apiNameTempSavePath:string = path.join(tempSavePath,apiName);
    if (!fs.existsSync(tempSavePath)) {
        fs.mkdirSync(tempSavePath);
    }
    if (!fs.existsSync(path.join(luatideDataPath,'temp',apiName))) {
        fs.mkdirSync(path.join(luatideDataPath,'temp',apiName));
    }
    return apiNameTempSavePath;
}

/*
*从远端服务器拉取air72x的demo和lib
*@param jsonObj 从远端服务器获取到的资源名称json数据对象
*@param sourceBaseUrl 远端资源基础url
*/
async function pullAir72XScript(jsonObj:any,sourceBaseUrl:string){
    let sourceAbsloutePath:string = path.join(sourceBaseUrl,'8910_script',jsonObj['8910_script']);
    const air72XScriptSourceTempPath:string = getTempSavePath('8910_script');
    const sourceDistPath:string = path.join(air72XScriptSourceTempPath,jsonObj['8910_script']);
    await download(sourceAbsloutePath,sourceDistPath);
    await unzip(sourceDistPath,air72XScriptSourceTempPath);
    await air72xLibHandle(path.join(air72XScriptSourceTempPath,'lib'),jsonObj['8910_script']);
    await air72xDemoHandle(path.join(air72XScriptSourceTempPath,'demo'),jsonObj['8910_script']);
    await deleteFolderRecursive(air72XScriptSourceTempPath);
}

/*
*从远端服务器拉取air72x的core
*@param jsonObj 从远端服务器获取到的资源名称json数据对象
*@param sourceBaseUrl 远端资源基础url
*/
async function pullAir72XCore(jsonObj:any,sourceBaseUrl:string) {
    let sourceAbsloutePath:string = path.join(sourceBaseUrl,'8910_lua_lod',jsonObj['8910_lua_lod']);
    const air72XCoreSourceTempPath:string = getTempSavePath('8910_lua_lod');
    const sourceDistPath:string = path.join(air72XCoreSourceTempPath,jsonObj['8910_lua_lod']);
    await download(sourceAbsloutePath,sourceDistPath);
    await unzip(sourceDistPath,air72XCoreSourceTempPath);
    air72xCoreHandle(air72XCoreSourceTempPath);
    await deleteFolderRecursive(air72XCoreSourceTempPath);
}

/*
*从远端服务器拉取air101的资源
*@param jsonObj 从远端服务器获取到的资源名称json数据对象
*@param sourceBaseUrl 远端资源基础url
*/
async function pullAir101Source(jsonObj:any,sourceBaseUrl:string) {
    let sourceAbsloutePath:string = path.join(sourceBaseUrl,'101_lua_lod',jsonObj['101_lua_lod']);
    const air101CoreSourceTempPath:string =  getTempSavePath('101_lua_lod');
    const sourceDistPath:string = path.join(air101CoreSourceTempPath,jsonObj['101_lua_lod']);
    await download(sourceAbsloutePath,sourceDistPath);
    await unzip(sourceDistPath,air101CoreSourceTempPath);
    const demoDistPath:string = plugVariablesInit.getAir101DefaultDemoPath();
    air101DemoHandle(path.join(air101CoreSourceTempPath,'demo'),demoDistPath);
    air101CoreHandle(air101CoreSourceTempPath);
    await deleteFolderRecursive(air101CoreSourceTempPath);
}

/*
*从远端服务器拉取air103的资源
*@param jsonObj 从远端服务器获取到的资源名称json数据对象
*@param sourceBaseUrl 远端资源基础url
*/
async function pullAir103Source(jsonObj:any,sourceBaseUrl:string) {
    let sourceAbsloutePath:string = path.join(sourceBaseUrl,'103_lua_lod',jsonObj['103_lua_lod']);
    const air103CoreSourceTempPath:string = getTempSavePath('103_lua_lod');
    const sourceDistPath:string = path.join(air103CoreSourceTempPath,jsonObj['103_lua_lod']);
    await download(sourceAbsloutePath,sourceDistPath);
    await unzip(sourceDistPath,air103CoreSourceTempPath);
    const demoDistPath:string = plugVariablesInit.getAir103DefaultDemoPath();
    air103DemoHandle(path.join(air103CoreSourceTempPath,'demo'),demoDistPath);
    air103CoreHandle(air103CoreSourceTempPath);
    await deleteFolderRecursive(air103CoreSourceTempPath);
}

/*
*从远端服务器拉取air105的资源
*@param jsonObj 从远端服务器获取到的资源名称json数据对象
*@param sourceBaseUrl 远端资源基础url
*/
async function pullAir105Source(jsonObj:any,sourceBaseUrl:string) {
    let sourceAbsloutePath:string = path.join(sourceBaseUrl,'105_lua_lod',jsonObj['105_lua_lod']);
    const air105CoreSourceTempPath:string =  getTempSavePath('105_lua_lod');
    const sourceDistPath:string = path.join(air105CoreSourceTempPath,jsonObj['105_lua_lod']);
    await download(sourceAbsloutePath,sourceDistPath);
    await unzip(sourceDistPath,air105CoreSourceTempPath);
    // const demoDistPath:string = plugVariablesInit.getAir105DefaultCorePath();
    // air105DemoHandle(path.join(air105CoreSourceTempPath,'demo'),demoDistPath);
    air105CoreHandle(air105CoreSourceTempPath);
    await deleteFolderRecursive(air105CoreSourceTempPath);
}

/*
*处理拉取到临时文件夹的air105固件 
*@param coreSourcePath air105固件资源临时存储路径
*/
function air105CoreHandle(coreSourcePath:string) {
    const air101CoreDistPath:string = plugVariablesInit.getAir105DefaultCorePath();
    const files = fs.readdirSync(coreSourcePath);
    files.forEach((fileName) => {
        const extname = path.extname(fileName);
        if (extname === '.soc') {
            fs.copyFileSync(path.join(coreSourcePath,fileName),path.join(air101CoreDistPath,fileName));
        }
    });
}

/*
*处理拉取到临时文件夹的air105 demo
*@param coreSourcePath air105固件资源临时存储路径
*/
// function air105DemoHandle(sourceDir:string,distDir:string) {
//     const demoNameArray = fs.readdirSync(sourceDir);
//     demoNameArray.forEach((demoName) => {
//         if (fs.existsSync(path.join(sourceDir,demoName,'Air105'))) {
//             copyDir(path.join(sourceDir,demoName,'Air105'),path.join(distDir,demoName));
//         }
//         else if (fs.existsSync(path.join(sourceDir,demoName,'main.lua'))) {
//             copyDir(path.join(sourceDir,demoName),path.join(distDir,demoName));
//         }
//     });
// }

/*
*处理拉取到临时文件夹的air103 DEMO 
*@param sourceDir air103 DEMO临时存储路径
*@param distDir air103 demo将要存储的路径
*/
function air103DemoHandle(sourceDir:string,distDir:string) {
    const demoNameArray = fs.readdirSync(sourceDir);
    demoNameArray.forEach((demoName) => {
        if (fs.existsSync(path.join(sourceDir,demoName,'Air103'))) {
            copyDir(path.join(sourceDir,demoName,'Air103'),path.join(distDir,demoName));
        }
        else if (fs.existsSync(path.join(sourceDir,demoName,'main.lua'))) {
            copyDir(path.join(sourceDir,demoName),path.join(distDir,demoName));
        }
    });
}

/*
*处理拉取到临时文件夹的air103 固件
*@param coreSourcePath air103固件资源临时存储路径
*/
function air103CoreHandle(coreSourcePath:string) {
    const air101CoreDistPath:string = plugVariablesInit.getAir103DefaultCorePath();
    const files = fs.readdirSync(coreSourcePath);
    files.forEach((fileName) => {
        const extname = path.extname(fileName);
        if (extname === '.soc') {
            fs.copyFileSync(path.join(coreSourcePath,fileName),path.join(air101CoreDistPath,fileName));
        }
    });
}

/*
*处理拉取到临时文件夹的air101 固件
*@param coreSourcePath air101固件资源临时存储路径
*/
function air101CoreHandle(coreSourcePath:string) {
    const air101CoreDistPath:string = plugVariablesInit.getAir101DefaultCorePath();
    const files = fs.readdirSync(coreSourcePath);
    files.forEach((fileName) => {
        const extname = path.extname(fileName);
        if (extname === '.soc') {
            fs.copyFileSync(path.join(coreSourcePath,fileName),path.join(air101CoreDistPath,fileName));
        }
    });
}

/*
*处理拉取到临时文件夹的air101 DEMO 
*@param sourceDir air101 DEMO临时存储路径
*@param distDir air101 demo将要存储的路径
*/
function air101DemoHandle(sourceDir:string,distDir:string) {
    const demoNameArray = fs.readdirSync(sourceDir);
    demoNameArray.forEach((demoName) => {
        if (fs.existsSync(path.join(sourceDir,demoName,'Air101'))) {
            copyDir(path.join(sourceDir,demoName,'Air101'),path.join(distDir,demoName));
        }
        else if (fs.existsSync(path.join(sourceDir,demoName,'main.lua'))) {
            copyDir(path.join(sourceDir,demoName),path.join(distDir,demoName));
        }
    });
}

/*
*处理拉取到临时文件夹的air72X 固件
*@param coreSourcePath air72X固件资源临时存储路径
*/
function air72xCoreHandle(coreSourcePath:string) {
    const air72xCoreDistPath:string = plugVariablesInit.getAir72XDefaultCorePath();
    const files = fs.readdirSync(coreSourcePath);
    // console.log('=============3',files);
    files.forEach((fileName) => {
        const extname = path.extname(fileName);
        // console.log('==========4',extname);
        if (extname === '.pac') {
            fs.copyFileSync(path.join(coreSourcePath,fileName),path.join(air72xCoreDistPath,fileName));
        }
    });
}

/*
*处理拉取到临时文件夹的air72X DEMO 
*@param sourceDir air72X DEMO临时存储路径
*@param distDir air72X demo将要存储的路径
*/
function air72xDemoHandle(demoSourcePath:string,demoName:string) {
    const reg = /.*?(V[\d\.]+?)\.zip/ig;
    let demoVersionArray:any = reg.exec(demoName);
    if (demoVersionArray===null) {
        return;
    }
    const demoVersion:string = demoVersionArray[1];
    const air72xDemoPath:string = plugVariablesInit.getAir72XDefaultDemoPath();
    const demoDistPath:string = path.join(air72xDemoPath,demoVersion);
    if (!fs.existsSync(demoDistPath)) {
        fs.mkdirSync(demoDistPath);
    }
    air72xDemoParse(demoSourcePath,demoDistPath);
}

/*
*处理拉取到临时文件夹的air72X DEMO 
*@param sourceDir air72X DEMO临时存储路径
*@param distDir air72X demo将要存储的路径
*/
function air72xDemoParse(sourceDir:string,distDir:string) {
    const demoNameArray = fs.readdirSync(sourceDir);
    demoNameArray.forEach((demoName) => {
        const demoMainLuaPath:string = path.join(sourceDir,demoName,'main.lua');
        if (fs.existsSync(demoMainLuaPath)) {
            copyDir(path.join(sourceDir,demoName),path.join(distDir,demoName));
        }
    });

}

/*
*处理拉取到临时文件夹的air72X LIB 
*@param sourceDir air72X LIB临时存储路径
*@param distDir air72X LIB将要存储的路径
*/
function air72xLibHandle(libSourcePath:string,libName:string) {
    const reg = /.*?(V[\d\.]+?)\.zip/ig;
    let libVersionArray:any = reg.exec(libName);
    if (libVersionArray===null) {
        return;
    }
    const libVersion:string = libVersionArray[1];
    const air72xLibPath:string = plugVariablesInit.getAir72XDefaultLibPath();
    if (!fs.existsSync(path.join(air72xLibPath,libVersion))) {
        fs.mkdirSync(path.join(air72xLibPath,libVersion));
    }
    const libDistPath:string = path.join(air72xLibPath,libVersion,'lib');
    copyDir(libSourcePath,libDistPath);
}

/*
*检查插件资源更新状态
*/
export async function checkSourceUpdate() {
    const air72XSourceUpdateState = await checkAir72XScriptUpdate();
    console.log(air72XSourceUpdateState);
    if (air72XSourceUpdateState) {
        const downloadReadyHint:string = '检测到air72XUX/air82XUX的DEMO及Lib文件有更新,是否更新？';
        const downloadingHint:string = '正在为您拉取最新air72XUX/air82XUX的DEMO及Lib文件,请耐心等待';
        const interfaceUrl = 'https://luatos.com/api/luatools/files';
        const sourceBasePath:string = 'http://cdndownload.openluat.com/Luat_tool_src/v2tools/'; 
        const jsonObj:any = await getSourceHubJsonObj(interfaceUrl);
        updateHintForUser(downloadReadyHint,downloadingHint,pullAir72XScript(jsonObj,sourceBasePath));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
    }
    const air72XCoreUpdateState = await checkAir72XCoreUpdate();
    console.log(air72XCoreUpdateState);
    if (air72XCoreUpdateState) {
        const downloadReadyHint:string = '检测到air72XUX/air82XUX固件有更新,是否更新？';
        const downloadingHint:string = '正在为您拉取最新air72XUX/air82XUX固件,请耐心等待';
        const interfaceUrl = 'https://luatos.com/api/luatools/files';
        const sourceBasePath:string = 'http://cdndownload.openluat.com/Luat_tool_src/v2tools/'; 
        const jsonObj:any = await getSourceHubJsonObj(interfaceUrl);
        updateHintForUser(downloadReadyHint,downloadingHint,pullAir72XCore(jsonObj,sourceBasePath));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
    }
    const air101SourceState = await checkAir101SourceUpdate();
    console.log(air101SourceState);
    if (air101SourceState) {
        const downloadReadyHint:string = '检测到air101资源文件有更新,是否更新？';
        const downloadingHint:string = '正在为您拉取最新air101资源文件,请耐心等待';
        const interfaceUrl = 'https://luatos.com/api/luatools/files';
        const sourceBasePath:string = 'http://cdndownload.openluat.com/Luat_tool_src/v2tools/'; 
        const jsonObj:any = await getSourceHubJsonObj(interfaceUrl);
        updateHintForUser(downloadReadyHint,downloadingHint,pullAir101Source(jsonObj,sourceBasePath));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               

    }
    const air103SourceState = await checkAir103SourceUpdate();
    console.log(air103SourceState);
    if (air103SourceState) {
        const downloadReadyHint:string = '检测到air103的资源文件有更新,是否更新？';
        const downloadingHint:string = '正在为您拉取最新air103资源文件,请耐心等待';
        const interfaceUrl = 'https://luatos.com/api/luatools/files';
        const sourceBasePath:string = 'http://cdndownload.openluat.com/Luat_tool_src/v2tools/'; 
        const jsonObj:any = await getSourceHubJsonObj(interfaceUrl);
        updateHintForUser(downloadReadyHint,downloadingHint,pullAir103Source(jsonObj,sourceBasePath));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               

    }
    const air105SourceState = await checkAir105SourceUpdate();
    console.log(air105SourceState);
    if (air105SourceState) {
        const downloadReadyHint:string = '检测到air105的资源文件有更新,是否更新？';
        const downloadingHint:string = '正在为您拉取最新air105资源文件,请耐心等待';
        const interfaceUrl = 'https://luatos.com/api/luatools/files';
        const sourceBasePath:string = 'http://cdndownload.openluat.com/Luat_tool_src/v2tools/'; 
        const jsonObj:any = await getSourceHubJsonObj(interfaceUrl);
        updateHintForUser(downloadReadyHint,downloadingHint,pullAir105Source(jsonObj,sourceBasePath));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
    }
}
// checkSourceUpdate();