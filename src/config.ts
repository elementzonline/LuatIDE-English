// import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
    getAir101DefaultCorePath,
    getAir101DefaultDemoPath,
    getAir103DefaultCorePath,
    getAir103DefaultDemoPath,
    getAir105DefaultCorePath,
    getAir105DefaultDemoPath,
    getAir72XUXCorePath,
    getAir72XUXDemoPath,
    getAir72XUXLibPath,
    getAppDataPath,
    getDefaultWorkspacePath,
    getHistoryCorePath,
    getHistoryDemoPath,
    getHistoryLibPath,
    getLuatIDEDataPath,
    getPluginConfigPath,
    getUserUUIDPath
} from './variableInterface';

/**
 * 插件配置初始化，在用户appdata区域生成插件所需data
 */
export class PluginConfigInit {
    private appDataPath: any = getAppDataPath();
    private plugDataPath: any = getLuatIDEDataPath();
    private pluginDefaultWorkspacePath:any = getDefaultWorkspacePath();
    private historyLibpath: any = getHistoryLibPath();
    private historyDemopath: any = getHistoryDemoPath();
    private air72XUXDemopath: any = getAir72XUXDemoPath();
    private air101Demopath: any = getAir101DefaultDemoPath();
    private air103Demopath: any = getAir103DefaultDemoPath();
    private air105Demopath: any = getAir105DefaultDemoPath();
    private air72XUXLibpath: any = getAir72XUXLibPath();
    private dataIntroduce: any = path.join(this.appDataPath, 'LuatIDE', '文件夹说明.txt');
    private introduceData: any = '该文件夹为合宙vscode插件LuatIDE的配置保存文件,删除后可能导致插件历史配置丢失,插件不可使用,请谨慎删除';
    private pluginconfigPath: any = getPluginConfigPath();
    private uuidPath = getUserUUIDPath();
    private corepath = getHistoryCorePath();
    private air72XUXCorepath: any = getAir72XUXCorePath();
    private air101Corepath: any = getAir101DefaultCorePath();
    private air103Corepath: any = getAir103DefaultCorePath();
    private air105Corepath: any = getAir105DefaultCorePath();

    constructor() {

    }
                                                                                                                                                                                                                       
    // config实例化
    configInit(){
        this.folderInit(this.plugDataPath);
        this.folderInit(this.pluginDefaultWorkspacePath);
        this.folderInit(this.historyLibpath);
        this.folderInit(this.historyDemopath);
        this.folderInit(this.air72XUXDemopath);
        this.folderInit(this.air101Demopath);
        this.folderInit(this.air103Demopath);
        this.folderInit(this.air105Demopath);
        this.folderInit(this.air72XUXLibpath);
        this.fileInit(this.dataIntroduce);
        this.fileInit(this.pluginconfigPath);
        this.fileInit(this.uuidPath);
        this.folderInit(this.corepath);
        this.folderInit(this.air72XUXCorepath);
        this.folderInit(this.air101Corepath);
        this.folderInit(this.air103Corepath);
        this.folderInit(this.air105Corepath);
    }

    // 获取当前插件配置文件初始化版本号
    getPlugConfigInitVersion(){
        const plugConfigInitVersion:string = '2.1';
        return plugConfigInitVersion;
    }

    // 数据存储路径文件初始化
    fileInit(filePath: string) {
        if (!fs.existsSync(filePath)) {
            this.generateFile(filePath);
        }
    }

    // 数据存储路径文件夹初始化
    folderInit(folderPath:string){
        if (!fs.existsSync(folderPath)) {
            this.generateFloder(folderPath);
        }
    }

    // 生成文件夹
    generateFloder(filePath: string) {
        fs.mkdirSync(filePath);
    }

    // 生成文件
    generateFile(filePath: string) {
        switch (path.basename(filePath)) {
            default:
                fs.writeFileSync(filePath, '');
                break;
            case '文件夹说明.txt':
                fs.writeFileSync(filePath, this.introduceData);
                break;
            case 'luatide_workspace.json':
                const pluginConfigJson: string = this.configJsonGenerator();
                fs.writeFileSync(filePath, pluginConfigJson);
                break;
            case 'uuid.txt':
                const uuidData: any = this.uuidGenerator();
                fs.writeFileSync(filePath, uuidData);
                break;
        }
    }

    //生成用户唯一性标识uuid
    uuidGenerator() {
        if (!fs.existsSync(this.uuidPath)) {
            // 改接口获取到的UUID每次都不一样，可以看作是一个随机数
            // 我们需要在第一次使用的时候保存下来，后面都用这一个
            let userToken = uuidv4();
            fs.writeFileSync(this.uuidPath, userToken);
            console.log('userToken', userToken);
            return userToken;
        }
    }
    
