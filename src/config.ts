import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
// import { UpdateCore } from './updataCore';
import { ProgressLocation } from 'vscode';
// import  fetch from 'node-fetch'; 
import * as compressing from 'compressing';

/**
 * 插件变量初始化，管理插件所有的全局变量
 */
export class PluginVariablesInit{
    // 获取数据存储路径
    private appDataPath:any = process.env['APPDATA'];
    // 获取用户扩展路径
    private extensionPath:any = path.join(__dirname,'../.');
    constructor() {
        
    }

    //获取用户APPDATA路径
    getAppDataPath(){
        const appDataPath:any = process.env['APPDATA'];
        return appDataPath;
    } 

    //获取用户LuatIDE数据存储路径
    getLuatIDEDataPath(){
        const plugDataPath:any = path.join(this.appDataPath,'LuatIDE');
        return plugDataPath;
    } 

    //获取用户插件配置文件路径
    getPluginConfigPath(){
        const pluginConfigPath: string = path.join(this.appDataPath,'LuatIDE','luatide_workspace.json');
        return pluginConfigPath;
    }

    // 获取用户历史lib库存储路径
    getHistoryLibPath(){
        const historyLibpath:any = path.join(this.appDataPath,'LuatIDE','LuatideLib');
        return historyLibpath;
    }
    
    // 获取用户历史demo存储路径
    getHistoryDemoPath(){
        const historyDemopath:any = path.join(this.appDataPath,'LuatIDE','LuatideDemo');
        return historyDemopath;
    }

    // 获取Air72X固件存储路径
    getAir72xCorepath(){
        let air72xCorepath:any = path.join(this.appDataPath,'LuatIDE','LuatideCore','Air72X_CORE');
        return air72xCorepath;
    }

    // 获取Air10X固件存储路径
    getAir10xCorepath(){
        let air10xCorepath:any = path.join(this.appDataPath,'LuatIDE','LuatideCore','Air10X_CORE');
        return air10xCorepath;
    }

    // 获取获取Air72X固件版本号正则解析表达式
    async getAir72XReg(){
        const reg = /LuatOS-\w{3}_V(\d+)_RDA8910/gi;
        return reg;
    }

    // 获取获取Air10X固件版本号正则解析表达式
    async getAir10XReg(){
        const reg = /LuatOS-SoC_V(\d+)_AIR101/ig;
        return reg;
    }

    // 依据模块型号获取解析的正则表达式
    async getRegBaseModel(moduleModel:any){
        let reg:any;
        switch(moduleModel){
            case 'Air72X':
                reg = this.getAir72XReg();
            case 'Air10X':
                reg = this.getAir10XReg();
        }
        return reg;
    }

    // 获取新闻api接口链接
    async getNewsApi(){
        const newsUrl = 'http://121.40.170.41:30050/api/site/hezhou_news';
        return newsUrl;
    }

    // 获取home主页html路径
    getHomeHtmlPath(){
        const homeHtmlPath: string = path.join(this.extensionPath,'src','webview','home.html');
        return homeHtmlPath;
    }

    // 获取project主页资源文件路径
    getProjectSourcePath(){
        const projectSourcePath: string = path.join(this.extensionPath,'src','webview','newProject');
        return projectSourcePath;
    }

    // 获取project主页html按钮
    getProjectHtmlPath(){
        const projectHtmlPath: string = path.join(this.extensionPath,'src','webview','newProject','index.html');
        return projectHtmlPath;
    }

    // 获取主页LuatIDE logo图标路径
    getLogoPath(){
        const logoPath: string = path.join(this.extensionPath,'resource','image','luatideLog.png');
        return logoPath;
    }

    // 获取登录成功状态svg图标路径
    getLoginSuccessPath(){
        const loginSuccessPath: string = path.join(this.extensionPath,'webview','resource','loginSuccess.svg');
        return loginSuccessPath;
    }

    // 获取登录失败状态svg图标路径
    getLoginFailedPath(){
        const loginFailedPath: string = path.join(this.extensionPath,'webview','resource','loginSuccess.svg');
        return loginFailedPath;
    }

    // 获取home模态框加载的js路径
    getHomeModalBoxPath(){
        const homeModalBoxPath: string = path.join(this.extensionPath,'webview','swiper.js');
        return homeModalBoxPath;
    }

