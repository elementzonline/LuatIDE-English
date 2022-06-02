import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import {SerialPort} from 'serialport';

/*++++++++++++++++++++++++++++++++++++++插件扩展信息相关接口+++++++++++++++++++++++++++++++++++++++++++++*/ 
// 获取用户扩展路径
let extensionPath: any = path.join(__dirname, '../.');

// 获取用户当前插件安装版本号名称
export function getPluginInstallVersion(){
    const pluginInstallVersion = vscode.extensions.getExtension('luater.luatide')!.packageJSON.version;
    return pluginInstallVersion;
};

// 获取插件支持的模块列表
export function getPluginDefaultModuleList() {
    const air72XCXModuleModelName = getAir72XCXModuleModelName();
    const moduleList: string[] = ["air72XUX/air82XUX", air72XCXModuleModelName, "air101", "air103", "air105", "esp32c3"];
    return moduleList;
}

// 获取插件支持的air系列模块列表
export function getPluginAirModuleList() {
    const air72XCXModuleModelName = getAir72XCXModuleModelName();
    const moduleList: string[] = ["air72XUX/air82XUX", air72XCXModuleModelName];
    return moduleList;
}

// 获取插件支持的soc系列模块列表
export function getPluginSocModuleList() {
    const moduleList: string[] = ["air101", "air103", "air105", "esp32c3"];
    return moduleList;
}


/*--------------------------------------插件扩展信息相关接口---------------------------------------------/ 

/*++++++++++++++++++++++++++++++++++++++插件数据存储路径相关接口++++++++++++++++++++++++++++++++++++++++*/ 
// 获取数据存储路径
let appDataPath: any = process.env['APPDATA'];

//获取用户APPDATA路径
export function getAppDataPath() {
    const appDataPath: any = process.env['APPDATA'];
    return appDataPath;
}

//获取用户LuatIDE数据存储路径
export function getLuatIDEDataPath() {
    const plugDataPath: any = path.join(appDataPath, 'LuatIDE');
    return plugDataPath;
}

// 获取用户默认工程工作空间存储路径
export function getDefaultWorkspacePath() {
    const defaultProjectWorkspacePath:string = path.join(appDataPath,'LuatIDE','LuatideWorkspace');
    return defaultProjectWorkspacePath;
}

// 获取用户历史lib库存储路径
export function getHistoryLibPath() {
    const historyLibpath: any = path.join(appDataPath, 'LuatIDE', 'LuatideLib');
    return historyLibpath;
}

// 获取用户历史demo存储路径
export function getHistoryDemoPath() {
    const historyDemopath: any = path.join(appDataPath, 'LuatIDE', 'LuatideDemo');
    return historyDemopath;
}

// 获取用户历史core存储路径
export function getHistoryCorePath() {
    const historyCorePath: any = path.join(appDataPath, 'LuatIDE', 'LuatideCore');
    return historyCorePath;
}

//获取用户插件配置文件路径
export function getPluginConfigPath() {
    const pluginConfigPath: string = path.join(appDataPath, 'LuatIDE', 'luatide_workspace.json');
    return pluginConfigPath;
}

// 获取用户uuid数据存储路径
export function getUserUUIDPath() {
    const uuidPath:string = path.join(appDataPath, 'LuatIDE', 'uuid.txt');
    return uuidPath;
}

/*++++++++++++++++++++++++++++++++++++++Air72XUX数据存储路径相关接口++++++++++++++++++++++++++++++++++++++++*/ 
// 获取Air72XUX默认demo存储路径
export function getAir72XUXDefaultDemoPath() {
    const air72XUXDefaultDemoPath: string = path.join(appDataPath, "LuatIDE", "LuatideDemo", "Air72XUX_Demo");
    return air72XUXDefaultDemoPath;
}

// 获取72XUX默认core文件存储路径
export function getAir72XUXDefaultCorePath() {
    const air72XUXDefaultCorePath: string = path.join(appDataPath, "LuatIDE", "LuatideCore", "Air72XUX_CORE");
    return air72XUXDefaultCorePath;
}

// 获取Air72XUX默认lib库存储路径
export function getAir72XUXDefaultLibPath() {
    const air72XUXDefaultLibPath: string = path.join(appDataPath, "LuatIDE", "LuatideLib", "Air72XUX_LIB");
    return air72XUXDefaultLibPath;
}
/*--------------------------------------Air72XUX数据存储路径相关接口----------------------------------------*/ 