    // 生成插件配置文件
    configJsonGenerator() {
        const pluginConfigInitVersion:string = this.getPlugConfigInitVersion();
        const configJson: any = {
            version: pluginConfigInitVersion,
            projectList: [],
            activeProject: '',
        };
        // let configJsonObj = JSON.parse(configJson);
        return JSON.stringify(configJson,null,"\t");
    }
}

// /**
//  * 插件所需core文件自动更新设置
//  */
// export class PluginCoreUpate {
//     corePullDownload = new CorePullDownload();
//     plugVariablesInit = new PluginVariablesInit();
//     model72XName = 'air72XUX/air82XUX';
//     model101Name = 'air101';
//     model103Name = 'air103';
//     model105Name = 'air105';
//     constructor() {

//     }

//     // core更新处理
//     async updateCoreHandle(){
//         await this.updateCore(this.model72XName);
//         await this.updateCore(this.model101Name);
//         await this.updateCore(this.model103Name);
//         await this.updateCore(this.model105Name);
//     }

//     // 更新指定模块的Core文件
//     async updateCore(moduleModel: any) {
//         let corepath: string = this.getCorePath(moduleModel);
//         // 获取用户本地core版本
//         let localCoreVersion =  this.getLocalCoreVersion(corepath, moduleModel);
//         // 获取远端最新core版本
//         let remoteCoreVersion:any = await this.getRemoteCoreVersion(moduleModel);
//         // 执行首次下载操作
//         if (localCoreVersion === undefined) {
//             this.updateHintForUser(moduleModel);
//         }
//         // 执行更新操作
//         else if (remoteCoreVersion > localCoreVersion) {
//             this.updateHintForUser(moduleModel);
//         }
//     }

//     // 获取用户core存储路径
//     getCorePath(moduleModel: any) {
//         let corepath: any;
//         switch (moduleModel) {
//             case 'air72XUX/air82XUX':
//                 corepath = this.plugVariablesInit.getAir72xCorepath();
//                 break;
//             case 'air101':
//                 corepath = this.plugVariablesInit.getAir101DefaultCorePath();
//                 break;
//             case 'air103':
//                 corepath = this.plugVariablesInit.getAir103DefaultCorePath();
//                 break;
//             case 'air105':
//                 corepath = this.plugVariablesInit.getAir105DefaultCorePath();
//                 break;
//         }
//         return corepath;
//     }

//     // 解析并返回本地当前固件最新版本号
//     getLocalCoreVersion(dir: any, moduleModel: any) {
//         const reg: any =  this.plugVariablesInit.getRegBaseModel(moduleModel);
//         const coreExtname =  this.plugVariablesInit.getExtnameBaseModel(moduleModel);
//         const files: any = fs.readdirSync(dir);
//         let currentVersion = undefined;
//         for (let index = 0; index < files.length; index++) {
//             const file: any = files[index];
//             if (path.extname(file) === coreExtname) {
//                 let currentVersionArray = reg.exec(file);
//                 reg.lastIndex = 0;
//                 if (currentVersionArray !== null && currentVersion === undefined) {
//                     currentVersion = currentVersionArray[1];
//                 }
//                 else if (currentVersionArray !== null  && currentVersion!==undefined && currentVersionArray[1] > currentVersion) {
//                     currentVersion = currentVersionArray[1];
//                 }
//             }
//         }
//         return currentVersion;
//     }

//     // 获取远端固件版本号
//     async getRemoteCoreVersion(moduleModel: any) {
//             const reg: any = this.plugVariablesInit.getRegBaseModel(moduleModel);
//             // const coreExtname = this.plugVariablesInit.getExtnameBaseModel(moduleModel);
//             const requestUrl: any = this.corePullDownload.getPullRequestUrl(moduleModel);
//             const jsonData: any = await this.corePullDownload.getApiJsonFromRemoteServer(requestUrl);
//             const remoteUrl: any = await this.corePullDownload.parseJsonReturnSourceUrl(moduleModel, jsonData);
//             let remoteUrlArray = reg.exec(remoteUrl);
//             let remoteCoreVersion: any;
//             if (remoteUrlArray !== null) {
//                 remoteCoreVersion = remoteUrlArray[1];
//             }
//             else{
//                 remoteCoreVersion = undefined;
//             }
//             return remoteCoreVersion;
//     }

