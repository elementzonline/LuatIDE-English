// import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { isEmptyDir } from './project/projectApi';
import { sourceAutoUpdate } from './serverSourceUpdate';
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
    getAir72XUXDefaultLibPath,
    getAppDataPath,
    getDefaultWorkspacePath,
    getHistoryCorePath,
    getHistoryDemoPath,
    getHistoryLibPath,
    getLuatIDEDataPath,
    getPluginConfigPath,
    getUserUUIDPath,
    getAir72XCXDefaultCorePath,
    getAir72XUXDefaultDemoPath,
    getAir72XCXDefaultDemoPath,
    getAir72XCXDefaultLibPath,
    getPlugDependentResourceConfigPath,
    getUiDesignDefaultPath,
    getNdkDefaultPath
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
    private air72XUXDemopath: any = getAir72XUXDefaultDemoPath();
    private air101Demopath: any = getAir101DefaultDemoPath();
    private air103Demopath: any = getAir103DefaultDemoPath();
    private air105Demopath: any = getAir105DefaultDemoPath();
    private esp32c3Demopath: any = getEsp32c3DefaultDemoPath();
    private air72XUXLibpath: any = getAir72XUXDefaultLibPath();
    private dataIntroduce: any = path.join(this.appDataPath, 'LuatIDE', '文件夹说明.txt');
    private introduceData: any = '该文件夹为合宙vscode插件LuatIDE的配置保存文件,删除后可能导致插件历史配置丢失,插件不可使用,请谨慎删除';
    private pluginconfigPath: any = getPluginConfigPath();
    private uuidPath = getUserUUIDPath();
    private corepath = getHistoryCorePath();
    private air72XUXCorepath: any = getAir72XUXDefaultCorePath();
    private air101Corepath: any = getAir101DefaultCorePath();
    private air103Corepath: any = getAir103DefaultCorePath();
    private air105Corepath: any = getAir105DefaultCorePath();
    private esp32c3Corepath: any = getEsp32c3DefaultCorePath();
    private air72XCXCorePath:any = getAir72XCXDefaultCorePath();
    private air72XCXDemoPath:any = getAir72XCXDefaultDemoPath();
    private air72XCXLibPath:any = getAir72XCXDefaultLibPath();
    // public isUserCloseDownloadPage = false;
    private plugDependentResourceConfigPath:any = getPlugDependentResourceConfigPath();
    private plugDependentResourceConfig:any = [
        {
          id: "boardcast",
          name: '板级支持包',
          size: '',
          state:'',
          desc: '使用对应工程所需依赖资源',
          children: [{
            id:"Air72XUX",
            name:'Air72XUX',
            size: '',
            state:"",
            desc: '',
            children:[{
              id:"8910_script",
              name:'Demo/Lib',
              size: '',
              state:'Not Installed',
              desc: '',
              children:[]
          },{
            id:"8910_lua_lod",
              name:'Core',
              size: '',
              state:'Not Installed',
              desc: '',
              children:[]
          }]
          },{
            id:"Air72XCX",
            name:'Air72XCX',
            size: '',
            state:'',
            desc: '',
            children: [{
              id: '1603_script',
              name: 'Demo/Lib',
              size: '',
              state: 'Not Installed',
              desc: '',
              children: []
            }, {
                id: '1603_lua_lod',
                name: 'Core',
                size: '',
                state: 'Not Installed',
                desc: '',
                children: []
          }]
          },
          {
            id:"Air101",
            name:'Air101',
            size: '',
            state:'',
            desc: '',
            children:[
              {
                id: "101_lua_lod",
                name: 'Demo/Core',
                size: '',
                state: 'Not Installed',
                desc: '',
              }
            ]
          },
          {
            id:"Air103",
            name:'Air103',
            size: '',
            state:'',
            desc: '',
            children:[
              {
                id: "103_lua_lod",
                name: 'Demo/Core',
                size: '',
                state: 'Not Installed',
                desc: '',
              }
            ]
          },
          {
            id:"Air105",
            name:'Air105',
            size: '',
            state:'',
            desc: '',
            children:[
              {
                id: '105_lua_lod',
                name: 'Demo/Core',
                size: '',
                state: 'Not Installed',
                desc: '',
              }
            ]
          },
          {
            id:'Esp32C3',
            name:'Esp32C3',
            size: '',
            state:'',
            desc: '',
            children:[
              {
                id: 'esp32c3_lua_lod',
                name: 'Demo/Core',
                size: '',
                state: 'Not Installed',
                desc: '',
              }
            ]
          }
          ]
        },
        {
          id: "工具链",
          name:'工具链',
          size: '',
          state:'',
          desc: '',
          children: [{
                id:"UI designer",
                name:'UI designer',
                size: '50MB+',
                state:'Not Installed',
                desc: 'Necessary resources for UI engineering development'
            },
            {
                id:"NDK",
                name:'NDK',
                size: '500MB+',
                state:'Not Installed',
                desc: 'NDK开发工程必备资源'
            }
            ]
            },
            ];

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
        this.folderInit(this.air72XCXCorePath);
        this.folderInit(this.air72XCXDemoPath);
        this.folderInit(this.air72XCXLibPath);
        this.fileInit(this.plugDependentResourceConfigPath);
    }
    
    // 刷新依赖资源数据
    refreshPlugDependentResourceConfig() {
        let tabledata = JSON.parse(fs.readFileSync(this.plugDependentResourceConfigPath, "utf-8"));
        let sourceStateHanler =  (tabledata): void => {
            // let that = this;
            for (let index = 0; index < tabledata.length; index++) {
              const element = tabledata[index];
              const pluginDependentSourceState = this.getPlugDependentResourceState(element.id);
              if (element.state!=="") {
                if (pluginDependentSourceState) {
                    sourceAutoUpdate(element.id);
                    element.state = "Installed";
                }
                else{
                    element.state = "Not Installed";
                }
            }
              else if (element.children && element.children !== []) {
                sourceStateHanler(element.children);
              }
            }
          };
          sourceStateHanler(tabledata);
          const plugDependentResourceConfigPath = getPlugDependentResourceConfigPath();
          fs.writeFileSync(plugDependentResourceConfigPath,JSON.stringify(tabledata,null,"\t"));
    };
    


        // 获取插件依赖资源安装状态
       public getPlugDependentResourceState(resourceId:string){
            switch (resourceId) {
                case "8910_script":
                    const air72XUXDefaultLibPath = getAir72XUXDefaultLibPath();
                    const air72XUXDemoPath = getAir72XUXDefaultDemoPath();
                    if (isEmptyDir(air72XUXDefaultLibPath) && isEmptyDir(air72XUXDemoPath)) {
                        return false;
                    }
                    else {
                        return true;
                    }
                case "8910_lua_lod":
                    const air72XUXDefaultCorePath = getAir72XUXDefaultCorePath();
                    if (isEmptyDir(air72XUXDefaultCorePath)) {
                        return false;
                    }
                    else {
                        return true;
                    }
                case "1603_script":
                    const air72XCXDefaultLibPath = getAir72XCXDefaultLibPath();
                    const air72XCXDemoPath = getAir72XCXDefaultDemoPath();
                    if (isEmptyDir(air72XCXDefaultLibPath) && isEmptyDir(air72XCXDemoPath)) {
                        return false;
                    }
                    else {
                        return true;
                    }
                case "1603_lua_lod":
                    const air72XCXDefaultCorePath = getAir72XCXDefaultCorePath();
                    if (isEmptyDir(air72XCXDefaultCorePath)) {
                        return false;
                    }
                    else {
                        return true;
                    }
                case "101_lua_lod":
                    const air101DefaultDemoPath = getAir101DefaultDemoPath();
                    const air101DefaultCorePath = getAir101DefaultCorePath();
                    if (isEmptyDir(air101DefaultDemoPath) && isEmptyDir(air101DefaultCorePath)) {
                        return false;
                    }
                    else {
                        return true;
                    }
                case "103_lua_lod":
                    const air103DefaultDemoPath = getAir103DefaultDemoPath();
                    const air103DefaultCorePath = getAir103DefaultCorePath();
                    if (isEmptyDir(air103DefaultDemoPath) && isEmptyDir(air103DefaultCorePath)) {
                        return false;
                    }
                    else {
                        return true;
                    }
                case "105_lua_lod":
                    const air105DefaultDemoPath = getAir105DefaultDemoPath();
                    const air105DefaultCorePath = getAir105DefaultCorePath();
                    if (isEmptyDir(air105DefaultDemoPath) && isEmptyDir(air105DefaultCorePath)) {
                        return false;
                    }
                    else {
                        return true;
                    }
                case "esp32c3_lua_lod":
                    const esp32c3DefaultDemoPath = getEsp32c3DefaultDemoPath();
                    const esp32c3DefaultCorePath = getEsp32c3DefaultCorePath();
                    if (isEmptyDir(esp32c3DefaultDemoPath) && isEmptyDir(esp32c3DefaultCorePath)) {
                        return false;
                    }
                    else {
                        return true;
                    }
                case "UI designer":
                    const uiDesignPath = getUiDesignDefaultPath();
                    if (isEmptyDir(uiDesignPath)) {
                        return false;
                    }
                    else {
                        return true;
                    }
                case "NDK":
                    const ndkPath = getNdkDefaultPath();
                    if (isEmptyDir(ndkPath)) {
                        return false;
                    }
                    else {
                        return true;
                    }
                default:
                    break;
            }
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
            case "luatide_dependentSource.config":
                const plugDependentResouceConfig = this.plugDependentResourceConfig;
                fs.writeFileSync(filePath, JSON.stringify(plugDependentResouceConfig, null, "\t"));
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