/*++++++++++++++++++++++++++++++++++++++Air72XCX数据存储路径相关接口++++++++++++++++++++++++++++++++++++++++*/ 
// Air72XCX的demo及lib共用Air72XUX

// 获取72XCX默认core文件存储路径
export function getAir72XCXDefaultCorePath() {
    const air72XCXDefaultCorePath: string = path.join(appDataPath, "LuatIDE", "LuatideCore", "Air72XCX_CORE");
    return air72XCXDefaultCorePath;
}

// 获取air72XCX系列模块型号显示名称(对后面增加的同系列模块型号名称进行扩展)
export function getAir72XCXModuleModelName(){
    const moduleModelName:string = "air72XCX/air60XCX/air78XCX";
    return moduleModelName;
}

/*--------------------------------------Air72XCX数据存储路径相关接口----------------------------------------*/ 

/*++++++++++++++++++++++++++++++++++++++air101数据存储路径相关接口++++++++++++++++++++++++++++++++++++++++*/ 
// 获取101默认core文件存储路径
export function getAir101DefaultCorePath() {
    const air101DefaultCorePath: string = path.join(appDataPath, "LuatIDE", "LuatideCore", "Air101_CORE");
    return air101DefaultCorePath;
}

// 获取air101默认demo存储路径
export function getAir101DefaultDemoPath() {
    const air101DefaultDemoPath: string = path.join(appDataPath, "LuatIDE", "LuatideDemo", "Air101_Demo");
    return air101DefaultDemoPath;
}
/*--------------------------------------air101数据存储路径相关接口----------------------------------------*/ 

/*++++++++++++++++++++++++++++++++++++++air103数据存储路径相关接口++++++++++++++++++++++++++++++++++++++++*/ 
// 获取103默认core文件存储路径
export function getAir103DefaultCorePath() {
    const air103DefaultCorePath: string = path.join(appDataPath, "LuatIDE", "LuatideCore", "Air103_CORE");
    return air103DefaultCorePath;
}

// 获取air103默认demo存储路径
export function getAir103DefaultDemoPath() {
    const air103DefaultDemoPath: string = path.join(appDataPath, "LuatIDE", "LuatideDemo", "Air103_Demo");
    return air103DefaultDemoPath;
}
/*--------------------------------------air103数据存储路径相关接口----------------------------------------*/ 

/*++++++++++++++++++++++++++++++++++++++air105数据存储路径相关接口++++++++++++++++++++++++++++++++++++++++*/ 
// 获取105默认core文件存储路径
export function getAir105DefaultCorePath() {
    const defaultCorePath: string = path.join(appDataPath, "LuatIDE", "LuatideCore", "Air105_CORE");
    return defaultCorePath;
}

// 获取air105默认demo存储路径
export function getAir105DefaultDemoPath() {
    const defaultDemoPath: string = path.join(appDataPath, "LuatIDE", "LuatideDemo", "Air105_Demo");
    return defaultDemoPath;
}
/*--------------------------------------air105数据存储路径相关接口----------------------------------------*/ 

/*++++++++++++++++++++++++++++++++++++++Esp32C3数据存储路径相关接口++++++++++++++++++++++++++++++++++++++++*/ 
// 获取esp32c3默认core文件存储路径
export function getEsp32c3DefaultCorePath() {
    const defaultCorePath: string = path.join(appDataPath, "LuatIDE", "LuatideCore", "ESP32C3_CORE");
    return defaultCorePath;
}

// 获取ESP32C3默认demo存储路径
export function getEsp32c3DefaultDemoPath() {
    const defaultDemoPath: string = path.join(appDataPath, "LuatIDE", "LuatideDemo", "ESP32C3_Demo");
    return defaultDemoPath;
}
/*--------------------------------------Esp32C3数据存储路径相关接口----------------------------------------*/ 

/*++++++++++++++++++++++++++++++++++++++NDK数据存储路径相关接口++++++++++++++++++++++++++++++++++++++++*/ 
// 获取NDK默认路径
export function getNdkDefaultPath(){
    const luatideDataPath:string = getLuatIDEDataPath();
    const ndkDefaultPath:string = path.join(luatideDataPath,'LuatideNdk');
    return ndkDefaultPath;
}