//     // 获取用户提示中的提示内容
//     getDownloadReadyHint(moduleModel: string) {
//         let coreDownloadReadyHint: string;
//         switch (moduleModel) {
//             case 'air72XUX/air82XUX':
//                 coreDownloadReadyHint = '当前air72XUX/air82XUX固件默认区域未检测到固件,是否拉取最新air72XUX/air82XUX固件';
//                 return coreDownloadReadyHint;
//             case 'air101':
//                 coreDownloadReadyHint = '当前air101固件默认区域未检测到固件,是否拉取最新air101固件';
//                 return coreDownloadReadyHint;
//             case 'air103':
//                 coreDownloadReadyHint = '当前air103固件默认区域未检测到固件,是否拉取最新air103固件';
//                 return coreDownloadReadyHint;
//             case 'air105':
//                 coreDownloadReadyHint = '当前air105固件默认区域未检测到固件,是否拉取最新air105固件';
//                 return coreDownloadReadyHint;
//         }
//     }

//     // 获取进度条展示中的提示标题内容
//     getDownloadingHint(moduleModel: string) {
//         let coreDownloadingHint: string;
//         switch (moduleModel) {
//             case 'air72XUX/air82XUX':
//                 coreDownloadingHint = '正在为您拉取最新air72XUX/air82XUX固件,请耐心等待';
//                 return coreDownloadingHint;
//             case 'air101':
//                 coreDownloadingHint = '正在为您拉取最新air101固件,请耐心等待';
//                 return coreDownloadingHint;
//             case 'air103':
//                 coreDownloadingHint = '正在为您拉取最新air103固件,请耐心等待';
//                 return coreDownloadingHint;
//             case 'air105':
//                 coreDownloadingHint = '正在为您拉取最新air105固件,请耐心等待';
//                 return coreDownloadingHint;
//         }
//     }

//     // 自动更新用户提示展示
//     async updateHintForUser(moduleModel: any) {
//         const coreDownloadReadyHint: any = this.getDownloadReadyHint(moduleModel);
//         await vscode.window.showInformationMessage(coreDownloadReadyHint, { modal: true }, '是').then(async result => {
//             if (result !== undefined) {
//                 await this.updateProgressView(result, moduleModel);
//             }
//         });
//     }

//     //更新进度条展示
//     async updateProgressView(result: string, moduleModel: any) {
//         const coreDownloadingHint: any = this.getDownloadingHint(moduleModel);
//         if (result === '是') {
//             await vscode.window.withProgress({
//                 location: ProgressLocation.Notification,
//                 title: coreDownloadingHint,
//                 cancellable: true,
//             }, async (progress, token) => {
//                 token.onCancellationRequested(() => {
//                     console.log('用户取消了更新');
//                 });
//                 progress.report({ increment: 0, message: '正在更新...' });
//                 progress.report({ increment: 10, message: '正在更新...' });
//                 await this.corePullDownload.corePullDownload(moduleModel);

//                 setTimeout(() => {
//                     progress.report({ increment: 50, message: '正在更新...' });
//                 }, 1000);

//                 const promise = new Promise<void>(resolve => {
//                     setTimeout(() => {
//                         resolve();
//                     }, 5000);
//                 });
//                 return promise;
//             });
//         }
//     }
// }

// /**
//  * 解析接口获取url更新地址，从远端服务器拉取数据，下载解压缩至core文件存储路径
//  */
// export class CorePullDownload {
//     pluginVariablesInit = new PluginVariablesInit();
//     // pluginCoreUpate = new PluginCoreUpate();
//     constructor() {
//     }

//     // 下载远端core到本地
//     async corePullDownload(moduleModel: any) {
//         const pullRequestUrl: any = this.getPullRequestUrl(moduleModel);
//         const jsonResult: any = await this.getApiJsonFromRemoteServer(pullRequestUrl);
//         const sourceUrl: any = await this.parseJsonReturnSourceUrl(moduleModel, jsonResult);  //依据传入的不同型号做不同的解析
//         const zipsourceDistPath: any = await this.getzipSourceDistPath(moduleModel,sourceUrl);
//         const sourceDistPath:string = this.pluginVariablesInit.getCorePathBaseModuleModel(moduleModel);
//         await this.download(sourceUrl,zipsourceDistPath);
//         await this.unzip(zipsourceDistPath, sourceDistPath).then(async ()=>{
//             await this.deleteRedundantSource(moduleModel, sourceDistPath);
//         });
//     }

//     // 获取更新api接口url
//     getPullRequestUrl(moduleModel: any) {
//         let requestUrl: any;
//         switch (moduleModel) {
//             case 'air72XUX/air82XUX':
//                 requestUrl = 'https://erp.openluat.com/api/site/product_software_latest?software_type=8910&software_type_2=LUAT';
//                 return requestUrl;
//             case 'air101':
//                 requestUrl = 'https://luatos.com/api/luatools/files';
//                 return requestUrl;
//             case 'air103':
//                 requestUrl = 'https://luatos.com/api/luatools/files';
//                 return requestUrl;
//             case 'air105':
//                 requestUrl = 'https://luatos.com/api/luatools/files';
//                 return requestUrl;
//         }
//     }

