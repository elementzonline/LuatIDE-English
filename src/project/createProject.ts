import * as fs from "fs";
import * as path from "path";
import * as vscode from 'vscode';
import { getAir101DefaultDemoPath, getAir103DefaultDemoPath, getAir105DefaultDemoPath, getAir10XDefaultMainData, getAir72XUXDefaultLatestDemoPath, getAir72XUXDefaultLatestLibPath, getAir72XUXDefaultMainData, getGroupChatQrCodePath, getNdkDefaultDemoPath, getPluginConfigPath } from "../variableInterface";
// import { PluginVariablesInit } from "../config";
// import { PluginJsonParse } from "../plugConfigParse";
import { checkSameProjectExistStatusForPluginConfig, copyDir, createFolder, deleteDirRecursive, getCreateProjectCorepathHandle, getCreateProjectLibpathHandle, getFileForDirRecursion, projectActiveInterfact } from "./projectApi";
// import { ProjectJsonParse } from './projectConfigParse';
import * as ndkProject from "../ndk/ndkProject";
import { getPluginConfigJson, pushPluginConfigProject, setPluginConfigActivityProject } from "../plugConfigParse";
import { generateProjectJson, getprojectConfigInitVersion, pushProjectConfigAppFile, setProjectConfigCorePath, setProjectConfigLibPath, setProjectConfigModuleModel, setProjectConfigProjectType, setProjectConfigVersion } from "./projectConfigParse";

// let pluginVariablesInit = new PluginVariablesInit();
// let pluginJsonParse: any = new PluginJsonParse();
// let projectJsonParse: any = new ProjectJsonParse();
export class CreateProject {
    constructor() {

    }

    // 新建空白工程
    createPureProject(message: any) {
        let createProjectMessage = {
            createProjectName: message.text['projectName'],
            createProjectPath: message.text['projectPath'],
            createProjectModuleModel: message.text['moduleModel'],
            createProjectLibPath: message.text['libPath'],
            createProjectCorePath: message.text['corePath'],
            // createProjectExample: message.text['project_example'],
        };
        const projectType:string = 'pure';
        const createProjectCheckState: boolean = this.createProjectCheck(message);
        if (!createProjectCheckState) { //新建工程必要条件检查未通过
            return false;
        }
        const nameIndex:number = createProjectMessage.createProjectPath.lastIndexOf("\\");
        const createProjectParentPath:string = createProjectMessage.createProjectPath.substring(0,nameIndex);
        // 将新建工程信息插入插件配置文件
        const projectObj = {
            projectPath: createProjectParentPath,
            projectName: createProjectMessage.createProjectName,
        };
        pushPluginConfigProject(projectObj);
        setPluginConfigActivityProject(createProjectMessage.createProjectPath);
        createFolder(createProjectMessage.createProjectPath);
        const mainLuaPath: string = path.join(createProjectMessage.createProjectPath, "main.lua");
        this.createMainLuaData(createProjectMessage.createProjectModuleModel, mainLuaPath);
        generateProjectJson(createProjectMessage.createProjectPath); //初始化写入工程配置文件
        const appFile: string[] | undefined = getFileForDirRecursion(createProjectMessage.createProjectPath);
        if (appFile===undefined) {
            return;
        }
        pushProjectConfigAppFile(appFile,createProjectMessage.createProjectPath);
        const projectConfigVersion: string = getprojectConfigInitVersion();
        setProjectConfigVersion(projectConfigVersion,createProjectMessage.createProjectPath);
        // 获取写入配置文件的实际core路径
        const createProjectCorePath:string = getCreateProjectCorepathHandle(createProjectMessage.createProjectCorePath,createProjectMessage.createProjectModuleModel);
        setProjectConfigCorePath(createProjectCorePath,createProjectMessage.createProjectPath);
        // 获取写入配置文件的实际lib路径
        const createProjectLibPath:string = getCreateProjectLibpathHandle(createProjectMessage.createProjectLibPath,createProjectMessage.createProjectModuleModel);
        setProjectConfigLibPath(createProjectLibPath,createProjectMessage.createProjectPath);
        setProjectConfigModuleModel(createProjectMessage.createProjectModuleModel,createProjectMessage.createProjectPath);
        setProjectConfigProjectType(projectType,createProjectMessage.createProjectPath);
        // vscode.window.showInformationMessage(`工程${createProjectMessage.createProjectName}新建成功，请切换到用户工程查看`, { modal: true });
        projectActiveInterfact(createProjectMessage.createProjectName,createProjectMessage.createProjectPath);
        vscode.commands.executeCommand('luatide-history-project.Project.refresh');
        // vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
    }

