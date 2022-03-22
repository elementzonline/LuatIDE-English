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
    getEsp32c3DefaultCorePath,
    getEsp32c3DefaultDemoPath,
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
    private esp32c3Demopath: any = getEsp32c3DefaultDemoPath();
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
    private esp32c3Corepath: any = getEsp32c3DefaultCorePath();

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
        this.folderInit(this.esp32c3Demopath);
        this.folderInit(this.air72XUXLibpath);
        this.fileInit(this.dataIntroduce);
        this.fileInit(this.pluginconfigPath);
        this.fileInit(this.uuidPath);
        this.folderInit(this.corepath);
        this.folderInit(this.air72XUXCorepath);
        this.folderInit(this.air101Corepath);
        this.folderInit(this.air103Corepath);
        this.folderInit(this.air105Corepath);
        this.folderInit(this.esp32c3Corepath);
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