//     // 请求更新api接口，获取json数据
//     async getApiJsonFromRemoteServer(url: any) {
//         const response: any = await fetch(url);
//         const jsonResult: any = await response.json();
//         return jsonResult;
//     };

//     // 解析接口数据，返回所需下载资源实际url
//     async parseJsonReturnSourceUrl(moduleModel: any, jsonData: any) {
//         let sourceUrl: string;
//         switch (moduleModel) {
//             case 'air72XUX/air82XUX':
//                 sourceUrl = jsonData['data'][0]['software_url'];
//                 return sourceUrl;
//             case 'air101':
//                 const air101SourceName: string = jsonData['101_lua_lod'];
//                 sourceUrl = 'http://cdndownload.openluat.com/Luat_tool_src/v2tools/101_lua_lod/' + air101SourceName;
//                 return sourceUrl;
//             case 'air103':
//                 const air103SourceName: string = jsonData['103_lua_lod'];
//                 sourceUrl = 'http://cdndownload.openluat.com/Luat_tool_src/v2tools/103_lua_lod/' + air103SourceName;
//                 return sourceUrl;
//             case 'air105':
//                 const air105SourceName: string = jsonData['105_lua_lod'];
//                 sourceUrl = 'http://cdndownload.openluat.com/Luat_tool_src/v2tools/105_lua_lod/' + air105SourceName;
//                 return sourceUrl;
//         }
//     }

//     // 依据模块型号及资源url名称，返回下载要保存的目的文件名
//     async getzipSourceDistPath(moduleModel: any, sourceUrl: any) {
//         const sourcezipName: any = sourceUrl.split('/').reverse()[0];
//         let sourceDistPath: any;
//         switch (moduleModel) {
//             case 'air72XUX/air82XUX':
//                 const air72xCorePath = this.pluginVariablesInit.getAir72xCorepath();
//                 sourceDistPath = path.join(air72xCorePath, sourcezipName);
//                 return sourceDistPath;
//             case 'air101':
//                 const air101CorePath = this.pluginVariablesInit.getAir101DefaultCorePath();
//                 sourceDistPath = path.join(air101CorePath, sourcezipName);
//                 return sourceDistPath;
//             case 'air103':
//                 const air103CorePath = this.pluginVariablesInit.getAir103DefaultCorePath();
//                 sourceDistPath = path.join(air103CorePath, sourcezipName);
//                 return sourceDistPath;
//             case 'air105':
//                 const air105CorePath = this.pluginVariablesInit.getAir105DefaultCorePath();
//                 sourceDistPath = path.join(air105CorePath, sourcezipName);
//                 return sourceDistPath;
//         }
//     }

//     // 请求服务器执行二进制下载操作
//     async download(url: any, filePath: any) {
//         let headers:any = {};
//         headers['Content-Type'] = 'application/x-zip-compressed';
//         await fetch(url, {
//             method: 'GET',
//             headers: headers,
//         }).then(res => res.buffer()).then(_ => {
//             fs.writeFileSync(filePath, _, 'binary');
//         });
//       }

//     // 对下载完毕的zip文件进行解压缩
//     async unzip(srcpath: any, distpath: any) {
//         await compressing.zip.uncompress(srcpath, distpath)
//             .then(() => {
//                 console.log('unzip', 'success');
//             })
//             .catch(err => {
//                 console.error('unzip', err);
//             });
//     }

//     //   清理文件夹内冗余资源
//     async deleteRedundantSource(moudleModel: any, distpath: any) {
//         const files = fs.readdirSync(distpath);
//         const pathExtname = await this.pluginVariablesInit.getExtnameBaseModel(moudleModel);
//         files.forEach(async (file, index) => {
//             const extname = path.extname(file);
//             // 删除解压缩后无关文件干扰
//             if (extname !== pathExtname) {
//                 if (fs.statSync(path.join(distpath, file)).isFile()) {
//                     await fs.unlinkSync(path.join(distpath, file));
//                 }
//                 else {
//                     await this.deleteFolderRecursive(path.join(distpath, file));
//                 }
//             }
//         });
//     }

//     // 递归删除文件夹内所有内容
//     async deleteFolderRecursive(url: any) {
//         if (fs.existsSync(url)) {
//             let files = fs.readdirSync(url);
//             files.forEach((file, index) => {
//                 var curPath = path.join(url, file);
//                 if (fs.statSync(curPath).isDirectory()) { // recurse
//                     this.deleteFolderRecursive(curPath);
//                 } else {
//                     fs.unlinkSync(curPath);
//                 }
//             });
//             fs.rmdirSync(url);
//         } else {
//             console.log('给定的路径不存在，请给出正确的路径');
//         }
//     }
// }