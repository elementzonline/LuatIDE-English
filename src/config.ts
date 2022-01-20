// import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
// import { UpdateCore } from './updataCore';
// import { ProgressLocation } from 'vscode';
// import * as compressing from 'compressing';
// import * as fetch from 'node-fetch';


/**
 * 插件变量初始化，管理插件所有的全局变量
 */
export class PluginVariablesInit {
    // 获取数据存储路径
    private appDataPath: any = process.env['APPDATA'];
    // 获取用户扩展路径
    private extensionPath: any = path.join(__dirname, '../.');
    constructor() {

    }

    //获取用户APPDATA路径
    getAppDataPath() {
        const appDataPath: any = process.env['APPDATA'];
        return appDataPath;
    }

    //获取用户LuatIDE数据存储路径
    getLuatIDEDataPath() {
        const plugDataPath: any = path.join(this.appDataPath, 'LuatIDE');
        return plugDataPath;
    }

    //获取用户插件配置文件路径
    getPluginConfigPath() {
        const pluginConfigPath: string = path.join(this.appDataPath, 'LuatIDE', 'luatide_workspace.json');
        return pluginConfigPath;
    }

    // 获取用户历史lib库存储路径
    getHistoryLibPath() {
        const historyLibpath: any = path.join(this.appDataPath, 'LuatIDE', 'LuatideLib');
        return historyLibpath;
    }

    // 获取用户历史demo存储路径
    getHistoryDemoPath() {
        const historyDemopath: any = path.join(this.appDataPath, 'LuatIDE', 'LuatideDemo');
        return historyDemopath;
    }

    // 获取Air72X固件存储路径
    getAir72xCorepath() {
        let air72xCorepath: any = path.join(this.appDataPath, 'LuatIDE', 'LuatideCore', 'Air72X_CORE');
        return air72xCorepath;
    }

    // 依据模块型号获取core路径
    getCorePathBaseModuleModel(moduleModel: any) {
        let corePath: any;
        switch (moduleModel) {
            case 'air72XUX/air82XUX':
                corePath = this.getAir72xCorepath();
                break;
            case 'air101':
                corePath = this.getAir101DefaultCorePath();
                break;
            case 'air103':
                corePath = this.getAir103DefaultCorePath();
                break;
            case 'air105':
                corePath = this.getAir105DefaultCorePath();
                break;
        }
        return corePath;
    }

    // 获取获取Air72X固件版本号正则解析表达式
    getAir72XReg() {
        const reg = /LuatOS-\w{3}_V(\d+)_RDA8910/gi;
        return reg;
    }

    // 获取获取Air101固件版本号正则解析表达式
    getAir101Reg() {
        const reg = /LuatOS-SoC_V(\d+)_AIR101/ig;
        return reg;
    }

    // 获取获取Air101固件版本号正则解析表达式
    getAir103Reg() {
        const reg = /LuatOS-SoC_V(\d+)_AIR103/ig;
        return reg;
    }

    // 获取获取Air101固件版本号正则解析表达式
    getAir105Reg() {
        const reg = /LuatOS-SoC_V(\d+)_AIR105/ig;
        return reg;
    }

    // 依据模块型号获取解析的正则表达式
    getRegBaseModel(moduleModel: any) {
        let reg: any;
        switch (moduleModel) {
            case 'air72XUX/air82XUX':
                reg = this.getAir72XReg();
                break;
            case 'air101':
                reg = this.getAir101Reg();
                break;
            case 'air103':
                reg = this.getAir103Reg();
                break;
            case 'air105':
                reg = this.getAir105Reg();
                break;
        }
        return reg;
    }

    // 获取新闻api接口链接
    async getNewsApi() {
        const newsUrl = 'http://121.40.170.41:30050/api/site/hezhou_news';
        return newsUrl;
    }

    // 获取home主页html路径
    getHomeHtmlPath() {
        const homeHtmlPath: string = path.join(this.extensionPath, 'src', 'webview', 'home', 'index.html');
        return homeHtmlPath;
    }

    // 获取新建project主页资源文件路径
    getProjectSourcePath() {
        const projectSourcePath: string = path.join(this.extensionPath, 'src', 'webview', 'newProject');
        return projectSourcePath;
    }

    // 获取打开工程project主页
    getOpenProjectSourcePath(){
        const projectSourcePath: string = path.join(this.extensionPath, 'src', 'webview', 'importProject');
        return projectSourcePath;
    }

    // 获取project主页资源文件路径
    getHomeSourcePath() {
        const projectSourcePath: string = path.join(this.extensionPath, 'src', 'webview', 'home');
        return projectSourcePath;
    }