// 获取NDK默认最新demo路径
export function getNdkDefaultDemoPath(){
    const luatideDataPath:string = getLuatIDEDataPath();
    let ndkDefaultDemoPath:string = path.join(luatideDataPath,'LuatideNdk','example');
    if (!fs.existsSync(ndkDefaultDemoPath)) {
        ndkDefaultDemoPath = '';
    }
    return ndkDefaultDemoPath;
}
/*--------------------------------------NDK数据存储路径相关接口----------------------------------------*/ 

/*--------------------------------------插件数据存储路径相关接口----------------------------------------*/ 

/*++++++++++++++++++++++++++++++++++++++webview资源文件路径相关接口++++++++++++++++++++++++++++++++++++++++*/ 

/*++++++++++++++++++++++++++++++++++++++home界面资源文件路径相关接口++++++++++++++++++++++++++++++++++++++++*/ 
// 获取新闻api接口链接
export function getNewsApi() {
    const newsUrl = 'http://121.40.170.41:30050/api/site/hezhou_news';
    return newsUrl;
}

// 获取主页LuatIDE logo图标路径
export function getLogoPath() {
    const logoPath: string = path.join(extensionPath, 'resource', 'images', 'Luat_IDE.png');
    return logoPath;
}

// 获取home主页资源文件路径
export function getHomeSourcePath() {
    const projectSourcePath: string = path.join(extensionPath, 'src', 'webview', 'frontEnd', 'home');
    return projectSourcePath;
}

// 获取home主页html路径
export function getHomeHtmlPath() {
    const homeHtmlPath: string = path.join(extensionPath, 'src', 'webview', 'frontEnd', 'home', 'index.html');
    return homeHtmlPath;
}

/*--------------------------------------home界面资源文件路径相关接口----------------------------------------*/

/*++++++++++++++++++++++++++++++++++++++newProject界面资源文件路径相关接口++++++++++++++++++++++++++++++++++++++++*/
// 获取新建project主页资源文件路径
export function getProjectSourcePath() {
    const projectSourcePath: string = path.join(extensionPath, 'src', 'webview', 'frontEnd', 'newProject');
    return projectSourcePath;
}

// 获取新建project主页html按钮
export function getProjectHtmlPath() {
    const projectHtmlPath: string = path.join(extensionPath, 'src', 'webview', 'frontEnd', 'newProject', 'index.html');
    return projectHtmlPath;
}
/*--------------------------------------newProject界面资源文件路径相关接口----------------------------------------*/

/*++++++++++++++++++++++++++++++++++++++importProject界面资源文件路径相关接口++++++++++++++++++++++++++++++++++++++++*/
// 获取打开工程project资源文件路径
export function getOpenProjectSourcePath() {
    const projectSourcePath: string = path.join(extensionPath, 'src', 'webview', 'frontEnd', 'importProject');
    return projectSourcePath;
}

// 获取打开project主页html按钮
export function getOpenProjectHtmlPath() {
    const projectHtmlPath: string = path.join(extensionPath, 'src', 'webview', 'frontEnd', 'importProject', 'index.html');
    return projectHtmlPath;
}
/*--------------------------------------importProject界面资源文件路径相关接口----------------------------------------*/

/*++++++++++++++++++++++++++++++++++++++下载文件检测界面资源文件路径相关接口++++++++++++++++++++++++++++++++++++++++*/
// 获取下载配置界面资源文件路径
export function getDownloadSourcePath() {
    const projectSourcePath: string = path.join(extensionPath, 'src', 'webview', 'frontEnd', 'fileSystem');
    return projectSourcePath;
}

// 获取下载配置界面html路径
export function getDownloadHtmlPath() {
    const homeHtmlPath: string = path.join(extensionPath, 'src', 'webview', 'frontEnd', 'fileSystem', 'index.html');
    return homeHtmlPath;
}
/*--------------------------------------下载文件检测界面资源文件路径相关接口----------------------------------------*/

/*++++++++++++++++++++++++++++++++++++++活动工程界面资源文件路径相关接口++++++++++++++++++++++++++++++++++++++++*/
// 获取活动工程配置html资源路径
export function getActiveProjectHtmlPath() {
    const homeHtmlPath: string = path.join(extensionPath, 'src', 'webview', 'frontEnd', 'configActiveProject', 'index.html');
    return homeHtmlPath;
}
/*--------------------------------------活动工程配置界面资源文件路径相关接口----------------------------------------*/ 