    // 新建示例工程
    createExampleProject(message: any) {
        const projectType:string = 'example';
        let createProjectMessage = {
            createProjectName: message.text['projectName'],
            createProjectPath: message.text['projectPath'],
            createProjectModuleModel: message.text['moduleModel'],
            createProjectCorePath: message.text['corePath'],
            createProjectExample: message.text['example'],
        };
        const createProjectCheckState: boolean = this.createProjectCheck(message);
        if (!createProjectCheckState) { //新建工程必要条件检查未通过
            return false;
        }
        const nameIndex:number = createProjectMessage.createProjectPath.lastIndexOf("\\");
        const createProjectParentPath:string = createProjectMessage.createProjectPath.substring(0,nameIndex); 
        // 将新建工程信息插入插件配置文件
        const projectObj = {
            projectPath: createProjectParentPath,
            projectName: createProjectMessage.createProjectName,
        };
        pushPluginConfigProject(projectObj);
        setPluginConfigActivityProject(createProjectMessage.createProjectPath);
        createFolder(createProjectMessage.createProjectPath);
        this.copyDemoToProject(createProjectMessage.createProjectModuleModel, createProjectMessage.createProjectExample,
            createProjectMessage.createProjectPath);
        generateProjectJson(createProjectMessage.createProjectPath);      //初始化写入工程配置文件
        const appFile: string[]|undefined = getFileForDirRecursion(createProjectMessage.createProjectPath);
        if (appFile===undefined) {
            return;
        }
        pushProjectConfigAppFile(appFile,createProjectMessage.createProjectPath);
        const projectConfigVersion: string = getprojectConfigInitVersion();
        setProjectConfigVersion(projectConfigVersion,createProjectMessage.createProjectPath);
        // 获取写入配置文件的实际core路径
        const createProjectCorePath:string = getCreateProjectCorepathHandle(createProjectMessage.createProjectCorePath,createProjectMessage.createProjectModuleModel);
        setProjectConfigCorePath(createProjectCorePath,createProjectMessage.createProjectPath);
        let createProjectLibPath:string;
        // lib库路径初始化写入
        if (createProjectMessage.createProjectModuleModel!=='air101' && createProjectMessage.createProjectModuleModel!=='air103' && createProjectMessage.createProjectModuleModel!=='air105' && createProjectMessage.createProjectModuleModel!=='esp32c3') {
            createProjectLibPath = getAir72XUXDefaultLatestLibPath();
        }
        else{
            createProjectLibPath = '';
        }
        setProjectConfigLibPath(createProjectLibPath,createProjectMessage.createProjectPath);  //示例工程的lib采用最新的lib
        setProjectConfigModuleModel(createProjectMessage.createProjectModuleModel,createProjectMessage.createProjectPath);
        setProjectConfigProjectType(projectType,createProjectMessage.createProjectPath);
        // vscode.window.showInformationMessage(`工程${createProjectMessage.createProjectName}新建成功，请切换到用户工程查看`, { modal: true });
        projectActiveInterfact(createProjectMessage.createProjectName,createProjectMessage.createProjectPath);
        vscode.commands.executeCommand('luatide-history-project.Project.refresh');
        // vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
    }

    // 新建ndk工程
    createNdkProject(message: any) {
        const projectType:string = 'ndk';
        let createProjectMessage = {
            createProjectName: message.text['projectName'],
            createProjectPath: message.text['projectPath'],
            createProjectModuleModel: message.text['moduleModel'],
            createProjectLibPath: message.text['libPath'],
            createProjectCorePath: message.text['corePath'],
            createProjectExample: message.text['example'],
        };
        const createProjectCheckState: boolean = this.createProjectCheck(message);
        if (!createProjectCheckState) { //新建工程必要条件检查未通过
            return false;
        }
        const nameIndex:number = createProjectMessage.createProjectPath.lastIndexOf("\\");
        const createProjectParentPath:string = createProjectMessage.createProjectPath.substring(0,nameIndex); 
        // 将新建工程信息插入插件配置文件
        const projectObj = {
            projectPath: createProjectParentPath,
            projectName: createProjectMessage.createProjectName,
        };
        pushPluginConfigProject(projectObj);
        setPluginConfigActivityProject(createProjectMessage.createProjectPath);
        createFolder(createProjectMessage.createProjectPath);
        if (createProjectMessage.createProjectExample === undefined) {
            vscode.window.showErrorMessage('未检测到ndk工程所需demo文件,NDK工程创建失败');
            return;
        }
        else{
            this.ndkHandler(createProjectMessage.createProjectPath,createProjectMessage.createProjectExample);
        }
        ndkProject.resourceCopyProject(createProjectMessage.createProjectPath);
        generateProjectJson(createProjectMessage.createProjectPath); //初始化写入工程配置文件
        const appFile: string[]|undefined = getFileForDirRecursion(createProjectMessage.createProjectPath);
        if (appFile===undefined) {
            return;
        }
        pushProjectConfigAppFile(appFile,createProjectMessage.createProjectPath);
        const projectConfigVersion: string = getprojectConfigInitVersion();
        setProjectConfigVersion(projectConfigVersion,createProjectMessage.createProjectPath);
         // 获取写入配置文件的实际core路径
         const createProjectCorePath:string = getCreateProjectCorepathHandle(createProjectMessage.createProjectCorePath,createProjectMessage.createProjectModuleModel);
        setProjectConfigCorePath(createProjectCorePath,createProjectMessage.createProjectPath); 
        // 获取写入配置文件的实际lib路径
        const createProjectLibPath:string = getCreateProjectLibpathHandle(createProjectMessage.createProjectLibPath,createProjectMessage.createProjectModuleModel);
        setProjectConfigLibPath(createProjectLibPath,createProjectMessage.createProjectPath);
        setProjectConfigModuleModel(createProjectMessage.createProjectModuleModel,createProjectMessage.createProjectPath);
        setProjectConfigProjectType(projectType,createProjectMessage.createProjectPath);
        // vscode.window.showInformationMessage(`工程${createProjectMessage.createProjectName}新建成功，请切换到用户工程查看`, { modal: true });
        projectActiveInterfact(createProjectMessage.createProjectName,createProjectMessage.createProjectPath);
        vscode.commands.executeCommand('luatide-history-project.Project.refresh');
        // vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
    }

