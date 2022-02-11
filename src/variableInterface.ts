import * as path from 'path';
import * as fs from 'fs';

// 获取数据存储路径
let appDataPath: any = process.env['APPDATA'];
// 获取用户扩展路径
let extensionPath: any = path.join(__dirname, '../.');


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

//获取用户插件配置文件路径
export function getPluginConfigPath() {
    const pluginConfigPath: string = path.join(appDataPath, 'LuatIDE', 'luatide_workspace.json');
    return pluginConfigPath;
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

// 获取Air72XUX固件存储路径
export function getAir72XUXCorePath() {
    let getAir72XUXCorepath: any = path.join(appDataPath, 'LuatIDE', 'LuatideCore', 'Air72XUX_CORE');
    return getAir72XUXCorepath;
}

// 获取Air72XUX lib存储路径
export function getAir72XUXLibPath() {
    let getAir72XUXLibPath: any = path.join(appDataPath, 'LuatIDE', 'LuatideLib', 'Air72XUX_LIB');
    return getAir72XUXLibPath;
}

// 获取Air72XUX demo存储路径
export function getAir72XUXDemoPath() {
    let getAir72XUXDemoPath: any = path.join(appDataPath, 'LuatIDE', 'LuatideDemo', 'Air72XUX_DEMO');
    return getAir72XUXDemoPath;
}

// 依据模块型号获取core路径
export function getCorePathBaseModuleModel(moduleModel: any) {
    let corePath: any;
    switch (moduleModel) {
        case 'air72XUX/air82XUX':
            corePath = getAir72XUXCorePath();
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
    }
    return corePath;
}

// 获取获取Air72XUX固件版本号正则解析表达式
export function getAir72XUXReg() {
    const reg = /LuatOS-\w{3}_V(\d+)_RDA8910/gi;
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

// 获取获取Air101固件版本号正则解析表达式
export function getAir105Reg() {
    const reg = /LuatOS-SoC_V(\d+)_AIR105/ig;
    return reg;
}

// 依据模块型号获取解析的正则表达式
export function getRegBaseModel(moduleModel: any) {
    let reg: any;
    switch (moduleModel) {
        case 'air72XUX/air82XUX':
            reg = getAir72XUXReg();
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
    }
    return reg;
}

// 获取新闻api接口链接
export async function getNewsApi() {
    const newsUrl = 'http://121.40.170.41:30050/api/site/hezhou_news';
    return newsUrl;
}

// 获取home主页html路径
export function getHomeHtmlPath() {
    const homeHtmlPath: string = path.join(extensionPath, 'src', 'webview', 'home', 'index.html');
    return homeHtmlPath;
}

// 获取新建project主页资源文件路径
export function getProjectSourcePath() {
    const projectSourcePath: string = path.join(extensionPath, 'src', 'webview', 'newProject');
    return projectSourcePath;
}

// 获取打开工程project资源文件路径
export function getOpenProjectSourcePath() {
    const projectSourcePath: string = path.join(extensionPath, 'src', 'webview', 'importProject');
    return projectSourcePath;
}

// 获取project主页资源文件路径
export function getHomeSourcePath() {
    const projectSourcePath: string = path.join(extensionPath, 'src', 'webview', 'home');
    return projectSourcePath;
}

// 获取新建project主页html按钮
export function getProjectHtmlPath() {
    const projectHtmlPath: string = path.join(extensionPath, 'src', 'webview', 'newProject', 'index.html');
    return projectHtmlPath;
}

// 获取打开project主页html按钮
export function getOpenProjectHtmlPath() {
    const projectHtmlPath: string = path.join(extensionPath, 'src', 'webview', 'importProject', 'index.html');
    return projectHtmlPath;
}

// 获取主页LuatIDE logo图标路径
export function getLogoPath() {
    const logoPath: string = path.join(extensionPath, 'resource', 'image', 'luatideLog.png');
    return logoPath;
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

// 获取home模态框加载的js路径
export function getHomeModalBoxPath() {
    const homeModalBoxPath: string = path.join(extensionPath, 'webview', 'swiper.js');
    return homeModalBoxPath;
}

// 获取Air72XUX系列main文件默认内容
export function getAir72XUXDefaultMainData() {
    const air72XUXMainData: string = 'PROJECT = \'test\'\r\nVERSION = \'2.0.0\'\r\nrequire \'log\'\r\nLOG_LEVEL = log.LOGLEVEL_TRACE\r\nrequire \'sys\'\r\n\r\n\r\n\r\nsys.taskInit(function()\r\n\twhile true do\r\n\t\t-- log.info(\'test\',array)\r\n\t\tlog.info(\'Hello world!\')\r\n\t\tsys.wait(1000)\r\n\tend\r\nend)\r\n\r\nsys.init(0, 0)\r\nsys.run()';
    return air72XUXMainData;
}

// 获取Air10X系列main文件默认内容
export function getAir10XDefaultMainData() {
    const air10xMainData: string = '-- LuaTools需要PROJECT和VERSION这两个信息\r\nPROJECT = \'helloworld\'\r\nVERSION = \'1.0.0\'\r\n\r\n-- 引入必要的库文件(lua编写), 内部库不需要require\r\nlocal sys = require \'sys\'\r\nlog.info(\'main\', \'hello world\')\r\n\r\nprint(_VERSION)\r\n\r\nsys.timerLoopStart(function()\r\n\tprint(\'hi, LuatOS\')\r\nend, 3000)\r\n-- 用户代码已结束---------------------------------------------\r\n-- 结尾总是这一句\r\nsys.run()\r\n-- sys.run()之后后面不要加任何语句!!!!!';
    return air10xMainData;
}

// 获取Air72XUX默认lib库路径
export function getAir72XUXDefaultLibPath() {
    const air72XUXDefaultLibPath: string = path.join(appDataPath, "LuatIDE", "LuatideLib", "Air72XUX_LIB");
    return air72XUXDefaultLibPath;
}

// 获取Air72XUX默认demo
export function getAir72XUXDefaultDemoPath() {
    const air72XUXDefaultDemoPath: string = path.join(appDataPath, "LuatIDE", "LuatideDemo", "Air72XUX_Demo");
    return air72XUXDefaultDemoPath;
}

// 获取air101默认demo
export function getAir101DefaultDemoPath() {
    const air101DefaultDemoPath: string = path.join(appDataPath, "LuatIDE", "LuatideDemo", "Air101_Demo");
    return air101DefaultDemoPath;
}

// 获取air103默认demo
export function getAir103DefaultDemoPath() {
    const air103DefaultDemoPath: string = path.join(appDataPath, "LuatIDE", "LuatideDemo", "Air103_Demo");
    return air103DefaultDemoPath;
}

// 获取air105默认demo
export function getAir105DefaultDemoPath() {
    const air105DefaultDemoPath: string = path.join(appDataPath, "LuatIDE", "LuatideDemo", "Air105_Demo");
    return air105DefaultDemoPath;
}

// 获取插件支持的模块列表
export function getPluginDefaultModuleList() {
    const moduleList: string[] = ["air72XUX/air82XUX", "air72XCX", "air101", "air103", "air105", "simulator", "esp32c3"];
    return moduleList;
}


// 获取Air72XUX默认示例demo列表
export function getAir72XUXDefaultExampleList() {
    const demoList: string[] = [];
    const air72XUXDefaultLatestDemoPath: string|undefined = getAir72XUXDefaultLatestDemoPath();
    if (air72XUXDefaultLatestDemoPath==='') {
        return demoList;
    }
    const files: string[] = fs.readdirSync(air72XUXDefaultLatestDemoPath);
    for (let index = 0; index < files.length; index++) {
        const element = files[index];
        if (fs.statSync(path.join(air72XUXDefaultLatestDemoPath, element)).isDirectory()) {
            demoList.push(element);
        }
    }
    return demoList;
}

// 获取esp32c3默认示例demo列表
export function getEsp32c3DefaultExampleList() {
    const demoList: string[] = [];
    const air101DefaultDemoPath: string = getAir101DefaultDemoPath();
    const files: string[] = fs.readdirSync(air101DefaultDemoPath);
    for (let index = 0; index < files.length; index++) {
        const element = files[index];
        if (fs.statSync(path.join(air101DefaultDemoPath, element)).isDirectory()) {
            demoList.push(element);
        }
    }
    return demoList;
}

// 获取Air101默认示例demo列表
export function getAir101DefaultExampleList() {
    const demoList: string[] = [];
    const air101DefaultDemoPath: string = getAir101DefaultDemoPath();
    const files: string[] = fs.readdirSync(air101DefaultDemoPath);
    for (let index = 0; index < files.length; index++) {
        const element = files[index];
        if (fs.statSync(path.join(air101DefaultDemoPath, element)).isDirectory()) {
            demoList.push(element);
        }
    }
    return demoList;
}

// 获取Air103默认示例demo列表
export function getAir103DefaultExampleList() {
    const demoList: string[] = [];
    const air103DefaultDemoPath: string = getAir103DefaultDemoPath();
    const files: string[] = fs.readdirSync(air103DefaultDemoPath);
    for (let index = 0; index < files.length; index++) {
        const element = files[index];
        if (fs.statSync(path.join(air103DefaultDemoPath, element)).isDirectory()) {
            demoList.push(element);
        }
    }
    return demoList;
}

// 获取Air105默认示例demo列表
export function getAir105DefaultExampleList() {
    const demoList: string[] = [];
    const air105DefaultDemoPath: string = getAir105DefaultDemoPath();
    const files: string[] = fs.readdirSync(air105DefaultDemoPath);
    for (let index = 0; index < files.length; index++) {
        const element = files[index];
        if (fs.statSync(path.join(air105DefaultDemoPath, element)).isDirectory()) {
            demoList.push(element);
        }
    }
    return demoList;
}

// 获取air72XUX默认lib库列表
export function getAir72XUXDefaultLibList() {
    const libList: string[] = [""];
    const air72XUXDefaultLibPath: string = getAir72XUXDefaultLibPath();
    const files: string[] = fs.readdirSync(air72XUXDefaultLibPath);
    for (let index = 0; index < files.length; index++) {
        const element = files[index];
        if (fs.statSync(path.join(air72XUXDefaultLibPath, element)).isDirectory()) {
            libList.push(element);
        }
    }
    return libList;
}

// 获取72XUX默认core文件存储路径
export function getAir72XUXDefaultCorePath() {
    const air72XUXDefaultCorePath: string = path.join(appDataPath, "LuatIDE", "LuatideCore", "Air72XUX_CORE");
    return air72XUXDefaultCorePath;
}

// 获取esp32c3默认core文件存储路径
export function getEsp32c3DefaultCorePath() {
    // esp32c3 demo暂无接口,先使用air101的
    const air101DefaultCorePath: string = path.join(appDataPath, "LuatIDE", "LuatideCore", "Air101_CORE");
    return air101DefaultCorePath;
}

// 获取101默认core文件存储路径
export function getAir101DefaultCorePath() {
    const air101DefaultCorePath: string = path.join(appDataPath, "LuatIDE", "LuatideCore", "Air101_CORE");
    return air101DefaultCorePath;
}

// 获取103默认core文件存储路径
export function getAir103DefaultCorePath() {
    const air103DefaultCorePath: string = path.join(appDataPath, "LuatIDE", "LuatideCore", "Air103_CORE");
    return air103DefaultCorePath;
}

// 获取105默认core文件存储路径
export function getAir105DefaultCorePath() {
    const air105DefaultCorePath: string = path.join(appDataPath, "LuatIDE", "LuatideCore", "Air105_CORE");
    return air105DefaultCorePath;
}

// 获取air72XUX默认core文件列表
export function getAir72XUXDefaultCoreList() {
    const coreList: string[] = [""];
    const air72XUXDefaultCorePath: string = getAir72XUXDefaultCorePath();
    const files: string[] = fs.readdirSync(air72XUXDefaultCorePath);
    for (let index = 0; index < files.length; index++) {
        const element = files[index];
        if (path.extname(path.join(air72XUXDefaultCorePath, element)) === '.pac') {
            coreList.push(element);
        }
    }
    return coreList;
}

// 获取air101默认core文件列表
export function getAir101DefaultCoreList() {
    const coreList: string[] = [""];
    const getAir101DefaultCoreList: string = getAir101DefaultCorePath();
    const files: string[] = fs.readdirSync(getAir101DefaultCoreList);
    for (let index = 0; index < files.length; index++) {
        const element = files[index];
        if (path.extname(path.join(getAir101DefaultCoreList, element)) === '.soc') {
            coreList.push(element);
        }
    }
    return coreList;
}

// 获取air103默认core文件列表
export function getAir103DefaultCoreList() {
    const coreList: string[] = [""];
    const air103DefaultCorePath: string = getAir103DefaultCorePath();
    const files: string[] = fs.readdirSync(air103DefaultCorePath);
    for (let index = 0; index < files.length; index++) {
        const element = files[index];
        if (path.extname(path.join(air103DefaultCorePath, element)) === '.soc') {
            coreList.push(element);
        }
    }
    return coreList;
}

// 获取air105默认core文件列表
export function getAir105DefaultCoreList() {
    const coreList: string[] = [""];
    const air105DefaultCorePath: string = getAir105DefaultCorePath();
    const files: string[] = fs.readdirSync(air105DefaultCorePath);
    for (let index = 0; index < files.length; index++) {
        const element = files[index];
        if (path.extname(path.join(air105DefaultCorePath, element)) === '.soc') {
            coreList.push(element);
        }
    }
    return coreList;
}

// 获取air101默认最新corePath路径
export function getAir101DefaultLatestCorePath() {
    const air101CorePath: string = getAir101DefaultCorePath();
    const coreList: string[] = fs.readdirSync(air101CorePath);
    const reg = getAir101Reg();
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
export function getAir103DefaultLatestCorePath() {
    const air103CorePath: string = getAir103DefaultCorePath();
    const coreList: string[] = fs.readdirSync(air103CorePath);
    const reg = getAir103Reg();
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
export function getAir105DefaultLatestCorePath() {
    const air105CorePath: string = getAir105DefaultCorePath();
    const coreList: string[] = fs.readdirSync(air105CorePath);
    const reg = getAir105Reg();
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

// 获取air72XUX默认最新core名称
export function getAir72XUXDefaultLatestCoreName() {
    const air72XUXCorePath: string = getAir72XUXDefaultCorePath();
    const coreList: string[] = fs.readdirSync(air72XUXCorePath);
    const reg = getAir72XUXReg();
    let currentVersion = undefined;
    let coreName = '';
    for (let index = 0; index < coreList.length; index++) {
        let currentCoreName: string = coreList[index];
        if (path.extname(currentCoreName) === '.pac') {
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

// 获取air72XUX默认最新core完整路径
export function getAir72XUXDefaultLatestCorePath() {
    const air72XUXDefaultLatestCoreName:string = getAir72XUXDefaultLatestCoreName();
    const air72XUXDefaultCorePath:string = getAir72XUXDefaultCorePath();
    let air72XUXDefaultLatestCorePath:string = '';
    if (air72XUXDefaultLatestCoreName!=='') {
        air72XUXDefaultLatestCorePath = path.join(air72XUXDefaultCorePath,air72XUXDefaultLatestCoreName);
    }
    return air72XUXDefaultLatestCorePath;
}

// 获取air72XUX默认最新lib路径
export function getAir72XUXDefaultLatestLibPath() {
    const air72XUXLibPath: string = getAir72XUXDefaultLibPath();
    const libList: string[] = fs.readdirSync(air72XUXLibPath);
    let libLatestPath:string = '';
    if (libList.length===0) {
        return libLatestPath;
    }
    const reg = /V([\d\.]+)/gi;
    let currentVersion: string | undefined = undefined;
    for (let index = 0; index < libList.length; index++) {
        const currentLibName: string = libList[index];
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
    libLatestPath = path.join(air72XUXLibPath, 'V' + currentVersion, 'lib');
    return libLatestPath;
}

// 获取airr72XUX默认最新demo路径
export function getAir72XUXDefaultLatestDemoPath() {
    const air72XUXDemoPath: string = getAir72XUXDefaultDemoPath();
    const demoList: string[] = fs.readdirSync(air72XUXDemoPath);
    let demoLatestPath:string = "";
    if (demoList.length===0) {
        return demoLatestPath;
    }
    const reg = /V([\d\.]+)/gi;
    let currentVersion: string | undefined = undefined;
    for (let index = 0; index < demoList.length; index++) {
        const currentDemoName: string = demoList[index];
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
    demoLatestPath = path.join(air72XUXDemoPath, 'V' + currentVersion);
    return demoLatestPath;
}

// 依据模块型号获取文件名后缀
export function getExtnameBaseModel(moduleModel: any) {
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

// 依据模块型号获取core文件列表
export function getCoreListBaseMoudeleMode(moduleModel: any) {
    let coreList: any;
    switch (moduleModel) {
        case 'air72XUX/air82XUX':
            coreList = getAir72XUXDefaultCoreList();
            break;
        case 'air101':
            coreList = getAir101DefaultCoreList();
            break;
        case 'air103':
            coreList = getAir103DefaultCoreList();
            break;
        case 'air105':
            coreList = getAir105DefaultCoreList();
            break;
        case 'esp32c3':
            coreList = getAir101DefaultCoreList();
            break;
        default:
            coreList = getAir72XUXDefaultCoreList();
    }
    return coreList;
}
// 依据模块型号获取lib文件列表
export function getLibListBaseMoudeleMode(moduleModel: any) {
    let libList: any;
    switch (moduleModel) {
        case 'air72XUX/air82XUX':
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
// 依据模块型号获取example文件列表
export function getExampleListBaseMoudeleMode(moduleModel: any) {
    let exampleList: any;
    switch (moduleModel) {
        case 'air72XUX/air82XUX':
            exampleList = getAir72XUXDefaultExampleList();
            break;
        case 'air101':
            exampleList = getAir101DefaultExampleList();
            break;
        case 'air103':
            exampleList = getAir103DefaultExampleList();
            break;
        case 'air105':
            exampleList = getAir105DefaultExampleList();
            break;
        case 'esp32c3':
            exampleList = getEsp32c3DefaultExampleList();
            break;
        default:
            exampleList = getAir72XUXDefaultExampleList();
    }
    return exampleList;
}