/*++++++++++++++++++++++++++++++++++++++登录界面资源文件路径相关接口++++++++++++++++++++++++++++++++++++++++*/ 
// 获取luatide qq群二维码图标路径
export function getGroupChatQrCodePath() {
    const quCodePath:string = path.join(extensionPath, 'resource', 'images', 'qrcode.png');
    return quCodePath;
}

// 获取登录成功状态svg图标路径
export function getLoginSuccessPath() {
    const loginSuccessPath: string = path.join(extensionPath, 'webview', 'resource', 'loginSuccess.svg');
    return loginSuccessPath;
}

// 获取登录失败状态svg图标路径
export function getLoginFailedPath() {
    const loginFailedPath: string = path.join(extensionPath, 'webview', 'resource', 'loginFail.svg');
    return loginFailedPath;
}
/*--------------------------------------登录界面资源文件路径相关接口----------------------------------------*/ 

/*++++++++++++++++++++++++++++++++++++++串口监视器资源文件路径相关接口++++++++++++++++++++++++++++++++++++++++*/ 
// 获取串口监视器主页资源文件路径
export function getSerialPortMonitorSourcePath() {
    const projectSourcePath: string = path.join(extensionPath, 'src', 'webview', 'frontEnd', 'serialDebug');
    return projectSourcePath;
}

// 获取串口监视器html资源路径
export function getSerialPortMonitorHtmlPath(){
    const seriportMonitorHtmlPath:string = path.join(extensionPath, 'src', 'webview', 'frontEnd', 'serialDebug', 'index.html');
    return seriportMonitorHtmlPath;
}
/*--------------------------------------串口监视器资源文件路径相关接口----------------------------------------*/ 

/*--------------------------------------webview资源文件路径相关接口----------------------------------------*/ 

/*++++++++++++++++++++++++++++++++++++++UI设计器资源文件路径相关接口++++++++++++++++++++++++++++++++++++++++*/ 
// 获取ui设计器文件默认存储路径
export function getUiDesignDefaultPath() {
    const uiDesignDefaultPath:string = path.join(appDataPath,'LuatIDE','LuatideUiDesign');
    return uiDesignDefaultPath;
}

// 获取ui转码器文件夹存储路径
export function getUiConvertPath() {
    const uiConvertPath:string = path.join(extensionPath,'src','webview','UI-Converter');
    return uiConvertPath;
}

// 获取ui设计器文件夹存储路径
export function getUiDesignPath() {
    const uiDesignPath:string = path.join(extensionPath,'src','webview','UI-Designer');
    return uiDesignPath;
}
/*--------------------------------------UI设计器资源文件路径相关接口----------------------------------------*/ 

/**++++++++++++++++++++++++++++++++++++++固件版本名称正则解析相关接口++++++++++++++++++++++++++++++++++++++++*/ 
// 获取获取Air72XUX固件版本号正则解析表达式
export function getAir72XUXReg() {
    const reg = /LuatOS-\w{3}_V(\d+)_RDA8910/gi;
    return reg;
}

// 获取获取Air72XCX固件版本号正则解析表达式
export function getAir72XCXReg() {
    const reg = /LuatOS-\w{3}_V(\d+)_ASR1603/gi;
    return reg;
}

// 获取获取Air101固件版本号正则解析表达式
export function getAir101Reg() {
    const reg = /LuatOS-SoC_V(\d+)_AIR101/ig;
    return reg;
}

// 获取获取Air101固件版本号正则解析表达式
export function getAir103Reg() {
    const reg = /LuatOS-SoC_V(\d+)_AIR103/ig;
    return reg;
}

// 获取获取Air105固件版本号正则解析表达式
export function getAir105Reg() {
    const reg = /LuatOS-SoC_V(\d+)_AIR105/ig;
    return reg;
}

// 获取获取ESP32C3固件版本号正则解析表达式
export function getEsp32c3Reg() {
    const reg = /LuatOS-SoC_V(\d+)_ESP32C3/ig;
    return reg;
}

// 依据模块型号获取解析的正则表达式
export function getRegBaseModel(moduleModel: any) {
    const air72XCXModuleModelName = getAir72XCXModuleModelName();
    let reg: any;
    switch (moduleModel) {
        case 'air72XUX/air82XUX':
            reg = getAir72XUXReg();
            break;
        case air72XCXModuleModelName:
            reg = getAir72XCXReg();
            break;
        case 'air101':
            reg = getAir101Reg();
            break;
        case 'air103':
            reg = getAir103Reg();
            break;
        case 'air105':
            reg = getAir105Reg();
            break;
        case 'esp32c3':
            reg = getEsp32c3Reg();
            break;
    }
    return reg;
}
/*--------------------------------------固件版本名称正则解析相关接口----------------------------------------*/ 