    // 新建ui工程
    createUiProject(message: any) {
        const projectType:string = 'ui';
        let createProjectMessage = {
            createProjectName: message.text['projectName'],
            createProjectPath: message.text['projectPath'],
            createProjectModuleModel: message.text['moduleModel'],
            createProjectLibPath: message.text['libPath'],
            createProjectCorePath: message.text['corePath'],
            // createProjectExample: message.text['project_example'],
        };
        const createProjectCheckState: boolean = this.createProjectCheck(message);
        if (!createProjectCheckState) { //新建工程必要条件检查未通过
            return false;
        }
        const nameIndex:number = createProjectMessage.createProjectPath.lastIndexOf("\\");
        const createProjectParentPath:string = createProjectMessage.createProjectPath.substring(0,nameIndex); 
        // 将新建工程信息插入插件配置文件
        const projectObj = {
            projectPath: createProjectParentPath,
            projectName: createProjectMessage.createProjectName,
        };
        pushPluginConfigProject(projectObj);
        setPluginConfigActivityProject(createProjectMessage.createProjectPath);
        createFolder(createProjectMessage.createProjectPath);
        // const mainLuaPath: string = path.join(createProjectMessage.createProjectPath, "main.lua");
        // this.createMainLuaData(createProjectMessage.createProjectModuleModel, mainLuaPath);
        this.createUiData(createProjectMessage.createProjectPath);
        // vscode.commands.executeCommand('luatide-ui.design');
        generateProjectJson(createProjectMessage.createProjectPath); //初始化写入工程配置文件
        const appFile: string[]|undefined = getFileForDirRecursion(createProjectMessage.createProjectPath);
        if (appFile===undefined) {
            return;
        }
        pushProjectConfigAppFile(appFile,createProjectMessage.createProjectPath);
        const projectConfigVersion: string = getprojectConfigInitVersion();
        setProjectConfigVersion(projectConfigVersion,createProjectMessage.createProjectPath);
        // 获取写入配置文件的实际core路径
        const createProjectCorePath:string = getCreateProjectCorepathHandle(createProjectMessage.createProjectCorePath,createProjectMessage.createProjectModuleModel);
        setProjectConfigCorePath(createProjectCorePath,createProjectMessage.createProjectPath);
        // 获取写入配置文件的实际lib路径
        const createProjectLibPath:string = getCreateProjectLibpathHandle(createProjectMessage.createProjectLibPath,createProjectMessage.createProjectModuleModel);
        setProjectConfigLibPath(createProjectLibPath,createProjectMessage.createProjectPath);
        setProjectConfigModuleModel(createProjectMessage.createProjectModuleModel,createProjectMessage.createProjectPath);
        setProjectConfigProjectType(projectType,createProjectMessage.createProjectPath);
        // vscode.window.showInformationMessage(`工程${createProjectMessage.createProjectName}新建成功，请切换到用户工程查看`, { modal: true });
        projectActiveInterfact(createProjectMessage.createProjectName,createProjectMessage.createProjectPath);
        vscode.commands.executeCommand('luatide-history-project.Project.refresh');
        // vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
    }

    // 工程新建必要条件检查
    createProjectCheck(message: any) {
        const projectName: any = message.text['projectName'];
        const projectPath: any = message.text['projectPath'];
        const projectModule: any = message.text['moduleModel'];
        if (projectName === "" || projectPath === "" || projectModule === "") {
            vscode.window.showErrorMessage("webview数据接收失败!!", { modal: true });
        }
        if (fs.existsSync(projectPath)) {
            vscode.window.showErrorMessage("该路径已存在同名文件，请重新创建工程", { modal: true });
            return false;
        }
        const sameProjectExistStatus: boolean = checkSameProjectExistStatusForPluginConfig(projectName);
        // 检查用户历史工程看工程名称是否重复
        if (sameProjectExistStatus) {
            vscode.window.showErrorMessage("该工程已被建立，不能重新建立", { modal: true });
            return false;
        }
        return true;
    }

