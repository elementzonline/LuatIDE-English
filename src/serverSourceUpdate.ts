/*
*本文件用于更新LuatIDE资源文件，包括core文件、demo文件、lib文件
*/
import * as fetch from 'node-fetch';
import * as vscode from 'vscode';
import * as fs from 'fs';
// import * as compressing from 'compressing';
import * as childProcess from 'child_process';
import * as path from 'path';
import {
    getAir101DefaultCorePath,
    getAir101DefaultDemoPath,
    getAir103DefaultCorePath,
    getAir103DefaultDemoPath,
    getAir105DefaultCorePath,
    getAir105DefaultDemoPath,
    getEsp32c3DefaultCorePath,
    getEsp32c3DefaultDemoPath,
    getAir72XUXDefaultCorePath,
    getAir72XUXDefaultDemoPath,
    getAir72XUXDefaultLatestLibName,
    getAir72XUXDefaultLibPath,
    getLuatIDEDataPath,
    getAir72XCXDefaultCorePath,
    getDefaultLatestCoreName,
    getAir72XCXModuleModelName,
    getUnzipToolPath,
    getAir72XCXDefaultLatestLibName,
    getAir72XCXDefaultLibPath,
    getAir72XCXDefaultDemoPath,
} from './variableInterface';
import { copyDir } from './project/projectApi';
import { getUiDesignCode } from './ui/uiDesignSourceUpdate';
import { getNdkCode } from './ndk/ndkCodeDownload';

/*
*请求接口api获取各资源的路径json对象
*@param interfaceUrl 接口url的路径
*@returns jsonResult 返回接口请求的资源集合json对象
*/
export async function getSourceHubJsonObj(interfaceUrl: string) {
    const response: any = await fetch(interfaceUrl)
        .catch(error => {
            console.log(error);
            return undefined;
        });
    if (response === undefined) {
        return undefined;
    }
    const jsonResult: any = await response.json();
    return jsonResult;
}

/*
*检查air72XUX资源文件是否有更新
*@returns checkAir72XUXScriptUpdateState air72XUX脚本资源更新状态 true:固件有更新,false:固件没有更新
*/
async function checkAir72XUXScriptUpdate() {
    const localScriptReg = /V([\d\.]+)/ig;
    const localScriptName = getAir72XUXDefaultLatestLibName();
    const localScriptVersion: string | undefined = getLocalLatestSourceVersion(localScriptReg, localScriptName);
    const remoteScriptReg = /V([\d\.]+)\.zip/ig;
    const apiName: string = '8910_script';
    const remoteScriptVersion: string | undefined = await getRemoteScriptVersion(remoteScriptReg, apiName);
    // console.log(localScriptVersion,remoteScriptVersion);
    const checkAir72XUXScriptUpdateState: boolean | undefined = checkUpdateState(localScriptVersion, remoteScriptVersion);
    return checkAir72XUXScriptUpdateState;
}

// *检查air72XCX资源文件是否有更新
// *@returns checkAir72XCXScriptUpdateState air72XCX脚本资源更新状态 true:固件有更新,false:固件没有更新
// */
async function checkAir72XCXScriptUpdate() {
    const localScriptReg = /V([\d\.]+)/ig;
    const localScriptName = getAir72XCXDefaultLatestLibName();
    const localScriptVersion: string | undefined = getLocalLatestSourceVersion(localScriptReg, localScriptName);
    const remoteScriptReg = /V([\d\.]+)\.zip/ig;
    const apiName: string = '8910_script';
    const remoteScriptVersion: string | undefined = await getRemoteScriptVersion(remoteScriptReg, apiName);
    // console.log(localScriptVersion,remoteScriptVersion);
    const checkAir72XCXScriptUpdateState: boolean | undefined = checkUpdateState(localScriptVersion, remoteScriptVersion);
    return checkAir72XCXScriptUpdateState;
}

/*
*检查air72XUX固件是否有更新
*@returns checkAir72XUXScriptUpdateState air72XUX固件资源更新状态 true:固件有更新,false:固件没有更新
*/
async function checkAir72XUXCoreUpdate() {
    const localScriptReg = /V([\d]+)_/ig;
    const localCoreName = getDefaultLatestCoreName('air72XUX/air82XUX');
    const localCoreVersion: string | undefined = getLocalLatestSourceVersion(localScriptReg, localCoreName);
    const remoteScriptReg = /V([\d\.]+)\.zip/ig;
    const apiName: string = '8910_lua_lod';
    const remoteCoreVersion: string | undefined = await getRemoteScriptVersion(remoteScriptReg, apiName);
    // console.log('====',localCoreVersion,remoteCoreVersion);
    const checkAir72XUXCoreUpdateState: boolean | undefined = checkUpdateState(localCoreVersion, remoteCoreVersion);
    return checkAir72XUXCoreUpdateState;
}

/*
*检查air101是否有更新
*@returns checkAir101UpdateState air101资源更新状态 true:固件有更新,false:固件没有更新
*/
async function checkAir101SourceUpdate() {
    const localScriptReg = /V([\d]+)_/ig;
    const localSourceName: string = getDefaultLatestCoreName('air101');
    const localScriptVersion: string | undefined = getLocalLatestSourceVersion(localScriptReg, localSourceName);
    const remoteScriptReg = /V([\d]+)\.zip/ig;
    const apiName: string = '101_lua_lod';
    const remoteScriptVersion: string | undefined = await getRemoteScriptVersion(remoteScriptReg, apiName);
    // console.log(localScriptVersion,remoteScriptVersion);
    const checkAir101UpdateState: boolean | undefined = checkUpdateState(localScriptVersion, remoteScriptVersion);
    return checkAir101UpdateState;
}