/*++++++++++++++++++++++++++++++++++++++工程管理数据资源文件路径相关接口++++++++++++++++++++++++++++++++++++++++*/ 

/*++++++++++++++++++++++++++++++++++++++工程固件数据处理相关接口++++++++++++++++++++++++++++++++++++++++*/ 
// 依据模块型号获取core路径
export function getCorePathBaseModuleModel(moduleModel: any) {
    const air72XCXModuleModelName = getAir72XCXModuleModelName();
    let corePath: any;
    switch (moduleModel) {
        case 'air72XUX/air82XUX':
            corePath = getAir72XUXDefaultCorePath();
            break;
        case air72XCXModuleModelName:
            corePath = getAir72XCXDefaultCorePath();
            break;
        case 'air101':
            corePath = getAir101DefaultCorePath();
            break;
        case 'air103':
            corePath = getAir103DefaultCorePath();
            break;
        case 'air105':
            corePath = getAir105DefaultCorePath();
            break;
        case 'esp32c3':
            corePath = getEsp32c3DefaultCorePath();
            break;
    }
    return corePath;
}

// 依据模块型号获取默认core文件列表
export function getDefaultCoreList(moduleModel:string) {
    const coreList: string[] = [];
    const defaultCorePath:string = getCorePathBaseModuleModel(moduleModel);
    const moduleModelExtname:string = getExtnameBaseModel(moduleModel);
    const files: string[] = fs.readdirSync(defaultCorePath);
    for (let index = 0; index < files.length; index++) {
        const element = files[index];
        if (path.extname(path.join(defaultCorePath, element)) === moduleModelExtname) {
            coreList.unshift(element);
        }
    }
    return coreList;
}

/*
*依据模块型号获取默认最新corePath名称
*@param moduleModel 模块的具体型号
*@return coreName 本地最新coreName
*/ 
export function getDefaultLatestCoreName(moduleModel:string){
    const corePath: string = getCorePathBaseModuleModel(moduleModel);
    const coreList:string[] = fs.readdirSync(corePath);
    const reg = getRegBaseModel(moduleModel);
    const moduleModelExtname:string = getExtnameBaseModel(moduleModel);
    let currentVersion = undefined;
    let coreName = '';
    for (let index = 0; index < coreList.length; index++) {
        const currentCoreName: string = coreList[index];
        if (path.extname(currentCoreName) === moduleModelExtname) {
            const coreNameVersionArray: any = reg.exec(currentCoreName);
            reg.lastIndex = 0;
            if (coreNameVersionArray !== null && currentVersion === undefined) {
                currentVersion = coreNameVersionArray[1];
                coreName = currentCoreName;
            }
            else if (coreNameVersionArray !== null && currentVersion !== undefined && coreNameVersionArray[1] > currentVersion) {
                currentVersion = coreNameVersionArray[1];
                coreName = currentCoreName;
            }
        }
    }
    return coreName;
}

/*
* 依据模块型号获取默认最新corePath路径
*@param moduleModel 模块的具体型号
*@return defaultLatestCorePath 本地默认最新core路径
*/
export function getDefaultLatestCorePath(moduleModel:string){
    const defaultLatestCoreName:string = getDefaultLatestCoreName(moduleModel);
    const defaultCorePath:string = getCorePathBaseModuleModel(moduleModel);
    let defaultLatestCorePath:string = '';
    if (defaultLatestCoreName!=='') {
        defaultLatestCorePath = path.join(defaultCorePath,defaultLatestCoreName);
    }
    return defaultLatestCorePath;
}

// 依据模块型号获取固件名后缀
export function getExtnameBaseModel(moduleModel: any) {
    const air72XCXModuleModelName = getAir72XCXModuleModelName();
    let extname: any;
    switch (moduleModel) {
        case 'air72XUX/air82XUX':
            extname = '.pac';
            break;
        case air72XCXModuleModelName:
            extname = '.zip';
            break;
        case 'air101':
            extname = '.soc';
            break;
        case 'air103':
            extname = '.soc';
            break;
        case 'air105':
            extname = '.soc';
            break;
        case 'esp32c3':
            extname = '.soc';
            break;
    }
    return extname;
}
/*--------------------------------------工程固件数据处理相关接口----------------------------------------*/ 