    // 获取新建project主页html按钮
    getProjectHtmlPath() {
        const projectHtmlPath: string = path.join(this.extensionPath, 'src', 'webview', 'newProject', 'index.html');
        return projectHtmlPath;
    }

    // 获取打开project主页html按钮
    getOpenProjectHtmlPath() {
        const projectHtmlPath: string = path.join(this.extensionPath, 'src', 'webview', 'importProject', 'index.html');
        return projectHtmlPath;
    }

    // 获取主页LuatIDE logo图标路径
    getLogoPath() {
        const logoPath: string = path.join(this.extensionPath, 'resource', 'image', 'luatideLog.png');
        return logoPath;
    }

    // 获取登录成功状态svg图标路径
    getLoginSuccessPath() {
        const loginSuccessPath: string = path.join(this.extensionPath, 'webview', 'resource', 'loginSuccess.svg');
        return loginSuccessPath;
    }

    // 获取登录失败状态svg图标路径
    getLoginFailedPath() {
        const loginFailedPath: string = path.join(this.extensionPath, 'webview', 'resource', 'loginSuccess.svg');
        return loginFailedPath;
    }

    // 获取home模态框加载的js路径
    getHomeModalBoxPath() {
        const homeModalBoxPath: string = path.join(this.extensionPath, 'webview', 'swiper.js');
        return homeModalBoxPath;
    }

    // 获取Air72X系列main文件默认内容
    getAir72XDefaultMainData() {
        const air72xMainData: string = 'PROJECT = \'test\'\r\nVERSION = \'2.0.0\'\r\nrequire \'log\'\r\nLOG_LEVEL = log.LOGLEVEL_TRACE\r\nrequire \'sys\'\r\n\r\n\r\n\r\nsys.taskInit(function()\r\n\twhile true do\r\n\t\t-- log.info(\'test\',array)\r\n\t\tlog.info(\'Hello world!\')\r\n\t\tsys.wait(1000)\r\n\tend\r\nend)\r\n\r\nsys.init(0, 0)\r\nsys.run()';
        return air72xMainData;
    }

    // 获取Air10X系列main文件默认内容
    getAir10XDefaultMainData() {
        const air10xMainData: string = '-- LuaTools需要PROJECT和VERSION这两个信息\r\nPROJECT = \'helloworld\'\r\nVERSION = \'1.0.0\'\r\n\r\n-- 引入必要的库文件(lua编写), 内部库不需要require\r\nlocal sys = require \'sys\'\r\nlog.info(\'main\', \'hello world\')\r\n\r\nprint(_VERSION)\r\n\r\nsys.timerLoopStart(function()\r\n\tprint(\'hi, LuatOS\')\r\nend, 3000)\r\n-- 用户代码已结束---------------------------------------------\r\n-- 结尾总是这一句\r\nsys.run()\r\n-- sys.run()之后后面不要加任何语句!!!!!';
        return air10xMainData;
    }

    // 获取Air72X默认lib库路径
    getAir72XDefaultLibPath() {
        const air72xDefaultLibPath: string = path.join(this.appDataPath, "LuatIDE", "LuatideLib", "Air72X_LIB");
        return air72xDefaultLibPath;
    }

    // 获取Air72X默认demo
    getAir72XDefaultDemoPath() {
        const air72XDefaultDemoPath: string = path.join(this.appDataPath, "LuatIDE", "LuatideDemo", "Air72X_Demo");
        return air72XDefaultDemoPath;
    }

    // 获取air101默认demo
    getAir101DefaultDemoPath() {
        const air101DefaultDemoPath: string = path.join(this.appDataPath, "LuatIDE", "LuatideDemo", "Air101_Demo");
        return air101DefaultDemoPath;
    }

    // 获取air103默认demo
    getAir103DefaultDemoPath(){
        const air103DefaultDemoPath: string = path.join(this.appDataPath, "LuatIDE", "LuatideDemo", "Air103_Demo");
        return air103DefaultDemoPath;
    }

    // 获取air105默认demo
    getAir105DefaultDemoPath(){
        const air105DefaultDemoPath: string = path.join(this.appDataPath, "LuatIDE", "LuatideDemo", "Air105_Demo");
        return air105DefaultDemoPath;
    }

    // 获取插件支持的模块列表
    getPluginDefaultModuleList() {
        const moduleList: string[] = ["air72XUX/air82XUX", "air72XCX", "air101", "air103", "air105", "simulator"];
        return moduleList;
    }