/*
*检查air103是否有更新
*@returns checkAir103UpdateState air103资源更新状态 true:固件有更新,false:固件没有更新
*/
async function checkAir103SourceUpdate() {
    const localScriptReg = /V([\d]+)_/ig;
    const localSourceName: string = getDefaultLatestCoreName('air103');
    const localScriptVersion: string | undefined = getLocalLatestSourceVersion(localScriptReg, localSourceName);
    const remoteScriptReg = /V([\d]+)\.zip/ig;
    const apiName: string = '103_lua_lod';
    const remoteScriptVersion: string | undefined = await getRemoteScriptVersion(remoteScriptReg, apiName);
    // console.log(localScriptVersion,remoteScriptVersion);
    const checkAir103UpdateState: boolean | undefined = checkUpdateState(localScriptVersion, remoteScriptVersion);
    return checkAir103UpdateState;
}

/*
*检查air105是否有更新
*@returns checkAir105UpdateState air105资源更新状态 true:固件有更新,false:固件没有更新
*/
async function checkAir105SourceUpdate() {
    const localScriptReg = /V([\d]+)_/ig;
    const localSourceName: string =  getDefaultLatestCoreName('air105');
    const localScriptVersion: string | undefined = getLocalLatestSourceVersion(localScriptReg, localSourceName);
    const remoteScriptReg = /V([\d]+)\.zip/ig;
    const apiName: string = '105_lua_lod';
    const remoteScriptVersion: string | undefined = await getRemoteScriptVersion(remoteScriptReg, apiName);
    return checkUpdateState(localScriptVersion, remoteScriptVersion);
}

/*
*检查esp32c3是否有更新
*@returns checkEsp32c3UpdateState Esp32c3资源更新状态 true:固件有更新,false:固件没有更新
*/
async function checkEsp32c3SourceUpdate() {
    const localScriptReg = /V([\d]+)_/ig;
    const localSourceName: string =  getDefaultLatestCoreName('esp32c3');
    const localScriptVersion: string | undefined = getLocalLatestSourceVersion(localScriptReg, localSourceName);
    const remoteScriptReg = /V([\d]+)\.zip/ig;
    const apiName: string = 'esp32c3_lua_lod';
    const remoteScriptVersion: string | undefined = await getRemoteScriptVersion(remoteScriptReg, apiName);
    return checkUpdateState(localScriptVersion, remoteScriptVersion);
}

/*
*检查air72xcx是否有更新
*@returns checkEsp32c3UpdateState air72xcx资源更新状态 true:固件有更新,false:固件没有更新
*/
async function checkair72xcxSourceUpdate(){
    const localScriptReg = /V([\d]+)_/ig;
    const air72XCXModuleModelName = getAir72XCXModuleModelName();
    const localSourceName: string = getDefaultLatestCoreName(air72XCXModuleModelName);
    const localScriptVersion: string | undefined = getLocalLatestSourceVersion(localScriptReg, localSourceName);
    const remoteScriptReg = /V([\d]+)\.zip/ig;
    const apiName: string = '1603_lua_lod';
    const remoteScriptVersion: string | undefined = await getRemoteScriptVersion(remoteScriptReg, apiName);
    return checkUpdateState(localScriptVersion, remoteScriptVersion);
}