    // 获取Air72X系列main文件默认内容
    getAir72XDefaultMainData(){
        const air72xMainData: string = 'PROJECT = \'test\'\r\nVERSION = \'2.0.0\'\r\nrequire \'log\'\r\nLOG_LEVEL = log.LOGLEVEL_TRACE\r\nrequire \'sys\'\r\n\r\n\r\n\r\nsys.taskInit(function()\r\n\twhile true do\r\n\t\t-- log.info(\'test\',array)\r\n\t\tlog.info(\'Hello world!\')\r\n\t\tsys.wait(1000)\r\n\tend\r\nend)\r\n\r\nsys.init(0, 0)\r\nsys.run()';
        return air72xMainData;
    }

    // 获取Air10X系列main文件默认内容
    getAir10XDefaultMainData(){
        const air10xMainData: string = '-- LuaTools需要PROJECT和VERSION这两个信息\r\nPROJECT = \'helloworld\'\r\nVERSION = \'1.0.0\'\r\n\r\n-- 引入必要的库文件(lua编写), 内部库不需要require\r\nlocal sys = require \'sys\'\r\nlog.info(\'main\', \'hello world\')\r\n\r\nprint(_VERSION)\r\n\r\nsys.timerLoopStart(function()\r\n\tprint(\'hi, LuatOS\')\r\nend, 3000)\r\n-- 用户代码已结束---------------------------------------------\r\n-- 结尾总是这一句\r\nsys.run()\r\n-- sys.run()之后后面不要加任何语句!!!!!';
        return air10xMainData;
    }

    // 获取Air72X默认lib库路径
    getAir72XDefaultLibPath(){
        const air72xDefaultLibPath: string = path.join(this.appDataPath,"LuatIDE","LuatideLib","Air72X_LIB","V2.4.0","lib");
        return air72xDefaultLibPath;
    }

    // 获取Air72X默认demo
    getAir72XDefaultDemoPath(){
        const air72XDefaultDemoPath: string = path.join(this.appDataPath,"LuatIDE","LuatideLib","Air72X_Demo","Air72X_DEMO_V2.4.0");
        return air72XDefaultDemoPath;
    }

    // 获取Air10X默认demo
    getAir10XDefaultDemoPath(){
        const air10XDefaultDemoPath: string = path.join(this.appDataPath,"LuatIDE","LuatideLib","Air10X_Demo");
        return air10XDefaultDemoPath;
    }

    // 获取插件支持的模块列表
    getPluginDefaultModuleList(){
        const moduleList:string[] = ["Air72XUX/Air82XUX", "Air72XCX","Air10X","Simulator"];
        return moduleList;
    }
}

/**
 * 插件配置初始化，在用户appdata区域生成插件所需data
 */
export class PluginConfigInit {
    private appDataPath:any = process.env['APPDATA'];
    private plugDataPath:any = path.join(this.appDataPath,'LuatIDE');
    private historyLibpath:any = path.join(this.appDataPath,'LuatIDE','LuatideLib');
    private historyDemopath:any = path.join(this.appDataPath,'LuatIDE','LuatideDemo');
    private air72xDemopath:any = path.join(this.appDataPath,'LuatIDE','LuatideDemo','Air72X_DEMO');
    private air10xDemopath:any = path.join(this.appDataPath,'LuatIDE','LuatideDemo','Air10X_DEMO');
    private air72xLibpath:any = path.join(this.appDataPath,'LuatIDE','LuatideLib','Air72X_LIB');
    private dataIntroduce:any = path.join(this.appDataPath,'LuatIDE','文件夹说明.txt');
    private introduceData:any = '该文件夹为合宙vscode插件LuatIDE的配置保存文件,删除后可能导致插件历史配置丢失,插件不可使用,请谨慎删除';
    private pluginconfigPath:any = path.join(this.appDataPath,'LuatIDE','luatide_workspace.json');
    private uuidPath = path.join(this.appDataPath,'LuatIDE','uuid.txt');
    private corepath = path.join(this.appDataPath,'LuatIDE','LuatideCore');
    private air72xCorepath:any = path.join(this.appDataPath,'LuatIDE','LuatideCore','Air72X_CORE');
    private air10xCorepath:any = path.join(this.appDataPath,'LuatIDE','LuatideCore','Air10X_CORE');