/*++++++++++++++++++++++++++++++++++++++工程demo数据处理相关接口++++++++++++++++++++++++++++++++++++++++*/ 
// 获取air72XUX默认最新demo名称
export function getAir72XUXDefaultLatestDemoName() {
    const air72XUXDemoPath: string = getAir72XUXDefaultDemoPath();
    const demoList: string[] = fs.readdirSync(air72XUXDemoPath);
    let demoLatestPath:string = "";
    if (demoList.length===0) {
        return demoLatestPath;
    }
    const reg = /V([\d\.]+)/gi;
    let currentVersion: string = '';
    for (let index = 0; index < demoList.length; index++) {
        const currentDemoName: string = demoList[index];
        const demoNameVersionArray = reg.exec(currentDemoName);
        reg.lastIndex = 0;
        if (demoNameVersionArray === null) {
            continue;
        }
        else if (currentVersion === '') {
            currentVersion = demoNameVersionArray[1];
        }
        else if (demoNameVersionArray[1] > currentVersion) {
            currentVersion = demoNameVersionArray[1];
        }
    }
    if (currentVersion!=='') {
        currentVersion = 'V'+currentVersion;
    }
    return currentVersion;
}

// 获取air72XUX默认最新demo路径
export function getAir72XUXDefaultLatestDemoPath() {
    const air72XUXDefaultLatestDemoName:string = getAir72XUXDefaultLatestDemoName();
    const air72XUXDefaultDemoPath: string = getAir72XUXDefaultDemoPath();
    let air72XUXDefaultLatestDemoPath:string = '';
    if (air72XUXDefaultLatestDemoName!=='') {
        air72XUXDefaultLatestDemoPath = path.join(air72XUXDefaultDemoPath,air72XUXDefaultLatestDemoName);
    }
    return air72XUXDefaultLatestDemoPath;
}

// 依据模块型号获取demo路径
export function getDemoPathBaseModuleModel(moduleModel: any) {
    const air72XCXModuleModelName = getAir72XCXModuleModelName();
    let demoPath: any;
    switch (moduleModel) {
        case 'air72XUX/air82XUX':
            demoPath = getAir72XUXDefaultLatestDemoPath();
            break;
        case air72XCXModuleModelName:
            demoPath = getAir72XUXDefaultLatestDemoPath();
            break;
        case 'air101':
            demoPath = getAir101DefaultDemoPath();
            break;
        case 'air103':
            demoPath = getAir103DefaultDemoPath();
            break;
        case 'air105':
            demoPath = getAir105DefaultDemoPath();
            break;
        case 'esp32c3':
            demoPath = getEsp32c3DefaultDemoPath();
            break;
    }
    return demoPath;
}

// 依据模块型号获取默认示例demo列表
export function getDefaultExampleList(moduleModel:string){
    const demoList: string[] = [];
    const defaultDemoPath: string = getDemoPathBaseModuleModel(moduleModel);
    if (defaultDemoPath==='') {
        return demoList;
    }
    const files: string[] = fs.readdirSync(defaultDemoPath);
    for (let index = 0; index < files.length; index++) {
        const element = files[index];
        if (fs.statSync(path.join(defaultDemoPath, element)).isDirectory()) {
            demoList.push(element);
        }
    }
    return demoList;
}

// 获取NDK默认示例demo列表
export function getNdkDefaultExampleList() {
    const demoList: string[] = [];
    const ndkDefaultLatestDemoPath: string = getNdkDefaultDemoPath();
    if (ndkDefaultLatestDemoPath==='') {
        return demoList;
    }
    const files: string[] = fs.readdirSync(ndkDefaultLatestDemoPath);
    for (let index = 0; index < files.length; index++) {
        const element = files[index];
        if (fs.statSync(path.join(ndkDefaultLatestDemoPath, element)).isDirectory()) {
            demoList.push(element);
        }
    }
    return demoList;
}
/*--------------------------------------工程demo数据处理相关接口----------------------------------------*/ 