    // 向工程中写入初始的main脚本
    createMainLuaData(moduleModel: any, mainLuaPath: any) {
        const air10xMainData: string = getAir10XDefaultMainData();
        switch (moduleModel) {
            case 'air72XUX/air82XUX':
                const air72XUXMainData: string = getAir72XUXDefaultMainData();
                fs.writeFileSync(mainLuaPath, air72XUXMainData);
                break;
            case 'air101':
                fs.writeFileSync(mainLuaPath, air10xMainData);
                break;
            case 'air103':
                fs.writeFileSync(mainLuaPath, air10xMainData);
                break;
            case 'air105':
                fs.writeFileSync(mainLuaPath, air10xMainData);
                break;
            case 'esp32c3':
                // esp32c3 默认demo与air101系列相同
                fs.writeFileSync(mainLuaPath,air10xMainData);  
            default:
                const airMainData: string = getAir72XUXDefaultMainData();
                fs.writeFileSync(mainLuaPath, airMainData);
                break;
        }
    }

    // 向工程中写入初始化的ui工程
    createUiData(projectPath:string){
        const uiData: string = `{
            "device": {
                "width": 480,
                "height": 854
            },
            "screens": [
                {
                    "name": "ScreenA",
                    "layout": {
                        "type": "free",
                        "blocks": [
                            {
                                "width": 362,
                                "height": 79,
                                "name": "LvglButton1",
                                "body": "LvglButton1",
                                "x": 65,
                                "y": 608
                            },
                            {
                                "width": 362,
                                "height": 427,
                                "name": "LvglImg1",
                                "body": "LvglImg1",
                                "x": 65,
                                "y": 184
                            },
                            {
                                "width": 362,
                                "height": 79,
                                "name": "LvglButton2",
                                "body": "LvglButton2",
                                "x": 65,
                                "y": 107
                            }
                        ]
                    }
                }
            ],
            "schema": {
                "LvglButton1": {
                    "comType": "LvglButton",
                    "comConf": {
                        "status": "DEFAULT",
                        "defaultStatus": {
                            "mainPart": {
                                "radius": 4,
                                "bg": {
                                    "color": "#0088FF"
                                },
                                "value": {
                                    "str": "点击加入",
                                    "color": "#FFFFFF",
                                    "letterSpace": 4
                                }
                            }
                        }
                    }
                },
                "LvglImg1": {
                    "comType": "LvglImg",
                    "comConf": {
                        "defaultStatus": {
                            "mainPart": {}
                        },
                        "src": "qrcode.png"
                    }
                },
                "LvglButton2": {
                    "comType": "LvglButton",
                    "comConf": {
                        "status": "DEFAULT",
                        "defaultStatus": {
                            "mainPart": {
                                "radius": 4,
                                "bg": {
                                    "color": "#0088FF"
                                },
                                "value": {
                                    "str": "Hello LuatOS UI",
                                    "color": "#FFFFFF",
                                    "letterSpace": 2
                                }
                            }
                        }
                    }
                }
            }
        }`;
        const mainLuaData:string =`
        ---@diagnostic disable: undefined-global
        --必须在这个位置定义PROJECT和VERSION变量
        --PROJECT：ascii string类型，可以随便定义，只要不使用,就行
        --VERSION：ascii string类型，如果使用Luat物联云平台固件升级的功能，必须按照"X.X.X"定义，X表示1位数字；否则可随便定义
        PROJECT = "UI"
        VERSION = "2.0.0"
        
        --加载日志功能模块，并且设置日志输出等级
        --如果关闭调用log模块接口输出的日志，等级设置为log.LOG_SILENT即可
        require "log"
        LOG_LEVEL = log.LOGLEVEL_TRACE
        
        
        require "sys"
        require "pins"
        require "net"
        require "LCD"
        require "UiDesign"
        
        local function input()
          if lvgl.indev_get_emu_touch ~= nil then
            function keycb()
              menu, home, back = lvgl.indev_get_emu_key()
              if menu > 0 then
                iCool_touchKeyInit(1, 1)
                return
              end
              if home > 0 then
                iCool_touchKeyInit(4, 1)
                return
              end
              if back > 0 then
                iCool_touchKeyInit(2, 1)
                return
              end
            end
            keycb()
            return lvgl.indev_get_emu_touch()
          end
        end
        
        function demo_WindowInit()
            lvglUiInitial()
        end
        
        
        local function init()
            lvgl.init(demo_WindowInit, input)
        end
        
        sys.taskInit(init, nil)
        
        --启动系统框架
        sys.init(0, 0)
        sys.run()
        `;
        const lcdLuaData:string = `
        --- 模块功能：ILI9806E驱动芯片LCD命令配置
        -- @author openLuat
        -- @module ui.mipi_lcd_GC9503V
        -- @license MIT
        -- @copyright openLuat
        -- @release 2021.09.01
        
        --[[
        注意：MIPI接口
        
        module(...,package.seeall)
        ]]
        --[[
        函数名：init
        功能  ：初始化LCD参数
        参数  ：无
        返回值：无
        ]]
        local function init()
            local para =
            {
                width = 480, --分辨率宽度，
                height = 854, --分辨率高度
                bpp = 16, --MIPI LCD直接写16，暂不支持其他配置
                bus = disp.BUS_MIPI, --LCD专用SPI引脚接口，不可修改
                xoffset = 0, --X轴偏移
                yoffset = 0, --Y轴偏移
                freq = 125000000, --mipi时钟最高为500000000
                pinrst = pio.P0_20, --reset，复位引脚,MIPI屏幕必须填写
                pinrs = 0x000300ffff, --mipi不需要rs脚，直接写0x000300ffff
                continue_mode = 1,
                --初始化命令
                --前两个字节表示类型：0001表示延时，0000或者0002表示命令，0003表示数据
                --延时类型：后两个字节表示延时时间（单位毫秒）
                --命令类型：后两个字节命令的值
                --数据类型：后两个字节数据的值
            --现在MIPI LCD 只支持,lane 2线,RGB565格式
               
                initcmd =
                {
        
                    0x000200F0, 0x00030055, 0x000300AA, 0x00030052, 0x00030008, 0x00030000,
        
                    0x000200F6, 0x0003005A, 0x00030087,
        
                    0x000200C1, 0x0003003F,
        
                    0x000200C2, 0x0003000E,
        
                    0x000200C6, 0x000300F8,
        
                    0x000200C9, 0x00030010,
        
                    0x000200CD, 0x00030025,
        
                    0x000200F8, 0x0003008A,
        
                    0x000200AC, 0x00030065,
        
                    0x000200A7, 0x00030047,
        
                    0x000200A0, 0x000300DD,
        
                    0x00020071, 0x00030048,
        
                    0x00020072, 0x00030048,
        
                    0x00020073, 0x00030000, 0x00030044,
        
                    0x00020097, 0x000300EE,
        
                    0x00020083, 0x00030093,
        
                    0x000200A3, 0x00030022,
        
                    0x000200FD, 0x00030028, 0x0003003C, 0x00030000,
        
                    0x000200FA, 0x0003008F, 0x00030000, 0x00030000,
        
                    0x0002009A, 0x000300A2,
        
                    0x0002009B, 0x0003008A,
        
                    0x00020082, 0x00030075, 0x00030075,
        
                    0x000200B1, 0x00030010,
        
                    0x0002007A, 0x00030013, 0x0003001A,
        
                    0x0002007B, 0x00030013, 0x0003001A,
        
                    0x00020064, 0x00030018, 0x00030004, 0x00030003, 0x0003005B, 0x00030003, 0x00030003, 0x00030018, 0x00030003, 0x00030003, 0x0003005C, 0x00030003, 0x00030003, 0x00030010, 0x0003007A, 0x00030010, 0x0003007A,
        
                    0x00020067, 0x00030018, 0x00030006, 0x00030003, 0x00030059, 0x00030003, 0x00030003, 0x00030018, 0x00030005, 0x00030003, 0x0003005A, 0x00030003, 0x00030003, 0x00030010, 0x0003007A, 0x00030010, 0x0003007A,
        
                    0x00020060, 0x00030018, 0x00030007, 0x00030010, 0x0003007A, 0x00030018, 0x00030002, 0x00030010, 0x0003007A,
        
                    0x00020063, 0x00030018, 0x00030002, 0x00030010, 0x0003007A, 0x00030018, 0x00030006, 0x00030010, 0x0003007A,
        
                    0x00020068, 0x00030000, 0x00030008, 0x0003000A, 0x00030008, 0x00030009, 0x00030000, 0x00030000, 0x00030008, 0x0003000A, 0x00030008, 0x00030009, 0x00030000, 0x00030000,
        
                    0x00020069, 0x00030014, 0x00030022, 0x00030014, 0x00030022, 0x00030044, 0x00030022, 0x00030008,
        
                    0x000200D1, 0x00030000, 0x00030000, 0x00030000, 0x0003000F, 0x00030000, 0x0003001C, 0x00030000, 0x0003003D, 0x00030000, 0x0003005B, 0x00030000, 0x0003009F, 0x00030000, 0x000300E0, 0x00030001, 0x00030043, 0x00030001, 0x0003008A, 0x00030001, 0x000300E7, 0x00030002, 0x00030023, 0x00030002, 0x00030075, 0x00030002, 0x000300B1, 0x00030002, 0x000300B3, 0x00030002, 0x000300E7, 0x00030003, 0x0003001A, 0x00030003, 0x00030037, 0x00030003, 0x00030059, 0x00030003, 0x0003006E, 0x00030003, 0x00030089, 0x00030003, 0x00030099, 0x00030003, 0x000300A7, 0x00030003, 0x000300AD, 0x00030003, 0x000300B8, 0x00030003, 0x000300CF, 0x00030003, 0x000300FF,
        
                    0x000200D2, 0x00030000, 0x00030000, 0x00030000, 0x0003000F, 0x00030000, 0x0003001C, 0x00030000, 0x0003003D, 0x00030000, 0x0003005B, 0x00030000, 0x0003009F, 0x00030000, 0x000300E0, 0x00030001, 0x00030043, 0x00030001, 0x0003008A, 0x00030001, 0x000300E7, 0x00030002, 0x00030023, 0x00030002, 0x00030075, 0x00030002, 0x000300B1, 0x00030002, 0x000300B3, 0x00030002, 0x000300E7, 0x00030003, 0x0003001A, 0x00030003, 0x00030037, 0x00030003, 0x00030059, 0x00030003, 0x0003006E, 0x00030003, 0x00030089, 0x00030003, 0x00030099, 0x00030003, 0x000300A7, 0x00030003, 0x000300AD, 0x00030003, 0x000300B8, 0x00030003, 0x000300CF, 0x00030003, 0x000300FF,
        
                    0x000200D3, 0x00030000, 0x00030000, 0x00030000, 0x0003000F, 0x00030000, 0x0003001C, 0x00030000, 0x0003003D, 0x00030000, 0x0003005B, 0x00030000, 0x0003009F, 0x00030000, 0x000300E0, 0x00030001, 0x00030043, 0x00030001, 0x0003008A, 0x00030001, 0x000300E7, 0x00030002, 0x00030023, 0x00030002, 0x00030075, 0x00030002, 0x000300B1, 0x00030002, 0x000300B3, 0x00030002, 0x000300E7, 0x00030003, 0x0003001A, 0x00030003, 0x00030037, 0x00030003, 0x00030059, 0x00030003, 0x0003006E, 0x00030003, 0x00030089, 0x00030003, 0x00030099, 0x00030003, 0x000300A7, 0x00030003, 0x000300AD, 0x00030003, 0x000300B8, 0x00030003, 0x000300CF, 0x00030003, 0x000300FF,
        
                    0x000200D4, 0x00030000, 0x00030000, 0x00030000, 0x0003000F, 0x00030000, 0x0003001C, 0x00030000, 0x0003003D, 0x00030000, 0x0003005B, 0x00030000, 0x0003009F, 0x00030000, 0x000300E0, 0x00030001, 0x00030043, 0x00030001, 0x0003008A, 0x00030001, 0x000300E7, 0x00030002, 0x00030023, 0x00030002, 0x00030075, 0x00030002, 0x000300B1, 0x00030002, 0x000300B3, 0x00030002, 0x000300E7, 0x00030003, 0x0003001A, 0x00030003, 0x00030037, 0x00030003, 0x00030059, 0x00030003, 0x0003006E, 0x00030003, 0x00030089, 0x00030003, 0x00030099, 0x00030003, 0x000300A7, 0x00030003, 0x000300AD, 0x00030003, 0x000300B8, 0x00030003, 0x000300CF, 0x00030003, 0x000300FF,
        
                    0x000200D5, 0x00030000, 0x00030000, 0x00030000, 0x0003000F, 0x00030000, 0x0003001C, 0x00030000, 0x0003003D, 0x00030000, 0x0003005B, 0x00030000, 0x0003009F, 0x00030000, 0x000300E0, 0x00030001, 0x00030043, 0x00030001, 0x0003008A, 0x00030001, 0x000300E7, 0x00030002, 0x00030023, 0x00030002, 0x00030075, 0x00030002, 0x000300B1, 0x00030002, 0x000300B3, 0x00030002, 0x000300E7, 0x00030003, 0x0003001A, 0x00030003, 0x00030037, 0x00030003, 0x00030059, 0x00030003, 0x0003006E, 0x00030003, 0x00030089, 0x00030003, 0x00030099, 0x00030003, 0x000300A7, 0x00030003, 0x000300AD, 0x00030003, 0x000300B8, 0x00030003, 0x000300CF, 0x00030003, 0x000300FF,
        
                    0x000200D6, 0x00030000, 0x00030000, 0x00030000, 0x0003000F, 0x00030000, 0x0003001C, 0x00030000, 0x0003003D, 0x00030000, 0x0003005B, 0x00030000, 0x0003009F, 0x00030000, 0x000300E0, 0x00030001, 0x00030043, 0x00030001, 0x0003008A, 0x00030001, 0x000300E7, 0x00030002, 0x00030023, 0x00030002, 0x00030075, 0x00030002, 0x000300B1, 0x00030002, 0x000300B3, 0x00030002, 0x000300E7, 0x00030003, 0x0003001A, 0x00030003, 0x00030037, 0x00030003, 0x00030059, 0x00030003, 0x0003006E, 0x00030003, 0x00030089, 0x00030003, 0x00030099, 0x00030003, 0x000300A7, 0x00030003, 0x000300AD, 0x00030003, 0x000300B8, 0x00030003, 0x000300CF, 0x00030003, 0x000300FF,
        
                    0x00020011, 0x00030000,
        
                    0x00020029, 0x00030000,
        
        
                    
                },
                --休眠命令
                sleepcmd = {
                    0x00020028,
                    0x00020010,
                },
                --唤醒命令
                wakecmd = {
                    0x00020011,
                    0x00020029,
                }
            }
            disp.init(para)
            disp.clear()
            disp.update()
        end
        
        -- VLCD电压域配置
        pmd.ldoset(15,pmd.LDO_VIBR)
        
        -- 背光配置
        function backlightopen(on)
            if on then
                pins.setup(pio.P0_8,1)
                log.info("mipi_lcd_GC9503V 你打开了背光")
            else
                pins.setup(pio.P0_8,0)
                log.info("mipi_lcd_GC9503V 你关闭了背光")
            end
        end
        backlightopen(true)
        -- 初始化
        init()        
        `;
        const uiLuaData:string = `
        local function objectHide()
        local o = {}
        local tSelf = {}
        setmetatable(o, tSelf)
        tSelf.__index = tSelf
        tSelf.__tostring = function(j)
            return j.self
        end
        tSelf.__tocall = function(j)
            return j.cb
        end
        tSelf.self = nil
        tSelf.cb = function(e) end
        return o
    end
    
    ScreenA = 
    {
        create = nil, 
        LvglButton1 = objectHide(),
        LvglImg1 = objectHide(),
        LvglButton2 = objectHide(),
    }
    
    ----------------------------------------------------------------------------
    --The following is the content of screen: ScreenA
    ---------------------------------------------------------------------------
    ScreenA.create = function()
    
        --This is the BTN_PART_MAIN's style of ScreenA.LvglButton1
        Style_LvglButton1_1=lvgl.style_t()
        lvgl.style_init(Style_LvglButton1_1)
        lvgl.style_set_radius(Style_LvglButton1_1, lvgl.STATE_DEFAULT, 4)
        lvgl.style_set_bg_color(Style_LvglButton1_1, lvgl.STATE_DEFAULT, lvgl.color_hex(0x0088FF))
        lvgl.style_set_value_str(Style_LvglButton1_1, lvgl.STATE_DEFAULT, "点击加入")
        lvgl.style_set_value_color(Style_LvglButton1_1, lvgl.STATE_DEFAULT, lvgl.color_hex(0xFFFFFF))
        lvgl.style_set_value_letter_space(Style_LvglButton1_1, lvgl.STATE_DEFAULT, 4)
    
        --This is the base code of ScreenA.LvglButton1
        ScreenA.LvglButton1.self = lvgl.btn_create(lvgl.scr_act(), nil)
        lvgl.obj_set_size(ScreenA.LvglButton1.self, 362, 79)
        lvgl.obj_align(ScreenA.LvglButton1.self, nil, lvgl.ALIGN_IN_TOP_LEFT, 65, 608)
        lvgl.obj_add_style(ScreenA.LvglButton1.self, lvgl.BTN_PART_MAIN, Style_LvglButton1_1)
    
    
        --This is the IMG_PART_MAIN's style of ScreenA.LvglImg1
        Style_LvglImg1_1=lvgl.style_t()
        lvgl.style_init(Style_LvglImg1_1)
    
        --This is the base code of ScreenA.LvglImg1
        ScreenA.LvglImg1.self = lvgl.img_create(lvgl.scr_act(), nil)
        lvgl.img_set_src(ScreenA.LvglImg1.self, "/lua/qrcode.png")
        lvgl.obj_align(ScreenA.LvglImg1.self, nil, lvgl.ALIGN_IN_TOP_LEFT, 65, 184)
        lvgl.obj_add_style(ScreenA.LvglImg1.self, lvgl.IMG_PART_MAIN, Style_LvglImg1_1)
    
    
        --This is the BTN_PART_MAIN's style of ScreenA.LvglButton2
        Style_LvglButton2_1=lvgl.style_t()
        lvgl.style_init(Style_LvglButton2_1)
        lvgl.style_set_radius(Style_LvglButton2_1, lvgl.STATE_DEFAULT, 4)
        lvgl.style_set_bg_color(Style_LvglButton2_1, lvgl.STATE_DEFAULT, lvgl.color_hex(0x0088FF))
        lvgl.style_set_value_str(Style_LvglButton2_1, lvgl.STATE_DEFAULT, "Hello LuatOS UI")
        lvgl.style_set_value_color(Style_LvglButton2_1, lvgl.STATE_DEFAULT, lvgl.color_hex(0xFFFFFF))
        lvgl.style_set_value_letter_space(Style_LvglButton2_1, lvgl.STATE_DEFAULT, 2)
    
        --This is the base code of ScreenA.LvglButton2
        ScreenA.LvglButton2.self = lvgl.btn_create(lvgl.scr_act(), nil)
        lvgl.obj_set_size(ScreenA.LvglButton2.self, 362, 79)
        lvgl.obj_align(ScreenA.LvglButton2.self, nil, lvgl.ALIGN_IN_TOP_LEFT, 65, 107)
        lvgl.obj_add_style(ScreenA.LvglButton2.self, lvgl.BTN_PART_MAIN, Style_LvglButton2_1)
    end
        `;
        if (!fs.existsSync(path.join(projectPath, ".luatide"))) {
            fs.mkdirSync(path.join(projectPath, ".luatide"));
        }
        // 写入初始化.ui文件
        const mainUiPath: string = path.join(projectPath, ".luatide",'UiDesign.ui');
        fs.writeFileSync(mainUiPath,uiData);
        // 写入初始化main.lua文件
        const mainLuaPath:string = path.join(projectPath,'main.lua');
        fs.writeFileSync(mainLuaPath,mainLuaData);
        // 写入初始化lcd.lua文件
        const lcdLuaPath:string = path.join(projectPath,'LCD.lua');
        fs.writeFileSync(lcdLuaPath,lcdLuaData);
        // copy二维码图片资源文件到目录
        const luatidePngPath:string = getGroupChatQrCodePath();
        const idePngProjectPath:string = path.join(projectPath,'qrcode.png');
        fs.copyFileSync(luatidePngPath,idePngProjectPath);
        // 写入生成代码文件到工程
        const uiDesignLuaPath:string = path.join(projectPath,'UiDesign.lua');
        fs.writeFileSync(uiDesignLuaPath,uiLuaData);
    }
    // 向工程中copy用户所选择的demo
    copyDemoToProject(moduleModel: any, projectDemo: any, projectPath: any) {
        let demoPath: any;
        const projectDemoDistPath: string = projectPath;
        const air101DefaultDemoPath: string = getAir101DefaultDemoPath();
        const air103DefaultDemoPath: string = getAir103DefaultDemoPath();
        const air105DefaultDemoPath: string = getAir105DefaultDemoPath();
        switch (moduleModel) {
            case 'air72XUX/air82XUX':
                const air72XUXDefaultVersionDemoPath: string = getAir72XUXDefaultLatestDemoPath();
                demoPath = path.join(air72XUXDefaultVersionDemoPath, projectDemo);
                copyDir(demoPath, projectDemoDistPath);
                break;
            case 'simulator':
                const simulatorDefaultVersionDemoPath: string = getAir72XUXDefaultLatestDemoPath();
                demoPath = path.join(simulatorDefaultVersionDemoPath, projectDemo);
                copyDir(demoPath, projectDemoDistPath);
                break;
            case 'air101':
                demoPath = path.join(air101DefaultDemoPath, projectDemo);
                copyDir(demoPath, projectDemoDistPath);
                break;
            case 'air103':
                demoPath = path.join(air103DefaultDemoPath, projectDemo);
                copyDir(demoPath, projectDemoDistPath);
                break;
            case 'air105':
                demoPath = path.join(air105DefaultDemoPath, projectDemo);
                copyDir(demoPath, projectDemoDistPath);
                break;
            case 'esp32c3':
                // esp32 demo暂未出来,先使用101的demo
                demoPath = path.join(air101DefaultDemoPath, projectDemo);
                copyDir(demoPath, projectDemoDistPath);
                break;
        }
    }