/*
*检查服务器是否有新的版本更新，通过输入本地资源版本号及远端资源版本号进行比对
*@param localSourceVersion 本地资源版本号
*@param remoteSourceVersion 远端资源版本号
*@returns true:固件有更新,false:固件没有更新
*/
function checkUpdateState(localSourceVersion: string | undefined, remoteSourceVersion: string | undefined) {
    if (remoteSourceVersion === undefined) {
        console.log('Check the server update failed');
        return undefined;
    }
    else if (localSourceVersion === undefined) {
        return true;
    }
    else if (remoteSourceVersion > localSourceVersion) {
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
async function getRemoteScriptVersion(reg: any, apiName: string) {
    const interfaceUrl: string = 'https://luatos.com/api/luatools/files';
    const jsonObj: any = await getSourceHubJsonObj(interfaceUrl);
    if (jsonObj === undefined) {
        return undefined;
    }
    const versionRegResultArray = reg.exec(jsonObj[apiName]);
    if (versionRegResultArray === null) {
        return undefined;
    }
    const remoteSourceVersion: string = versionRegResultArray[1];
    return remoteSourceVersion;
}

/*
*获取本地最新资源版本名称，通过指定的正则表达式的规则表达式及解析字符串名称处理得到
*@param reg 正则表达式将要解析过滤的规则表达式
*@param apiName 从api接口的json对象中将要获取的名称
*@returns remoteScriptVersion 解析后的远端最新版本名称
*/
function getLocalLatestSourceVersion(reg: any, localSourcePath: string) {
    const versionRegResultArray = reg.exec(localSourcePath);
    if (versionRegResultArray === null) {
        return undefined;
    }
    const localSourceVersion: string = versionRegResultArray[1];
    return localSourceVersion;
}

/*
*下载指定url的zip压缩文件到指定的本地目录
*@param url 远端指定的url接口
*@param filePath 存储到本地的目录位置
*/
async function download(url: any, filePath: any) {
    let headers: any = {};
    headers['Content-Type'] = 'application/x-zip-compressed';
    await fetch(url, {
        method: 'GET',
        headers: headers,
    }).then(res => res.buffer()).then(_ => {
        fs.writeFileSync(filePath, _, 'binary');
    }).catch(error => console.log(error));;
}

/*
*解压缩指定路径的zip文件到目的路径
*@param srcPath ZIP文件所在的源路径
*@param distPath 解压到的指定目的路径 
*/
async function unzip(srcPath: any, distPath: any) {
    // await compressing.zip.uncompress(srcPath, distPath, { zipFileNameEncoding: 'gbk' })
    //     .then(() => {
    //         console.log('unzip', 'success');
    //     })
    //     .catch(err => {
    //         console.error('unzip', err);
    //     });
    const unzipToolPath:string  = getUnzipToolPath();
    // 7z解压缩命令
    const cmdStr = "\""+ unzipToolPath+"\" " + ' x ' + "\"" + srcPath + "\" "  + '-o' + "\"" + distPath + "\"" + ' -aos';
    await childProcess.execSync(cmdStr);
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
        console.log('The given path does not exist, please give the correct path');
    }
}

/*
*提示用户更新信息，进行信息交互若用户选择更新则执行更新操作流程
*@param downloadReadyHint 准备下载用户提示信息
*@param downloadingHint 下载过程中用户提示信息
*@param updateFunction 具体的下载函数名称
*/
// async function updateHintForUser(downloadReadyHint: string, downloadingHint: string, updateFunction: any) {
//     await vscode.window.showInformationMessage(downloadReadyHint, { modal: true }, '是').then(async result => {
//         if (result !== undefined) {
//             await updateProgressView(result, downloadingHint, updateFunction);
//         }
//     });
// }

/*
*提示用户更新信息，进行信息交互若用户选择更新则执行更新操作流程
*@param result 用户选择的信息
*@param downloadReadyHint 用户提示信息
*@param updateFunction 具体的下载函数名称
*/
export async function updateProgressView(result: string, downloadingHint: string, updateFunction: any) {
    const interfaceUrl = 'https://luatos.com/api/luatools/files';
    const sourceBasePath: string = 'http://cdndownload.openluat.com/Luat_tool_src/v2tools/';
    const jsonObj: any = await getSourceHubJsonObj(interfaceUrl);
    if (jsonObj === undefined) {
        return undefined;
    }
    if (result === 'Yes') {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: downloadingHint,
            cancellable: true,
        }, async (progress, token) => {
            token.onCancellationRequested(() => {
                console.log('The user canceled the update');
            });
            progress.report({ increment: 0, message: 'Updating...' });
            progress.report({ increment: 10, message: 'Updating...' });
            await updateFunction(jsonObj, sourceBasePath);
            setTimeout(() => {
                progress.report({ increment: 50, message: 'Updating...' });
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
function getTempSavePath(apiName: string) {
    const luatideDataPath: string = getLuatIDEDataPath();
    const tempSavePath: string = path.join(luatideDataPath, 'temp');
    const apiNameTempSavePath: string = path.join(tempSavePath, apiName);
    if (!fs.existsSync(tempSavePath)) {
        fs.mkdirSync(tempSavePath);
    }
    if (!fs.existsSync(path.join(luatideDataPath, 'temp', apiName))) {
        fs.mkdirSync(path.join(luatideDataPath, 'temp', apiName));
    }
    return apiNameTempSavePath;
}

/*
*从远端服务器拉取air72XUX的demo和lib
*@param jsonObj 从远端服务器获取到的资源名称json数据对象
*@param sourceBaseUrl 远端资源基础url
*/
export async function pullAir72XUXScript(jsonObj: any, sourceBaseUrl: string) {
    let sourceAbsloutePath: string = path.join(sourceBaseUrl, '8910_script', jsonObj['8910_script']);
    const air72XUXScriptSourceTempPath: string = getTempSavePath('8910_script');
    const sourceDistPath: string = path.join(air72XUXScriptSourceTempPath, jsonObj['8910_script']);
    await download(sourceAbsloutePath, sourceDistPath);
    await unzip(sourceDistPath, air72XUXScriptSourceTempPath);
    await air72XUXLibHandle(path.join(air72XUXScriptSourceTempPath, 'lib'), jsonObj['8910_script']);
    await air72XUXDemoHandle(path.join(air72XUXScriptSourceTempPath, 'demo'), jsonObj['8910_script']);
    await deleteFolderRecursive(air72XUXScriptSourceTempPath);
}

/*
*从远端服务器拉取air72XCX的demo和lib
*@param jsonObj 从远端服务器获取到的资源名称json数据对象
*@param sourceBaseUrl 远端资源基础url
*/
export async function pullAir72XCXScript(jsonObj: any, sourceBaseUrl: string) {
    let sourceAbsloutePath: string = path.join(sourceBaseUrl, '8910_script', jsonObj['8910_script']);
    const air72XCXScriptSourceTempPath: string = getTempSavePath('8910_script');
    const sourceDistPath: string = path.join(air72XCXScriptSourceTempPath, jsonObj['8910_script']);
    await download(sourceAbsloutePath, sourceDistPath);
    await unzip(sourceDistPath, air72XCXScriptSourceTempPath);
    await air72XCXLibHandle(path.join(air72XCXScriptSourceTempPath, 'lib'), jsonObj['8910_script']);
    await air72XCXDemoHandle(path.join(air72XCXScriptSourceTempPath, 'demo'), jsonObj['8910_script']);
    await deleteFolderRecursive(air72XCXScriptSourceTempPath);
}

/*
*从远端服务器拉取air72XUX的core
*@param jsonObj 从远端服务器获取到的资源名称json数据对象
*@param sourceBaseUrl 远端资源基础url
*/
export async function pullAir72XUXCore(jsonObj: any, sourceBaseUrl: string) {
    let sourceAbsloutePath: string = path.join(sourceBaseUrl, '8910_lua_lod', jsonObj['8910_lua_lod']);
    const air72XUXCoreSourceTempPath: string = getTempSavePath('8910_lua_lod');
    const sourceDistPath: string = path.join(air72XUXCoreSourceTempPath, jsonObj['8910_lua_lod']);
    await download(sourceAbsloutePath, sourceDistPath);
    await unzip(sourceDistPath, air72XUXCoreSourceTempPath);
    air72XUXCoreHandle(air72XUXCoreSourceTempPath);
    await deleteFolderRecursive(air72XUXCoreSourceTempPath);
}

/*
*从远端服务器拉取air72XCX的core
*@param jsonObj 从远端服务器获取到的资源名称json数据对象
*@param sourceBaseUrl 远端资源基础url
*/
export async function pullAir72XCXCore(jsonObj: any, sourceBaseUrl: string) {
    let sourceAbsloutePath: string = path.join(sourceBaseUrl, '1603_lua_lod', jsonObj['1603_lua_lod']);
    const air72XCXCoreSourceTempPath: string = getTempSavePath('1603_lua_lod');
    const sourceDistPath: string = path.join(air72XCXCoreSourceTempPath, jsonObj['1603_lua_lod']);
    await download(sourceAbsloutePath, sourceDistPath);
    await unzip(sourceDistPath, air72XCXCoreSourceTempPath);
    air72XCXCoreHandle(air72XCXCoreSourceTempPath);
    await deleteFolderRecursive(air72XCXCoreSourceTempPath);
}

/*
*从远端服务器拉取air101的资源
*@param jsonObj 从远端服务器获取到的资源名称json数据对象
*@param sourceBaseUrl 远端资源基础url
*/
export async function pullAir101Source(jsonObj: any, sourceBaseUrl: string) {
    let sourceAbsloutePath: string = path.join(sourceBaseUrl, '101_lua_lod', jsonObj['101_lua_lod']);
    const air101CoreSourceTempPath: string = getTempSavePath('101_lua_lod');
    const sourceDistPath: string = path.join(air101CoreSourceTempPath, jsonObj['101_lua_lod']);
    await download(sourceAbsloutePath, sourceDistPath);
    await unzip(sourceDistPath, air101CoreSourceTempPath);
    const demoDistPath: string = getAir101DefaultDemoPath();
    if (!fs.existsSync(demoDistPath)) {
        fs.mkdirSync(demoDistPath);
    }
    air101DemoHandle(path.join(air101CoreSourceTempPath, 'demo'), demoDistPath);
    air101CoreHandle(air101CoreSourceTempPath);
    await deleteFolderRecursive(air101CoreSourceTempPath);
}

/*
*从远端服务器拉取air103的资源
*@param jsonObj 从远端服务器获取到的资源名称json数据对象
*@param sourceBaseUrl 远端资源基础url
*/
export async function pullAir103Source(jsonObj: any, sourceBaseUrl: string) {
    let sourceAbsloutePath: string = path.join(sourceBaseUrl, '103_lua_lod', jsonObj['103_lua_lod']);
    const air103CoreSourceTempPath: string = getTempSavePath('103_lua_lod');
    const sourceDistPath: string = path.join(air103CoreSourceTempPath, jsonObj['103_lua_lod']);
    await download(sourceAbsloutePath, sourceDistPath);
    await unzip(sourceDistPath, air103CoreSourceTempPath);
    const demoDistPath: string = getAir103DefaultDemoPath();
    if (!fs.existsSync(demoDistPath)) {
        fs.mkdirSync(demoDistPath);
    }
    air103DemoHandle(path.join(air103CoreSourceTempPath, 'demo'), demoDistPath);
    air103CoreHandle(air103CoreSourceTempPath);
    await deleteFolderRecursive(air103CoreSourceTempPath);
}

/*
*从远端服务器拉取air105的资源
*@param jsonObj 从远端服务器获取到的资源名称json数据对象
*@param sourceBaseUrl 远端资源基础url
*/
export async function pullAir105Source(jsonObj: any, sourceBaseUrl: string) {
    let sourceAbsloutePath: string = path.join(sourceBaseUrl, '105_lua_lod', jsonObj['105_lua_lod']);
    const coreSourceTempPath: string = getTempSavePath('105_lua_lod');
    const sourceDistPath: string = path.join(coreSourceTempPath, jsonObj['105_lua_lod']);
    await download(sourceAbsloutePath, sourceDistPath);
    await unzip(sourceDistPath, coreSourceTempPath);
    if (fs.existsSync(path.join(coreSourceTempPath, 'demo'))) {
        const demoDistPath: string = getAir105DefaultDemoPath();
        if (!fs.existsSync(demoDistPath)) {
            fs.mkdirSync(demoDistPath);
        }
        air105DemoHandle(path.join(coreSourceTempPath, 'demo'), demoDistPath);
    }
    air105CoreHandle(coreSourceTempPath);
    await deleteFolderRecursive(coreSourceTempPath);
}

/*
*从远端服务器拉取esp32的资源
*@param jsonObj 从远端服务器获取到的资源名称json数据对象
*@param sourceBaseUrl 远端资源基础url
*/
export async function pullEsp32c3Source(jsonObj: any, sourceBaseUrl: string) {
    let sourceAbsloutePath: string = path.join(sourceBaseUrl, 'esp32c3_lua_lod', jsonObj['esp32c3_lua_lod']);
    const coreSourceTempPath: string = getTempSavePath('esp32c3_lua_lod');
    const sourceDistPath: string = path.join(coreSourceTempPath, jsonObj['esp32c3_lua_lod']);
    await download(sourceAbsloutePath, sourceDistPath);
    await unzip(sourceDistPath, coreSourceTempPath);
    if (fs.existsSync(path.join(coreSourceTempPath, 'demo'))) {
        const demoDistPath: string = getEsp32c3DefaultDemoPath();
        if (!fs.existsSync(demoDistPath)) {
            fs.mkdirSync(demoDistPath);
        }
        esp32c3DemoHandle(path.join(coreSourceTempPath, 'demo'), demoDistPath);
    }
    esp32c3CoreHandle(coreSourceTempPath);
    await deleteFolderRecursive(coreSourceTempPath);
}

/*
*处理拉取到临时文件夹的air105固件 
*@param coreSourcePath air105固件资源临时存储路径
*/
function air105CoreHandle(coreSourcePath: string) {
    const coreDistPath: string = getAir105DefaultCorePath();
    if (!fs.existsSync(coreDistPath)) {
        fs.mkdirSync(coreDistPath);
    }
    const files = fs.readdirSync(coreSourcePath);
    files.forEach((fileName) => {
        const extname = path.extname(fileName);
        if (extname === '.soc') {
            fs.copyFileSync(path.join(coreSourcePath, fileName), path.join(coreDistPath, fileName));
        }
    });
}

/*
*处理拉取到临时文件夹的air105 demo
*@param coreSourcePath air105固件资源临时存储路径
*/
function air105DemoHandle(sourceDir: string, distDir: string) {
    const demoNameArray = fs.readdirSync(sourceDir);
    demoNameArray.forEach((demoName) => {
        if (fs.existsSync(path.join(sourceDir, demoName, 'Air105'))) {
            copyDir(path.join(sourceDir, demoName, 'Air105'), path.join(distDir, demoName));
        }
        else if (fs.existsSync(path.join(sourceDir, demoName, 'main.lua'))) {
            copyDir(path.join(sourceDir, demoName), path.join(distDir, demoName));
        }
    });
}

/*
*处理拉取到临时文件夹的esp32c3固件 
*@param coreSourcePath esp32c3固件资源临时存储路径
*/
function esp32c3CoreHandle(coreSourcePath: string) {
    const coreDistPath: string = getEsp32c3DefaultCorePath();
    if (!fs.existsSync(coreDistPath)) {
        fs.mkdirSync(coreDistPath);
    }
    const files = fs.readdirSync(coreSourcePath);
    files.forEach((fileName) => {
        const extname = path.extname(fileName);
        if (extname === '.soc') {
            fs.copyFileSync(path.join(coreSourcePath, fileName), path.join(coreDistPath, fileName));
        }
    });
}

/*
*处理拉取到临时文件夹的esp32c3 demo
*@param coreSourcePath esp32c3固件资源临时存储路径
*/
function esp32c3DemoHandle(sourceDir: string, distDir: string) {
    const demoNameArray = fs.readdirSync(sourceDir);
    demoNameArray.forEach((demoName) => {
        if (fs.existsSync(path.join(sourceDir, demoName, 'esp32'))) {
            copyDir(path.join(sourceDir, demoName, 'esp32'), path.join(distDir, demoName));
        }
        else if (fs.existsSync(path.join(sourceDir, demoName, 'main.lua'))) {
            copyDir(path.join(sourceDir, demoName), path.join(distDir, demoName));
        }
    });
}

/*
*处理拉取到临时文件夹的air103 DEMO 
*@param sourceDir air103 DEMO临时存储路径
*@param distDir air103 demo将要存储的路径
*/
function air103DemoHandle(sourceDir: string, distDir: string) {
    const demoNameArray = fs.readdirSync(sourceDir);
    demoNameArray.forEach((demoName) => {
        if (fs.existsSync(path.join(sourceDir, demoName, 'Air103'))) {
            copyDir(path.join(sourceDir, demoName, 'Air103'), path.join(distDir, demoName));
        }
        else if (fs.existsSync(path.join(sourceDir, demoName, 'main.lua'))) {
            copyDir(path.join(sourceDir, demoName), path.join(distDir, demoName));
        }
    });
}

/*
*处理拉取到临时文件夹的air103 固件
*@param coreSourcePath air103固件资源临时存储路径
*/
function air103CoreHandle(coreSourcePath: string) {
    const air103CoreDistPath: string = getAir103DefaultCorePath();
    if (!fs.existsSync(air103CoreDistPath)) {
        fs.mkdirSync(air103CoreDistPath);
    }
    const files = fs.readdirSync(coreSourcePath);
    files.forEach((fileName) => {
        const extname = path.extname(fileName);
        if (extname === '.soc') {
            fs.copyFileSync(path.join(coreSourcePath, fileName), path.join(air103CoreDistPath, fileName));
        }
    });
}

/*
*处理拉取到临时文件夹的air101 固件
*@param coreSourcePath air101固件资源临时存储路径
*/
function air101CoreHandle(coreSourcePath: string) {
    const air101CoreDistPath: string = getAir101DefaultCorePath();
    if (!fs.existsSync(air101CoreDistPath)) {
        fs.mkdirSync(air101CoreDistPath);
    }
    const files = fs.readdirSync(coreSourcePath);
    files.forEach((fileName) => {
        const extname = path.extname(fileName);
        if (extname === '.soc') {
            fs.copyFileSync(path.join(coreSourcePath, fileName), path.join(air101CoreDistPath, fileName));
        }
    });
}

/*
*处理拉取到临时文件夹的air101 DEMO 
*@param sourceDir air101 DEMO临时存储路径
*@param distDir air101 demo将要存储的路径
*/
function air101DemoHandle(sourceDir: string, distDir: string) {
    const demoNameArray = fs.readdirSync(sourceDir);
    demoNameArray.forEach((demoName) => {
        if (fs.existsSync(path.join(sourceDir, demoName, 'Air101'))) {
            copyDir(path.join(sourceDir, demoName, 'Air101'), path.join(distDir, demoName));
        }
        else if (fs.existsSync(path.join(sourceDir, demoName, 'main.lua'))) {
            copyDir(path.join(sourceDir, demoName), path.join(distDir, demoName));
        }
    });
}

/*
*处理拉取到临时文件夹的air72XUX 固件
*@param coreSourcePath air72XUX固件资源临时存储路径
*/
function air72XUXCoreHandle(coreSourcePath: string) {
    const air72XUXCoreDistPath: string = getAir72XUXDefaultCorePath();
    if (!fs.existsSync(air72XUXCoreDistPath)) {
        fs.mkdirSync(air72XUXCoreDistPath);
    }
    const files = fs.readdirSync(coreSourcePath);
    // console.log('=============3',files);
    files.forEach((fileName) => {
        const extname = path.extname(fileName);
        // console.log('==========4',extname);
        if (extname === '.pac') {
            fs.copyFileSync(path.join(coreSourcePath, fileName), path.join(air72XUXCoreDistPath, fileName));
        }
    });
}
/*
*处理拉取到临时文件夹的air72XCX 固件
*@param coreSourcePath air72XCX固件资源临时存储路径
*/
function air72XCXCoreHandle(coreSourcePath: string) {
    const air72XCXCoreDistPath: string = getAir72XCXDefaultCorePath();
    if (!fs.existsSync(air72XCXCoreDistPath)) {
        fs.mkdirSync(air72XCXCoreDistPath);
    }
    const files = fs.readdirSync(coreSourcePath);
    // console.log('=============3',files);
    files.forEach((fileName) => {
        const extname = path.extname(fileName);
        // console.log('==========4',extname);
        if (extname === '.zip' && fileName.startsWith('LuatOS-Air')) {
            fs.copyFileSync(path.join(coreSourcePath, fileName), path.join(air72XCXCoreDistPath, fileName));
        }
    });
}
/*
*处理拉取到临时文件夹的air72XUX DEMO 
*@param sourceDir air72XUX DEMO临时存储路径
*@param distDir air72XUX demo将要存储的路径
*/
function air72XUXDemoHandle(demoSourcePath: string, demoName: string) {
    const reg = /.*?(V[\d\.]+?)\.zip/ig;
    let demoVersionArray: any = reg.exec(demoName);
    if (demoVersionArray === null) {
        return;
    }
    const demoVersion: string = demoVersionArray[1];
    const air72XUXDemoPath: string = getAir72XUXDefaultDemoPath();
    if (!fs.existsSync(air72XUXDemoPath)) {
        fs.mkdirSync(air72XUXDemoPath);
    }
    const demoDistPath: string = path.join(air72XUXDemoPath, demoVersion);
    if (!fs.existsSync(demoDistPath)) {
        fs.mkdirSync(demoDistPath);
    }
    air72XUXDemoParse(demoSourcePath, demoDistPath);
}

/*
*处理拉取到临时文件夹的air72XCX DEMO 
*@param sourceDir air72XUX DEMO临时存储路径
*@param distDir air72XUX demo将要存储的路径
*/
function air72XCXDemoHandle(demoSourcePath: string, demoName: string) {
    const reg = /.*?(V[\d\.]+?)\.zip/ig;
    let demoVersionArray: any = reg.exec(demoName);
    if (demoVersionArray === null) {
        return;
    }
    const demoVersion: string = demoVersionArray[1];
    const air72XCXDemoPath: string = getAir72XCXDefaultDemoPath();
    if (!fs.existsSync(air72XCXDemoPath)) {
        fs.mkdirSync(air72XCXDemoPath);
    }
    const demoDistPath: string = path.join(air72XCXDemoPath, demoVersion);
    if (!fs.existsSync(demoDistPath)) {
        fs.mkdirSync(demoDistPath);
    }
    air72XUXDemoParse(demoSourcePath, demoDistPath);
}

/*
*处理拉取到临时文件夹的air72XUX DEMO 
*@param sourceDir air72XUX DEMO临时存储路径
*@param distDir air72XUX demo将要存储的路径
*/
function air72XUXDemoParse(sourceDir: string, distDir: string) {
    const demoNameArray = fs.readdirSync(sourceDir);
    demoNameArray.forEach((demoName) => {
        const demoMainLuaPath: string = path.join(sourceDir, demoName, 'main.lua');
        if (fs.existsSync(demoMainLuaPath)) {
            copyDir(path.join(sourceDir, demoName), path.join(distDir, demoName));
        }
    });

}

/*
*处理拉取到临时文件夹的air72XUX LIB 
*@param sourceDir air72XUX LIB临时存储路径
*@param distDir air72XUX LIB将要存储的路径
*/
function air72XUXLibHandle(libSourcePath: string, libName: string) {
    const reg = /.*?(V[\d\.]+?)\.zip/ig;
    let libVersionArray: any = reg.exec(libName);
    if (libVersionArray === null) {
        return;
    }
    const libVersion: string = libVersionArray[1];
    const air72XUXLibPath: string = getAir72XUXDefaultLibPath();
    if (!fs.existsSync(air72XUXLibPath)) {
        fs.mkdirSync(air72XUXLibPath);
    }
    if (!fs.existsSync(path.join(air72XUXLibPath, libVersion))) {
        fs.mkdirSync(path.join(air72XUXLibPath, libVersion));
    }
    const libDistPath: string = path.join(air72XUXLibPath, libVersion, 'lib');
    copyDir(libSourcePath, libDistPath);
}

/*
*处理拉取到临时文件夹的air72XUX LIB 
*@param sourceDir air72XUX LIB临时存储路径
*@param distDir air72XUX LIB将要存储的路径
*/
function air72XCXLibHandle(libSourcePath: string, libName: string) {
    const reg = /.*?(V[\d\.]+?)\.zip/ig;
    let libVersionArray: any = reg.exec(libName);
    if (libVersionArray === null) {
        return;
    }
    const libVersion: string = libVersionArray[1];
    const air72XCXLibPath: string = getAir72XCXDefaultLibPath();
    if (!fs.existsSync(air72XCXLibPath)) {
        fs.mkdirSync(air72XCXLibPath);
    }
    if (!fs.existsSync(path.join(air72XCXLibPath, libVersion))) {
        fs.mkdirSync(path.join(air72XCXLibPath, libVersion));
    }
    const libDistPath: string = path.join(air72XCXLibPath, libVersion, 'lib');
    copyDir(libSourcePath, libDistPath);
}

/*
*检查插件资源更新状态并对已安装资源默认自动更新
*/
export async function sourceAutoUpdate(resourceId: string) {
    let downloadingHint;
    switch (resourceId) {
        case "8910_script":
            const air72XUXSourceUpdateState = await checkAir72XUXScriptUpdate();
            console.log("8910_Script update status:", air72XUXSourceUpdateState);
            if (air72XUXSourceUpdateState) {
                downloadingHint = 'Downloading the latest Air72xux/Air82xux DEMO and lib file for you. Please wait patiently';
                updateProgressView("Yes", downloadingHint, pullAir72XUXScript);
            }
            break;
        case "8910_lua_lod":
            const air72XUXCoreUpdateState = await checkAir72XUXCoreUpdate();
            console.log("8910_LUA_LODT update status:", air72XUXCoreUpdateState);
            if (air72XUXCoreUpdateState) {
                downloadingHint = 'Downloading the latest Air72xux/Air82xux firmware for you, please wait patiently';
                await updateProgressView("Yes", downloadingHint, pullAir72XUXCore);
            }
            break;
        case "1603_script":
            const air72XCXSourceUpdateState = await checkAir72XCXScriptUpdate();
            console.log("1603_script update status:", air72XCXSourceUpdateState);
            if (air72XCXSourceUpdateState) {
                downloadingHint = 'Downloading the latest Air72xcx DEMO and LIB file for you, please wait patiently';
                updateProgressView("Yes", downloadingHint, pullAir72XCXScript);
            }
            break;
        case "1603_lua_lod":
            const air72xcxState = await checkair72xcxSourceUpdate();
            console.log("1603_LUA_LOD update status:", air72xcxState);
            if (air72xcxState) {
                downloadingHint = 'Downloading the latest Air72xcx firmware file for you, please wait patiently';
                updateProgressView("Yes", downloadingHint, pullAir72XCXCore);
            }
            break;
        case "101_lua_lod":
            const air101SourceState = await checkAir101SourceUpdate();
            console.log("101_LUA_LOD update status:", air101SourceState);
            if (air101SourceState) {
                downloadingHint = 'Downloading drawing the latest Air101 resource file for you, please wait patiently';
                updateProgressView("Yes", downloadingHint, pullAir101Source);
            }
            break;
        case "103_lua_lod":
            const air103SourceState = await checkAir103SourceUpdate();
            console.log("103_LUA_LOD update status:", air103SourceState);
            if (air103SourceState) {
                downloadingHint = 'Downloading the latest Air103 resource file for you, please wait patiently';
                updateProgressView("Yes", downloadingHint, pullAir103Source);
            }
            break;
        case "105_lua_lod":
            const air105SourceState = await checkAir105SourceUpdate();
            console.log("105_LUA_LOD update status:", air105SourceState);
            if (air105SourceState) {
                downloadingHint = 'Downloading the latest Air105 resource file for you, please wait patiently';
                updateProgressView("Yes", downloadingHint, pullAir105Source);
            }
            break;
        case "esp32c3_lua_lod":
            const esp32c3SourceState = await checkEsp32c3SourceUpdate();
            console.log("ESP32C3_lua_Lod update status:", esp32c3SourceState);
            if (esp32c3SourceState) {
                downloadingHint = 'Downloading the latest ESP32C3 resource file for you, please wait patiently';
                updateProgressView("Yes", downloadingHint, pullEsp32c3Source);
            }
            break;
        case "UI designer":
            getUiDesignCode();
            break;
        case "NDK":
            getNdkCode();
            break;
        default:
            break;
    }
}

/*
// *检查插件资源更新状态
// */
// export async function checkSourceUpdate() {
//     const air72XUXSourceUpdateState = await checkAir72XUXScriptUpdate();
//     console.log(air72XUXSourceUpdateState);
//     if (air72XUXSourceUpdateState) {
//         const downloadReadyHint: string = '检测到air72XUX/air82XUX的DEMO及Lib文件有更新,是否更新？';
//         const downloadingHint: string = '正在为您拉取最新air72XUX/air82XUX的DEMO及Lib文件,请耐心等待';
//         updateHintForUser(downloadReadyHint, downloadingHint, pullAir72XUXScript);
//     }
//     const air72XUXCoreUpdateState = await checkAir72XUXCoreUpdate();
//     console.log(air72XUXCoreUpdateState);
//     if (air72XUXCoreUpdateState) {
//         const downloadReadyHint: string = '检测到air72XUX/air82XUX固件有更新,是否更新？';
//         const downloadingHint: string = '正在为您拉取最新air72XUX/air82XUX固件,请耐心等待';
//         updateHintForUser(downloadReadyHint, downloadingHint, pullAir72XUXCore);
//     }
//     const air101SourceState = await checkAir101SourceUpdate();
//     console.log(air101SourceState);
//     if (air101SourceState) {
//         const downloadReadyHint: string = '检测到air101资源文件有更新,是否更新？';
//         const downloadingHint: string = '正在为您拉取最新air101资源文件,请耐心等待';
//         updateHintForUser(downloadReadyHint, downloadingHint, pullAir101Source);

//     }
//     const air103SourceState = await checkAir103SourceUpdate();
//     console.log(air103SourceState);
//     if (air103SourceState) {
//         const downloadReadyHint: string = '检测到air103的资源文件有更新,是否更新？';
//         const downloadingHint: string = '正在为您拉取最新air103资源文件,请耐心等待';
//         updateHintForUser(downloadReadyHint, downloadingHint, pullAir103Source);
//     }
//     const air105SourceState = await checkAir105SourceUpdate();
//     console.log(air105SourceState);
//     if (air105SourceState) {
//         const downloadReadyHint: string = '检测到air105的资源文件有更新,是否更新？';
//         const downloadingHint: string = '正在为您拉取最新air105资源文件,请耐心等待';
//         updateHintForUser(downloadReadyHint, downloadingHint, pullAir105Source);
//     }

//     const esp32c3SourceState = await checkEsp32c3SourceUpdate();
//     console.log(esp32c3SourceState);
//     if (esp32c3SourceState) {
//         const downloadReadyHint: string = '检测到Esp32C3的资源文件有更新,是否更新？';
//         const downloadingHint: string = '正在为您拉取最新Esp32C3资源文件,请耐心等待';
//         updateHintForUser(downloadReadyHint, downloadingHint, pullEsp32c3Source);
//     }

//     const air72xcxState = await checkair72xcxSourceUpdate();
//     console.log(air72xcxState);
//     if (air72xcxState) {
//         const downloadReadyHint: string = '检测到air72XCX的资源文件有更新,是否更新？';
//         const downloadingHint: string = '正在为您拉取最新air72XCX资源文件,请耐心等待';
//         updateHintForUser(downloadReadyHint, downloadingHint, pullAir72XCXCore);
//     }
//     const air72XCXSourceUpdateState = await checkAir72XCXScriptUpdate();
//     console.log(air72XCXSourceUpdateState);
//     if (air72XCXSourceUpdateState) {
//         const downloadReadyHint: string = '检测到air72XCX的DEMO及Lib文件有更新,是否更新？';
//         const downloadingHint: string = '正在为您拉取最新air72XCX的DEMO及Lib文件,请耐心等待';
//         updateHintForUser(downloadReadyHint, downloadingHint, pullAir72XCXScript);
//     }
// }
// checkSourceUpdate();