    // 获取Air72X默认示例demo列表
    getAir72XDefaultExampleList() {
        const demoList: string[] = [];
        const air72XDefaultLatestDemoPath: string = this.getAir72XDefaultLatestDemoPath();
        const files: string[] = fs.readdirSync(air72XDefaultLatestDemoPath);
        for (let index = 0; index < files.length; index++) {
            const element = files[index];
            if (fs.statSync(path.join(air72XDefaultLatestDemoPath,element)).isDirectory()) {
                demoList.push(element);
            }
        }
        return demoList;
    }

    // 获取Air101默认示例demo列表
    getAir101DefaultExampleList() {
        const demoList: string[] = [];
        const air101DefaultDemoPath: string = this.getAir101DefaultDemoPath();
        const files: string[] = fs.readdirSync(air101DefaultDemoPath);
        for (let index = 0; index < files.length; index++) {
            const element = files[index];
            if (fs.statSync(path.join(air101DefaultDemoPath,element)).isDirectory()) {
                demoList.push(element);
            }
        }
        return demoList;
    }

    // 获取Air103默认示例demo列表
    getAir103DefaultExampleList() {
        const demoList: string[] = [];
        const air103DefaultDemoPath: string = this.getAir103DefaultDemoPath();
        const files: string[] = fs.readdirSync(air103DefaultDemoPath);
        for (let index = 0; index < files.length; index++) {
            const element = files[index];
            if (fs.statSync(path.join(air103DefaultDemoPath,element)).isDirectory()) {
                demoList.push(element);
            }
        }
        return demoList;
    }

    // 获取Air105默认示例demo列表
    getAir105DefaultExampleList() {
        const demoList: string[] = [];
        const air105DefaultDemoPath: string = this.getAir105DefaultDemoPath();
        const files: string[] = fs.readdirSync(air105DefaultDemoPath);
        for (let index = 0; index < files.length; index++) {
            const element = files[index];
            if (fs.statSync(path.join(air105DefaultDemoPath,element)).isDirectory()) {
                demoList.push(element);
            }
        }
        return demoList;
    }

    // 获取air72x默认lib库列表
    getAir72XDefaultLibList(){
        const libList: string[] = [];
        const air72XDefaultLibPath:string = this.getAir72XDefaultLibPath();
        const files: string[] = fs.readdirSync(air72XDefaultLibPath);
        for (let index = 0; index < files.length; index++) {
            const element = files[index];
            if (fs.statSync(path.join(air72XDefaultLibPath,element)).isDirectory()) {
                libList.push(element);
            }
        }
        return libList;
    }

    // 获取72x默认core文件存储路径
    getAir72XDefaultCorePath(){
        const air72xDefaultCorePath: string = path.join(this.appDataPath, "LuatIDE", "LuatideCore", "Air72X_CORE");
        return air72xDefaultCorePath;
    }

    // 获取101默认core文件存储路径
    getAir101DefaultCorePath(){
        const air101DefaultCorePath: string = path.join(this.appDataPath, "LuatIDE", "LuatideCore", "Air101_CORE");
        return air101DefaultCorePath;
    }

    // 获取103默认core文件存储路径
    getAir103DefaultCorePath(){
        const air103DefaultCorePath: string = path.join(this.appDataPath, "LuatIDE", "LuatideCore", "Air103_CORE");
        return air103DefaultCorePath;
    }
    
    // 获取105默认core文件存储路径
    getAir105DefaultCorePath(){
        const air105DefaultCorePath: string = path.join(this.appDataPath, "LuatIDE", "LuatideCore", "Air105_CORE");
        return air105DefaultCorePath;
    }

    // 获取air72x默认core文件列表
    getAir72XDefaultCoreList(){
        const coreList: string[] = [];
        const air72XDefaultCorePath:string = this.getAir72XDefaultCorePath();
        const files: string[] = fs.readdirSync(air72XDefaultCorePath);
        for (let index = 0; index < files.length; index++) {
            const element = files[index];
            if (path.extname(path.join(air72XDefaultCorePath,element))==='.pac') {
                coreList.push(element);
            }
        }
        return coreList;
    }

    // 获取air101默认core文件列表
    getAir101DefaultCoreList(){
        const coreList: string[] = [];
        const getAir101DefaultCoreList:string = this.getAir101DefaultCorePath();
        const files: string[] = fs.readdirSync(getAir101DefaultCoreList);
        for (let index = 0; index < files.length; index++) {
            const element = files[index];
            if (path.extname(path.join(getAir101DefaultCoreList,element))==='.soc') {
                coreList.push(element);
            }
        }
        return coreList;
    }