/*++++++++++++++++++++++++++++++++++++++工程lib库数据处理相关接口++++++++++++++++++++++++++++++++++++++++*/ 
// 获取air72XUX默认最新lib版本名称
export function getAir72XUXDefaultLatestLibName() {
    const air72XUXLibPath: string = getAir72XUXDefaultLibPath();
    const libList: string[] = fs.readdirSync(air72XUXLibPath);
    let libLatestPath:string = '';
    if (libList.length===0) {
        return libLatestPath;
    }
    const reg = /V([\d\.]+)/gi;
    let currentVersion: string = '';
    for (let index = 0; index < libList.length; index++) {
        const currentLibName: string = libList[index];
        const libNameVersionArray = reg.exec(currentLibName);
        reg.lastIndex = 0;
        if (libNameVersionArray === null) {
            continue;
        }
        else if (currentVersion === '') {
            currentVersion = libNameVersionArray[1];
        }
        else if (libNameVersionArray[1] > currentVersion) {
            currentVersion = libNameVersionArray[1];
        }
    }
    if (currentVersion!=='') {
        currentVersion = 'V'+currentVersion;
    }
    return currentVersion;
}

// 获取air72XUX默认最新Lib路径
export function getAir72XUXDefaultLatestLibPath() {
    const air72XUXDefaultLatestLibName:string = getAir72XUXDefaultLatestLibName();
    const air72XUXDefaultLibPath: string = getAir72XUXDefaultLibPath();
    let air72XUXDefaultLatestLibPath:string = '';
    if (air72XUXDefaultLatestLibName!=='') {
        air72XUXDefaultLatestLibPath = path.join(air72XUXDefaultLibPath,air72XUXDefaultLatestLibName,'lib');
    }
    return air72XUXDefaultLatestLibPath;
}

// 获取air72XUX默认lib库列表
export function getAir72XUXDefaultLibList() {
    const libList: string[] = [];
    const air72XUXDefaultLibPath: string = getAir72XUXDefaultLibPath();
    const files: string[] = fs.readdirSync(air72XUXDefaultLibPath);
    for (let index = 0; index < files.length; index++) {
        const element = files[index];
        if (fs.statSync(path.join(air72XUXDefaultLibPath, element)).isDirectory()) {
            libList.unshift(element);
        }
    }
    return libList;
}

// 依据模块型号获取lib文件列表
export function getLibListBaseMoudeleMode(moduleModel: any) {
    const air72XCXModuleModelName = getAir72XCXModuleModelName();
    let libList: any;
    switch (moduleModel) {
        case 'air72XUX/air82XUX':
            libList = getAir72XUXDefaultLibList();
            break;
        case air72XCXModuleModelName:
            libList = getAir72XUXDefaultLibList();
            break;
        case 'air101':
            libList = '';
            break;
        case 'air103':
            libList = '';
            break;
        case 'air105':
            libList = '';
            break;
        case 'esp32c3':
            libList = '';
            break;
        default:
            libList = getAir72XUXDefaultLibList();
    }
    return libList;
}
/*--------------------------------------工程lib库数据处理相关接口----------------------------------------*/ 

/*--------------------------------------工程管理数据资源文件路径相关接口----------------------------------------*/ 

/*++++++++++++++++++++++++++++++++++++++工具集合相关接口++++++++++++++++++++++++++++++++++++++++*/ 
// 获取7z压缩工具路径
export function getUnzipToolPath(){
    const unzipToolPath:string = path.join(extensionPath,'tools','7z','7za.exe');
    return unzipToolPath;
}

// 获取本地所有串口信息
export async function getSerialPortInfoList() {
    let portFriendlyNameList:string[] = [];
    try {
        let ports = await SerialPort.list();
        for (let index = 0; index < ports.length; index++) {
            const element = ports[index];
            const friendlyName = JSON.parse(JSON.stringify(element)).friendlyName;
            const comPort = JSON.parse(JSON.stringify(element)).path;
            const portDesc:string = "["+comPort+"] "+friendlyName;
            portFriendlyNameList.push(portDesc);
        }
        // console.log(ports); // 打印串口列表
        return portFriendlyNameList;
    } catch (error) {
        console.log(error);
        return portFriendlyNameList;
    }
}

// 活动工程配置获取串口信息列表
export async function getActiveProjectSerialPortInfoList() {
    let portFriendlyNameList:string[] = await getSerialPortInfoList();
    portFriendlyNameList.unshift("");
    return portFriendlyNameList;
}

/*--------------------------------------工具相关接口----------------------------------------*/