    // 依据示例demo是否选择确定新建工程类型
    selectCreateProjectType(projectDemo: any) {
        if (projectDemo === "") {
            this.createMainLuaData;
        }
    }

    // 新增工程写入插件配置json文件
    writeProjectToPluginJson(projectName: any, projectPath: any) {
        let userProject: any = {};
        userProject['project_path'] = projectPath;
        userProject['project_name'] = projectName;
        let pluginJson: any = getPluginConfigJson();
        let pluginnJsonObj: any = JSON.parse(pluginJson);
        for (let i = 0; i < pluginJson.length; i++) {
            const element = pluginJson[i];
            if (element['type'] === 'user') {
                // 插件配置用户json对象更新
                pluginnJsonObj['data'][i]['projects'].push(userProject);
                break;
            }
        }
        const pluginJsonData: string = JSON.stringify(pluginnJsonObj, null, '\t');
        const pluginJsonPath: string = getPluginConfigPath();
        fs.writeFileSync(pluginJsonPath, pluginJsonData);
    }

    // 对接收到的ndk数据进行工程环境初始化处理
    ndkHandler(projectPath:string,exampleName:string){
        const ndkDefaultDemoPath:string = getNdkDefaultDemoPath();
        const ndkDefaultDemoAbsolutePath:string = path.join(ndkDefaultDemoPath,exampleName);
        const ndkProjectDemoDistPath: string = projectPath;
        copyDir(ndkDefaultDemoAbsolutePath,ndkProjectDemoDistPath);
        copyDir(path.join(ndkProjectDemoDistPath,'lua'),ndkProjectDemoDistPath);
        deleteDirRecursive(path.join(ndkProjectDemoDistPath,'lua'));
        fs.renameSync(path.join(ndkProjectDemoDistPath,'c'),path.join(ndkProjectDemoDistPath,'ndk'));
    }
}