    constructor() {
        this.fileInit(this.plugDataPath);
        this.fileInit(this.historyLibpath);
        this.fileInit(this.historyDemopath);
        this.fileInit(this.air72xDemopath);
        this.fileInit(this.air10xDemopath);
        this.fileInit(this.air72xLibpath);
        this.fileInit(this.dataIntroduce);
        this.fileInit(this.pluginconfigPath);
        this.fileInit(this.uuidPath);
        this.fileInit(this.corepath);
        this.fileInit(this.air72xCorepath);
        this.fileInit(this.air10xCorepath);
    }

    // 

    // 数据存储路径数据结构初始化
    fileInit(filePath: string){
        if (!fs.existsSync(filePath)) {
            this.judgeFileTypetStatus(filePath);
        }
    }

    // 判断文件类型
    judgeFileTypetStatus(filePath: string){
        if (fs.statSync(filePath).isFile()) {
            this.generateFile(filePath);
        }
        else{
            this.generateFloder(filePath);
        }
    }

    // 生成文件夹
    generateFloder(filePath: string){
        fs.mkdirSync(filePath);
    }

    // 生成文件
    generateFile(filePath: string){
        switch(path.basename(filePath)){
            default:
                fs.writeFileSync(filePath,'');
            case '文件夹说明.txt':
                fs.writeFileSync(filePath,this.introduceData);
            case 'luatide_workspace.json':
                const pluginConfigJson: string = this.configJsonGenerator();
                fs.writeFileSync(filePath,pluginConfigJson);
            case 'uuid.txt':
                const uuidData:any = this.uuidGenerator();
                fs.writeFileSync(filePath,uuidData);
        }
    }

    //生成用户唯一性标识uuid
    uuidGenerator(){ 
        if (!fs.existsSync(this.uuidPath)) {
            let userToken =  uuidv4();
            fs.writeFileSync(this.uuidPath,userToken);
            console.log('userToken',userToken);
            return userToken;
        }
    }

    // 生成插件配置文件
    configJsonGenerator(){
        const configJson:any ={
            version:2.0,
            projectList:[],
            activeProject:'',
        };
        let configJsonObj = JSON.parse(configJson);
        return JSON.stringify(configJsonObj);
    }
}