    // 获取air103默认core文件列表
    getAir103DefaultCoreList(){
        const coreList: string[] = [];
        const air103DefaultCorePath:string = this.getAir103DefaultCorePath();
        const files: string[] = fs.readdirSync(air103DefaultCorePath);
        for (let index = 0; index < files.length; index++) {
            const element = files[index];
            if (path.extname(path.join(air103DefaultCorePath,element))==='.soc') {
                coreList.push(element);
            }
        }
        return coreList;
    }

    // 获取air105默认core文件列表
    getAir105DefaultCoreList(){
        const coreList: string[] = [];
        const air105DefaultCorePath:string = this.getAir105DefaultCorePath();
        const files: string[] = fs.readdirSync(air105DefaultCorePath);
        for (let index = 0; index < files.length; index++) {
            const element = files[index];
            if (path.extname(path.join(air105DefaultCorePath,element))==='.soc') {
                coreList.push(element);
            }
        }
        return coreList;
    }

    // 获取air101默认最新corePath路径
    getAir101DefaultLatestCorePath() {
        const air101CorePath: string = this.getAir101DefaultCorePath();
        const coreList: string[] = fs.readdirSync(air101CorePath);
        const reg = this.getAir101Reg();
        let currentVersion = undefined;
        let coreName = '';
        for (let index = 0; index < coreList.length; index++) {
            const currentCoreName: string = coreList[index];
            if (path.extname(currentCoreName) === '.soc') {
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

    // 获取air103默认最新corePath路径
    getAir103DefaultLatestCorePath() {
        const air103CorePath: string = this.getAir103DefaultCorePath();
        const coreList: string[] = fs.readdirSync(air103CorePath);
        const reg = this.getAir103Reg();
        let currentVersion = undefined;
        let coreName = '';
        for (let index = 0; index < coreList.length; index++) {
            const currentCoreName: string = coreList[index];
            if (path.extname(currentCoreName) === '.soc') {
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

    // 获取air105默认最新corePath路径
    getAir105DefaultLatestCorePath() {
        const air105CorePath: string = this.getAir105DefaultCorePath();
        const coreList: string[] = fs.readdirSync(air105CorePath);
        const reg = this.getAir105Reg();
        let currentVersion = undefined;
        let coreName = '';
        for (let index = 0; index < coreList.length; index++) {
            const currentCoreName: string = coreList[index];
            if (path.extname(currentCoreName) === '.soc') {
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

    // 获取air72x默认最新core路径
    getAir72XDefaultLatestCorePath(){
        const air72xCorePath:string = this.getAir72XDefaultCorePath();
        const coreList:string[] = fs.readdirSync(air72xCorePath);
        const reg = this.getAir72XReg();
        let currentVersion = undefined;
        let coreName = '';
        for (let index = 0; index < coreList.length; index++) {
            let currentCoreName:string = coreList[index];
            if (path.extname(currentCoreName) === '.pac') {
                const coreNameVersionArray:any = reg.exec(currentCoreName);
                reg.lastIndex = 0;
                if (coreNameVersionArray !== null && currentVersion === undefined) {
                    currentVersion = coreNameVersionArray[1];
                    coreName = currentCoreName;
                }
                else if (coreNameVersionArray !== null && currentVersion!==undefined && coreNameVersionArray[1] > currentVersion) {
                    currentVersion = coreNameVersionArray[1];
                    coreName = currentCoreName;
                }
            }
            }
        return coreName;
    }

    // 获取airr72x默认最新lib路径
    getAir72XDefaultLatestLibPath(){
        const air72xLibPath:string = this.getAir72XDefaultLibPath();
        const libList:string[] = fs.readdirSync(air72xLibPath);
        const reg = /V([\d\.]+)/gi;
        let currentVersion:string|undefined = undefined;
        for (let index = 0; index < libList.length; index++) {
            const currentLibName:string = libList[index];
            const libNameVersionArray = reg.exec(currentLibName);
            reg.lastIndex = 0;
            if (libNameVersionArray === null) {
                continue;
            }
            else if (currentVersion === undefined) {
                currentVersion = libNameVersionArray[1];
            }
            else if (libNameVersionArray[1] > currentVersion) {
                currentVersion = libNameVersionArray[1];
            }
        }
        const libLatestPath:string = path.join(air72xLibPath,'V'+currentVersion,'lib');
        return libLatestPath;
    }

    // 获取airr72x默认最新demo路径
    getAir72XDefaultLatestDemoPath(){
        const air72xDemoPath:string = this.getAir72XDefaultDemoPath();
        const demoList:string[] = fs.readdirSync(air72xDemoPath);
        const reg = /V([\d\.]+)/gi;
        let currentVersion:string|undefined = undefined;
        for (let index = 0; index < demoList.length; index++) {
            const currentDemoName:string = demoList[index];
            const demoNameVersionArray = reg.exec(currentDemoName);
            reg.lastIndex = 0;
            if (demoNameVersionArray === null) {
                continue;
            }
            else if (currentVersion === undefined) {
                currentVersion = demoNameVersionArray[1];
            }
            else if (demoNameVersionArray[1] > currentVersion) {
                currentVersion = demoNameVersionArray[1];
            }
        }
        const demoLatestPath:string = path.join(air72xDemoPath,'V'+currentVersion);
        return demoLatestPath;
    }

    // 依据模块型号获取文件名后缀
    getExtnameBaseModel(moduleModel: any) {
        let extname: any;
        switch (moduleModel) {
            case 'air72XUX/air82XUX':
                extname = '.pac';
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
        }
        return extname;
    }
}
/**
 * 插件配置初始化，在用户appdata区域生成插件所需data
 */
export class PluginConfigInit {
    private appDataPath: any = process.env['APPDATA'];
    private plugDataPath: any = path.join(this.appDataPath, 'LuatIDE');
    private historyLibpath: any = path.join(this.appDataPath, 'LuatIDE', 'LuatideLib');
    private historyDemopath: any = path.join(this.appDataPath, 'LuatIDE', 'LuatideDemo');
    private air72xDemopath: any = path.join(this.appDataPath, 'LuatIDE', 'LuatideDemo', 'Air72X_DEMO');
    private air101Demopath: any = path.join(this.appDataPath, 'LuatIDE', 'LuatideDemo', 'Air101_DEMO');
    private air103Demopath: any = path.join(this.appDataPath, 'LuatIDE', 'LuatideDemo', 'Air103_DEMO');
    private air105Demopath: any = path.join(this.appDataPath, 'LuatIDE', 'LuatideDemo', 'Air105_DEMO');
    private air72xLibpath: any = path.join(this.appDataPath, 'LuatIDE', 'LuatideLib', 'Air72X_LIB');
    private dataIntroduce: any = path.join(this.appDataPath, 'LuatIDE', '文件夹说明.txt');
    private introduceData: any = '该文件夹为合宙vscode插件LuatIDE的配置保存文件,删除后可能导致插件历史配置丢失,插件不可使用,请谨慎删除';
    private pluginconfigPath: any = path.join(this.appDataPath, 'LuatIDE', 'luatide_workspace.json');
    private uuidPath = path.join(this.appDataPath, 'LuatIDE', 'uuid.txt');
    private corepath = path.join(this.appDataPath, 'LuatIDE', 'LuatideCore');
    private air72xCorepath: any = path.join(this.appDataPath, 'LuatIDE', 'LuatideCore', 'Air72X_CORE');
    private air101Corepath: any = path.join(this.appDataPath, 'LuatIDE', 'LuatideCore', 'Air101_CORE');
    private air103Corepath: any = path.join(this.appDataPath, 'LuatIDE', 'LuatideCore', 'Air103_CORE');
    private air105Corepath: any = path.join(this.appDataPath, 'LuatIDE', 'LuatideCore', 'Air105_CORE');

    constructor() {

    }

    // config实例化
    configInit(){
        this.folderInit(this.plugDataPath);
        this.folderInit(this.historyLibpath);
        this.folderInit(this.historyDemopath);
        this.folderInit(this.air72xDemopath);
        this.folderInit(this.air101Demopath);
        this.folderInit(this.air103Demopath);
        this.folderInit(this.air105Demopath);
        this.folderInit(this.air72xLibpath);
        this.fileInit(this.dataIntroduce);
        this.fileInit(this.pluginconfigPath);
        this.fileInit(this.uuidPath);
        this.folderInit(this.corepath);
        this.folderInit(this.air72xCorepath);
        this.folderInit(this.air101Corepath);
        this.folderInit(this.air103Corepath);
        this.folderInit(this.air105Corepath);
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
            let userToken = uuidv4();
            fs.writeFileSync(this.uuidPath, userToken);
            console.log('userToken', userToken);
            return userToken;
        }
    }

    // 生成插件配置文件
    configJsonGenerator() {
        const configJson: any = {
            version: 2.0,
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