/**
 * 插件所需core文件自动更新设置
 */
 export class PluginCoreUpate{
    corePullDownload = new CorePullDownload();
    plugVariablesInit = new PluginVariablesInit();
    model72XName  = 'Air72X';
    model10XName = 'Air10X';
    constructor() {
        this.updateCore(this.model72XName);          
        this.updateCore(this.model72XName);                                                                                                      
    }

    // 更新指定模块的Core文件
    async updateCore(moduleModel:any){

        let corepath:any = this.getCorePath(moduleModel);
        // 获取用户本地core版本
        let localCoreVersion = this.getLocalCoreVersion(corepath,moduleModel);
        // 获取远端最新core版本
        let remoteCoreVersion  = this.getRemoteCoreVersion(moduleModel);
        // 执行首次下载操作
        if (localCoreVersion===undefined) {
            this.updateHintForUser(moduleModel);
        }
        // 执行更新操作
        else if (remoteCoreVersion>localCoreVersion) {
            this.updateHintForUser(moduleModel);
        }
    }

    // 获取用户core存储路径
    async getCorePath(moduleModel:any){
        let corepath:any;
        switch(moduleModel){
            case 'Air72X':
                corepath = this.plugVariablesInit.getAir72xCorepath();
                return corepath;
            case 'Air10X':
                corepath = this.plugVariablesInit.getAir10xCorepath();   
                return corepath;   
        }
    }
    
    // 依据模块型号获取文件名后缀
    async getExtnameBaseModel(moduleModel:any){
        let extname:any;
        switch(moduleModel){
            case 'Air72X':
                extname = '.pac';
            case 'Air10X':
                extname = '.soc';
        }
        return extname;
    }

    // 解析并返回本地当前固件最新版本号
    async getLocalCoreVersion(dir:any,moduleModel:any){
        const reg:any = await this.plugVariablesInit.getRegBaseModel(moduleModel);
        const coreExtname = await this.getExtnameBaseModel(moduleModel);
        const files:any = fs.readFileSync(dir);
        let currentVersion  = undefined;
        for (let index = 0; index < files.length; index++) {
            const file:any = files[index];
            if (path.extname(file)===coreExtname) {
                let currentVersionArray = reg.exec(file);
                reg.lastIndex = 0;
                if (currentVersionArray!==null  && currentVersion === undefined) {
                    currentVersion = currentVersionArray[1];
                }
                else if (currentVersionArray!==null  && currentVersionArray[1]>currentVersion) {
                    currentVersion = currentVersionArray[1];
                }
            }
        }
        return currentVersion;
    }
    
    // 获取远端固件版本号
    async getRemoteCoreVersion(moduleModel:any){
        let remoteCoreVersion:any = undefined;
        const reg:any = await this.plugVariablesInit.getRegBaseModel(moduleModel);
        const coreExtname = await this.getExtnameBaseModel(moduleModel);
        const jsonData:any = await this.corePullDownload.getPullRequestUrl(moduleModel);
        const remoteUrl:any = this.corePullDownload.parseJsonReturnSourceUrl(moduleModel,jsonData);
        let remoteUrlArray = reg.exec(remoteUrl);
        if (remoteUrlArray !== null) {
            remoteCoreVersion = remoteUrlArray[1];
            return remoteCoreVersion;
        }
        else{
            return remoteCoreVersion; 
        }
    }

    // 获取用户提示中的提示内容
    async getDownloadReadyHint(moduleModel: string) {
        let coreDownloadReadyHint: string;
        switch(moduleModel){
            case 'Air72X':
                coreDownloadReadyHint = '当前Air10X固件默认区域未检测到固件,是否拉取最新Air10X固件';
                return coreDownloadReadyHint;
            case 'Air10X':
                coreDownloadReadyHint = '当前Air10X固件默认区域未检测到固件,是否拉取最新Air10X固件';
                return coreDownloadReadyHint;
        }
    }

    // 获取进度条展示中的提示标题内容
    async getDownloadingHint(moduleModel: string) {
        let coreDownloadingHint: string;
        switch(moduleModel){
            case 'Air72X':
                coreDownloadingHint = '正在为您拉取最新Air72X固件,请耐心等待';
                return coreDownloadingHint;
            case 'Air10X':
                coreDownloadingHint = '正在为您拉取最新Air10X固件,请耐心等待';
                return coreDownloadingHint;
        }
    }

    // 自动更新用户提示展示
    async updateHintForUser(moduleModel:any){
        const coreDownloadReadyHint:any = this.getDownloadReadyHint(moduleModel);
        await vscode.window.showInformationMessage(coreDownloadReadyHint,{modal:true},'是').then(async result => {
            if (result!==undefined) {
                await this.updateProgressView(result,moduleModel);
            }
           
        });
    
    }

    //更新进度条展示
    async updateProgressView(result: string,moduleModel:any){
        const coreDownloadingHint:any = this.getDownloadingHint(moduleModel);
            if (result==='是') {
                await vscode.window.withProgress({
                    location: ProgressLocation.Notification,
                    title: coreDownloadingHint,
                    cancellable: true,
                }, async (progress, token) => {
                    token.onCancellationRequested(() => {
                        console.log('用户取消了更新');
                    });
                    progress.report({ increment: 0, message: '正在更新...' });
                    progress.report({ increment: 10, message: '正在更新...' });
                    await this.corePullDownload.corePullDownload(moduleModel);

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
}

/**
 * 解析接口获取url更新地址，从远端服务器拉取数据，下载解压缩至core文件存储路径
 */
export class CorePullDownload {
    pluginVariablesInit = new PluginVariablesInit();
    // pluginCoreUpate = new PluginCoreUpate();
    constructor() {
    }

    // 下载远端core到本地
    async corePullDownload(moduleModel:any){
        const pullRequestUrl:any = this.getPullRequestUrl(moduleModel);
        const jsonResult:any = this.getApiJsonFromRemoteServer(pullRequestUrl);
        const sourceUrl:any = this.parseJsonReturnSourceUrl(moduleModel,jsonResult);  //依据传入的不同型号做不同的解析
        const sourceDistPath:any = this.getSourceDistPath(moduleModel,sourceUrl);
        // await this.download(sourceUrl,sourceDistPath);
        await this.unzip(sourceUrl,sourceDistPath);
        await this.deleteRedundantSource(moduleModel,sourceDistPath);
    }

    // 获取更新api接口url
    async getPullRequestUrl(moduleModel:any){
        let requestUrl:any;
        switch(moduleModel){
            case 'Air72X':
                requestUrl = 'https://erp.openluat.com/api/site/product_software_latest?software_type=8910&software_type_2=LUAT';
                return requestUrl;
            case 'Air10X':
                requestUrl = 'https://luatos.com/api/luatools/files';
                return requestUrl;
        }   
    }
    
    // 请求更新api接口，获取json数据
    async  getApiJsonFromRemoteServer (url:any) {
        const response:any = await fetch(url);
        const jsonResult:any = await response.json();
        return jsonResult;
        };

    // 解析接口数据，返回所需下载资源实际url
    async parseJsonReturnSourceUrl(moduleModel:any,jsonData:any){
        let sourceUrl: string;
        switch(moduleModel){
            case 'Air72X':
                sourceUrl = jsonData['data'][0]['software_url'];
                return sourceUrl;
            case 'Air10X':
                const sourceName: string = jsonData['101_lua_lod'];
                sourceUrl = 'http://cdndownload.openluat.com/Luat_tool_src/v2tools/101_lua_lod/' + sourceName;
                return sourceUrl;
        }
    }

    // 依据模块型号及资源url名称，返回下载要保存的目的文件名
    async getSourceDistPath(moduleModel:any,sourceUrl:any){
        const sourcezipName:any = sourceUrl.split('/').reverse()[0];
        let sourceDistPath:any;
        switch(moduleModel){
            case 'Air72X':
                const air72xCorePath = this.pluginVariablesInit.getAir72xCorepath();
                sourceDistPath = path.join(air72xCorePath,sourcezipName);
                return sourceDistPath;
            case 'Air10X':
                const air10xCorePath = this.pluginVariablesInit.getAir10xCorepath();
                sourceDistPath = path.join(air10xCorePath,sourcezipName);
                return sourceDistPath;
        } 
    }

    // 请求服务器执行二进制下载操作
    // async download(url: any, filePath: any) {
    //     let headers:any = {};
    //     headers['Content-Type'] = 'application/octet-stream';
    //     await fetch(url, {
    //         method: 'GET',
    //         headers: headers,
    //     }).then(res => res.buffer()).then(_ => {
    //         fs.writeFileSync(filePath, _, 'binary');
    //     });
    //   }

    // 对下载完毕的zip文件进行解压缩
    async unzip(srcpath:any,distpath:any) {
        await compressing.zip.uncompress(srcpath, distpath)
        .then(() => {
            console.log('unzip','success');
        })
        .catch(err => {
            console.error('unzip',err);
        });
      }
    
    //   清理文件夹内冗余资源
    async deleteRedundantSource(moudleModel:any,distpath:any){
        const files =fs.readdirSync(distpath);
        const pathExtname = await this.pluginVariablesInit.getRegBaseModel(moudleModel);
        files.forEach( async (file, index) => {
        const extname =path.extname(file);
        // 删除解压缩后无关文件干扰
        if (extname !== pathExtname) { 
            if (fs.statSync(path.join(distpath,file)).isFile()) {
                await fs.unlinkSync(path.join(distpath,file));
            }
            else{
                await this.deleteFolderRecursive(path.join(distpath,file));
            }
        }   
        });
    }
    
    // 递归删除文件夹内所有内容
    async deleteFolderRecursive(url:any) {
        if (fs.existsSync(url)) {
            let files = fs.readdirSync(url);
            files.forEach( (file, index) => {
                var curPath = path.join(url, file);
                if (fs.statSync(curPath).isDirectory()) { // recurse
                    this.deleteFolderRecursive(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(url);
        } else {
            console.log('给定的路径不存在，请给出正确的路径');
        }
    }
}