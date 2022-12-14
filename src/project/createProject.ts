import * as fs from "fs";
import * as path from "path";
import * as vscode from 'vscode';
import {
    getAir101DefaultDemoPath,
    getAir103DefaultDemoPath,
    getAir105DefaultDemoPath,
    getEsp32c3DefaultDemoPath,
    getAir72XUXDefaultLatestDemoPath,
    getAir72XUXDefaultLatestLibPath,
    getGroupChatQrCodePath,
    getNdkDefaultDemoPath,
    getPluginAirModuleList
} from "../variableInterface";
import {
    checkSameProjectExistStatusForPluginConfig,
    copyDir,
    createFolder,
    deleteDirRecursive,
    getCreateProjectCorepathHandle,
    getCreateProjectLibpathHandle,
    getFileForDirRecursion,
    projectActiveInterfact
} from "./projectApi";

import * as ndkProject from "../ndk/ndkProject";
import {
    pushPluginConfigProject,
    setPluginConfigActivityProject
} from "../plugConfigParse";
import {
    generateProjectJson,
    getprojectConfigInitVersion,
    pushProjectConfigAppFile,
    setProjectConfigCorePath,
    setProjectConfigLibPath,
    setProjectConfigModuleModel,
    setProjectConfigProjectName,
    setProjectConfigProjectType,
    setProjectConfigVersion
} from "./projectConfigParse";

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
        // const nameIndex:number = createProjectMessage.createProjectPath.lastIndexOf("\\");
        // const createProjectParentPath:string = createProjectMessage.createProjectPath.substring(0,nameIndex);
        // 将新建工程信息插入插件配置文件
        const projectObj = {
            projectPath: createProjectMessage.createProjectPath,
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
        // 工程名称写入工程配置
        setProjectConfigProjectName(createProjectMessage.createProjectName,createProjectMessage.createProjectPath);
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
        // const nameIndex:number = createProjectMessage.createProjectPath.lastIndexOf("\\");
        // const createProjectParentPath:string = createProjectMessage.createProjectPath.substring(0,nameIndex);
        // 将新建工程信息插入插件配置文件
        const projectObj = {
            projectPath: createProjectMessage.createProjectPath,
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
        const airModuleList:string[] = getPluginAirModuleList();
        if (airModuleList.indexOf(createProjectMessage.createProjectModuleModel)!==-1) {
            createProjectLibPath = getAir72XUXDefaultLatestLibPath();
        }
        else{
            createProjectLibPath = '';
        }
        setProjectConfigLibPath(createProjectLibPath,createProjectMessage.createProjectPath);  //示例工程的lib采用最新的lib
        setProjectConfigModuleModel(createProjectMessage.createProjectModuleModel,createProjectMessage.createProjectPath);
        setProjectConfigProjectType(projectType,createProjectMessage.createProjectPath);
        // 工程名称写入工程配置
        setProjectConfigProjectName(createProjectMessage.createProjectName,createProjectMessage.createProjectPath);
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
        // const nameIndex:number = createProjectMessage.createProjectPath.lastIndexOf("\\");
        // const createProjectParentPath:string = createProjectMessage.createProjectPath.substring(0,nameIndex);
        // 将新建工程信息插入插件配置文件
        const projectObj = {
            projectPath: createProjectMessage.createProjectPath,
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
        // 工程名称写入工程配置
        setProjectConfigProjectName(createProjectMessage.createProjectName,createProjectMessage.createProjectPath);
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
            createProjectDeviceResolution: message.text['deviceResolution']
        };
        const createProjectCheckState: boolean = this.createProjectCheck(message);
        if (!createProjectCheckState) { //新建工程必要条件检查未通过
            return false;
        }
        // const nameIndex:number = createProjectMessage.createProjectPath.lastIndexOf("\\");
        // const createProjectParentPath:string = createProjectMessage.createProjectPath.substring(0,nameIndex);
        // 将新建工程信息插入插件配置文件
        const projectObj = {
            projectPath: createProjectMessage.createProjectPath,
            projectName: createProjectMessage.createProjectName,
        };
        pushPluginConfigProject(projectObj);
        setPluginConfigActivityProject(createProjectMessage.createProjectPath);
        createFolder(createProjectMessage.createProjectPath);
        // const mainLuaPath: string = path.join(createProjectMessage.createProjectPath, "main.lua");
        // this.createMainLuaData(createProjectMessage.createProjectModuleModel, mainLuaPath);
        this.createUiData(createProjectMessage.createProjectPath,createProjectMessage.createProjectDeviceResolution);
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
        // 工程名称写入工程配置
        setProjectConfigProjectName(createProjectMessage.createProjectName,createProjectMessage.createProjectPath);
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
        const air10xMainData: string = '-- LuaTools需要PROJECT和VERSION这两个信息\r\nPROJECT = \'helloworld\'\r\nVERSION = \'1.0.0\'\r\n\r\n-- 引入必要的库文件(lua编写), 内部库不需要require\r\nlocal sys = require \'sys\'\r\nlog.info(\'main\', \'hello world\')\r\n\r\nprint(_VERSION)\r\n\r\nsys.timerLoopStart(function()\r\n\tprint(\'hi, LuatOS\')\r\nend, 3000)\r\n-- 用户代码已结束---------------------------------------------\r\n-- 结尾总是这一句\r\nsys.run()\r\n-- sys.run()之后后面不要加任何语句!!!!!';
        const air72XUXMainData: string = 'PROJECT = \'test\'\r\nVERSION = \'2.0.0\'\r\nrequire \'log\'\r\nLOG_LEVEL = log.LOGLEVEL_TRACE\r\nrequire \'sys\'\r\n\r\n\r\n\r\nsys.taskInit(function()\r\n\twhile true do\r\n\t\t-- log.info(\'test\',array)\r\n\t\tlog.info(\'Hello world!\')\r\n\t\tsys.wait(1000)\r\n\tend\r\nend)\r\n\r\nsys.init(0, 0)\r\nsys.run()';
        switch (moduleModel) {
            case 'air72XUX/air82XUX':
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
                break; 
            default:
                fs.writeFileSync(mainLuaPath, air72XUXMainData);
                break;
        }
    }

    // 向工程中写入初始化的ui工程
    createUiData(projectPath:string,deviceResolution:any){
        const uiData: string = `{
"device": {
    "width": ${deviceResolution.width},
    "height": ${deviceResolution.height}
},
"screens": [
    {
        "name": "ScreenA",
        "layout": {
            "type": "free",
            "blocks": [
                {
                    "width": 362,
                    "height": 427,
                    "name": "LvglImg1",
                    "body": "LvglImg1",
                    "x": 65,
                    "y": 184,
                    "axis": [],
                    "depth": 0
                },
                {
                    "width": 362,
                    "height": 79,
                    "name": "LvglButton1",
                    "body": "LvglButton1",
                    "x": 65,
                    "y": 107,
                    "axis": [],
                    "depth": 0
                },
                {
                    "width": 362,
                    "height": 79,
                    "name": "LvglButton2",
                    "body": "LvglButton2",
                    "x": 65,
                    "y": 608,
                    "axis": [],
                    "depth": 0
                }
            ]
        }
    }
],
"schema": {
    "LvglImg1": {
        "comType": "LvglImg",
        "comConf": {
            "defaultStatus": {
                "mainPart": {}
            },
            "src": "/qrcode.png",
            "natureVal": {
                "width": 362,
                "height": 427
            }
        }
    },
    "LvglButton1": {
        "comType": "LvglButton",
        "comConf": {
            "state": "BTN_STATE_RELEASED",
            "text": "Hello LuatOS UI",
            "defaultStatus": {
                "mainPart": {
                    "radius": 8,
                    "bg": {
                        "color": "#0088FF"
                    },
                    "text": {
                        "font": {
                            "name": "SimSun",
                            "size": 16,
                            "weight": "NORMAL"
                        },
                        "color": "#FFFFFF"
                    }
                }
            },
            "virtualLabel": {
                "comType": "LvglLabel",
                "comConf": {
                    "text": "Hello LuatOS UI",
                    "defaultStatus": {
                        "mainPart": {
                            "text": {
                                "font": {
                                    "name": "SimSun",
                                    "size": 16,
                                    "weight": "NORMAL"
                                },
                                "color": "#FFFFFF"
                            }
                        }
                    }
                }
            }
        }
    },
    "LvglButton2": {
        "comType": "LvglButton",
        "comConf": {
            "state": "BTN_STATE_DEFAULT",
            "text": "点击加入",
            "defaultStatus": {
                "mainPart": {
                    "radius": 8,
                    "bg": {
                        "color": "#0088FF"
                    },
                    "text": {
                        "font": {
                            "name": "SimSun",
                            "size": 16,
                            "weight": "NORMAL"
                        },
                        "color": "#FFFFFF"
                    }
                }
            },
            "virtualLabel": {
                "comType": "LvglLabel",
                "comConf": {
                    "text": "点击加入",
                    "defaultStatus": {
                        "mainPart": {
                            "text": {
                                "font": {
                                    "name": "SimSun",
                                    "size": 16,
                                    "weight": "NORMAL"
                                },
                                "color": "#FFFFFF"
                            }
                        }
                    }
                }
            }
        }
    }
},
"resources": {
    "/qrcode.png": {
        "type": "image",
        "names": [
            "LvglImg1"
        ],
        "width": 362,
        "height": 427
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
        
loader = lvgl.font_load
spi.setup(spi.SPI_1,1,1,8,1000000,1)
font_spi = spi.SPI_1
font_bpp = 2

thick_table = {
    40, 46, 48, 54, 54, 54, 54, 54, 54, 56, 60, 72, 76, 80, 82, 86, 90, 94, 96, 102, 102, 104, 106, 108, 110, 112, 114, 116, 
    118, 120, 124, 126, 128, 130, 136, 140, 150, 160, 170, 180
}

fonTable = {
    light = {},
    normal = {},
    heavy = {}
}

local function normal(s)
    if s % 2 == 1 then s = s - 1 end
    return thick_table[(s - 16) / 2 + 1]
end

local function light(s)
    if s >= 48 then return normal(s) - 25
    else return normal(s) - 20 end
end

local function heavy(s)
    if s >= 48 then return normal(s) + 25
    else return normal(s) + 20 end
end


local function font_load(...)
    args = {...}
    if type(args[1]) == 'string' then
        if args[2] == nil then 
            return loader(args[1]) -- 加载文件
        else
            -- 设计器
            if (fonTable[args[1]][args[2]]) then
                print("=====font_load=====", args[1], args[2])
                return fonTable[args[1]][args[2]]
            end

            if string.find(args[1], 'light') then
                fonTable['light'][args[2]] = loader(font_spi, args[2], font_bpp, light(args[2]))
            elseif string.find(args[1], 'normal') then
                fonTable['normal'][args[2]] = loader(font_spi, args[2], font_bpp, normal(args[2]))
            elseif string.find(args[1], 'heavy') then
                fonTable['heavy'][args[2]] = loader(font_spi, args[2], font_bpp, heavy(args[2]))
            end
            return fonTable[args[1]][args[2]]
        end
    else
        return loader(...) -- 加载矢量字库
    end
end

lvgl.font_load = font_load
require "UiDesign"
require "UiTp"

local function input()
    if lvgl.indev_get_emu_touch ~= nil then
    function keycb()
        menu, home, back = lvgl.indev_get_emu_key()
        if menu > 0 then
        return
        end
        if home > 0 then
        return
        end
        if back > 0 then
        return
        end
    end
    keycb()
    keycode,state=lvgl.indev_get_emu_keycode()
    return lvgl.indev_get_emu_touch()
    end
end

function demo_WindowInit()
    lvglUiInitial()
end


local function init()
    lvgl.init(function() end , UiTp.input)
    demo_WindowInit()
end

sys.taskInit(init, nil)

--启动系统框架
sys.init(0, 0)
sys.run()`;
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
        width = ${deviceResolution.width}, --分辨率宽度，
        height = ${deviceResolution.height}, --分辨率高度
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
init()`;
        const uiLuaData:string = `
----------------------------------------------------------------------------
-- 1. This file automatically generates code for the LuatOS's UI designer
-- 2. In case of accident, modification is strictly prohibited
----------------------------------------------------------------------------
--Import event file
require "UiHandle"

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
	contFather_ScreenA = nil,
	LvglButton1 = objectHide(),
	LvglImg1 = objectHide(),
	LvglButton2 = objectHide(),
}
----------------------------------------------------------------------------
--The following is the content of screen: ScreenA
---------------------------------------------------------------------------
ScreenA.create = function()
	ScreenA.contFather_ScreenA = lvgl.cont_create(lvgl.scr_act(), nil)
	lvgl.obj_set_size(ScreenA.contFather_ScreenA, 480, 854)
	lvgl.obj_align(ScreenA.contFather_ScreenA, nil, lvgl.ALIGN_IN_TOP_LEFT, 0, 0)

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
	lvgl.obj_align(ScreenA.LvglButton1.self, ScreenA.contFather_ScreenA, lvgl.ALIGN_IN_TOP_LEFT, 65, 608)
	lvgl.obj_add_style(ScreenA.LvglButton1.self, lvgl.BTN_PART_MAIN, Style_LvglButton1_1)
	--This is to add callback function for ScreenA.LvglButton1
	--This is callBack function of ScreenA.LvglButton1
	local handleLvglButton1 = function(obj, e)
		ScreenA.LvglButton1.cb(e)
		ScreenA.LvglButton1.cb = function(e)
			if (e == lvgl.EVENT_CLICKED)then
				joinUs()
			end
		end
	end
	lvgl.obj_set_event_cb(ScreenA.LvglButton1.self, handleLvglButton1)


	--This is the IMG_PART_MAIN's style of ScreenA.LvglImg1
	Style_LvglImg1_1=lvgl.style_t()
	lvgl.style_init(Style_LvglImg1_1)

	--This is the base code of ScreenA.LvglImg1
	ScreenA.LvglImg1.self = lvgl.img_create(lvgl.scr_act(), nil)
	lvgl.img_set_src(ScreenA.LvglImg1.self, "/lua/qrcode.png")
	lvgl.obj_set_click(ScreenA.LvglImg1.self, true)
	lvgl.img_set_zoom(ScreenA.LvglImg1.self, 256)
	lvgl.img_set_pivot(ScreenA.LvglImg1.self, 0, 0)
	lvgl.obj_align(ScreenA.LvglImg1.self, ScreenA.contFather_ScreenA, lvgl.ALIGN_IN_TOP_LEFT, 65, 184)
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
	lvgl.obj_align(ScreenA.LvglButton2.self, ScreenA.contFather_ScreenA, lvgl.ALIGN_IN_TOP_LEFT, 65, 107)
	lvgl.obj_add_style(ScreenA.LvglButton2.self, lvgl.BTN_PART_MAIN, Style_LvglButton2_1)
	--This is to add callback function for ScreenA.LvglButton2
	--This is callBack function of ScreenA.LvglButton2
	local handleLvglButton2 = function(obj, e)
		ScreenA.LvglButton2.cb(e)
		ScreenA.LvglButton2.cb = function(e)
			if (e == lvgl.EVENT_CLICKED)then
				reset()
			end
		end
	end
	lvgl.obj_set_event_cb(ScreenA.LvglButton2.self, handleLvglButton2)
end
----------------------------------------------------------------------------
-----------------------This is the Initial of lvglGUI-----------------------
----------------------------------------------------------------------------
function lvglUiInitial()
	ScreenA.create()
end`;
        const uiHandleData:string = `
--This function name and notes cannot be modified
--@@funCfg: <joinUs, exist>
function joinUs()
------------USER CODE DATA--------------
lvgl.style_set_bg_color(Style_LvglButton2_1, lvgl.STATE_DEFAULT, lvgl.color_hex(0xFF0000))
lvgl.style_set_value_str(Style_LvglButton2_1, lvgl.STATE_DEFAULT, "逗你的，还是手机扫码加群一起玩耍吧")
lvgl.style_set_value_color(Style_LvglButton2_1, lvgl.STATE_DEFAULT, lvgl.color_hex(0x1A1A1A))
lvgl.obj_add_style(ScreenA.LvglButton2.self, lvgl.BTN_PART_MAIN, Style_LvglButton2_1)
------------USER CODE DATA--------------
end


--This function name and notes cannot be modified
--@@funCfg: <reset, exist>
function reset()
------------USER CODE DATA--------------
lvgl.style_set_bg_color(Style_LvglButton2_1, lvgl.STATE_DEFAULT, lvgl.color_hex(0x0088FF))
lvgl.style_set_value_str(Style_LvglButton2_1, lvgl.STATE_DEFAULT, "Hello LuatOS UI")
lvgl.obj_add_style(ScreenA.LvglButton2.self, lvgl.BTN_PART_MAIN, Style_LvglButton2_1)
lvgl.style_set_value_color(Style_LvglButton2_1, lvgl.STATE_DEFAULT, lvgl.color_hex(0xFFFFFF))
------------USER CODE DATA--------------
end`;
        const uiTpData:string = `
module(..., package.seeall)
----GT911

require "misc"
require "utils"
require "pins"

local GT911addr = 0x14
local i2cid = 2

local rst = pins.setup(23, 1)
local int = pins.setup(19)

local function init()
    if i2c.setup(i2cid, i2c.SLOW) ~= i2c.SLOW then
        print("i2c.init fail")
        return
    end
    -------------------------初始化-------------------------
    rst(0)
    int(1)
    sys.wait(10)
    rst(1)
    sys.wait(10)
    int(0)
    sys.wait(55)
    sys.wait(50)
end

sys.taskInit(init)

local ispress = false
local last_x, last_y
x = 0
y = 0

iskeypress = false
lastKeypress = false
local keyid = 0
local keycb = nil
function tpkeyprase()
    if iskeypress ~= lastKeypress then
        lastKeypress = iskeypress
        if keycb ~= nil then keycb(2, iskeypress) end
    end
end

function cb(cb)
    log.info("msg2238 cb ")
    keycb = cb
end

function get()
    i2c.send(i2cid, GT911addr, string.char(0x81, 0x4e))
    pressed = i2c.recv(i2cid, GT911addr, 1)
    if pressed:byte() == nil then return false, false, -1, -1 end
    pressed = bit.band(pressed:byte(), 0x0f)
    i2c.send(i2cid, GT911addr, string.char(0x81, 0x4e, 0x00, 0x00))
    if pressed == 0 then
        if ispress == false then return false, false, -1, -1 end

        ispress = false
        -- log.info("ispress x,y ", ispress, x, y)
        return true, ispress, x, y
    end
    i2c.send(i2cid, GT911addr, string.char(0x81, 0x51))
    xh = i2c.recv(i2cid, GT911addr, 1):byte()
    i2c.send(i2cid, GT911addr, string.char(0x81, 0x50))
    xl = i2c.recv(i2cid, GT911addr, 1):byte()

    i2c.send(i2cid, GT911addr, string.char(0x81, 0x53))
    yh = i2c.recv(i2cid, GT911addr, 1):byte()
    i2c.send(i2cid, GT911addr, string.char(0x81, 0x52))
    yl = i2c.recv(i2cid, GT911addr, 1):byte()
    x = xl + (xh * 256)
    y = yl + (yh * 256)
    if ispress == true and last_x == x and last_y == y then
        return false, false, -1, -1
    end
    ispress = true
    last_x = x
    last_y = y
    -- log.info("ispress x,y ", ispress, x, y)
    return true, ispress, x, y
    -- end
end

local data = {type = lvgl.INDEV_TYPE_POINTER}

function input()

    if lvgl.indev_get_emu_touch then
        return lvgl.indev_get_emu_touch()
    end

    pmd.sleep(100)
    local ret, ispress, px, py = get()
    if ret then
        if lastispress == ispress and lastpx == px and lastpy == py then
            return data
        end
        lastispress = ispress
        lastpx = px
        lastpy = py
        if ispress then
            tpstate = lvgl.INDEV_STATE_PR
        else
            tpstate = lvgl.INDEV_STATE_REL
        end
    else
        return data
    end
    data.state = tpstate
    data.point = {x = px, y = py}
    return data
end


-- sys.timerLoopStart(function() 
--     local a=i2c.read(i2cid,0x5051,2)
--     print("a",a)
-- end,50)`;
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
        // 写入初始化uiTp.lua文件
        const uiTpLuaPath:string = path.join(projectPath,'UiTp.lua');
        fs.writeFileSync(uiTpLuaPath,uiTpData);
        // copy二维码图片资源文件到目录
        const luatidePngPath:string = getGroupChatQrCodePath();
        const idePngProjectPath:string = path.join(projectPath,'qrcode.png');
        fs.copyFileSync(luatidePngPath,idePngProjectPath);
        // 写入生成代码文件到工程
        const uiDesignLuaPath:string = path.join(projectPath,'UiDesign.lua');
        fs.writeFileSync(uiDesignLuaPath,uiLuaData);
        const uiHandleLuaPath:string = path.join(projectPath,'UiHandle.lua');
        fs.writeFileSync(uiHandleLuaPath,uiHandleData);
    }
    // 向工程中copy用户所选择的demo
    copyDemoToProject(moduleModel: any, projectDemo: any, projectPath: any) {
        let demoPath: any;
        const projectDemoDistPath: string = projectPath;
        const air101DefaultDemoPath: string = getAir101DefaultDemoPath();
        const air103DefaultDemoPath: string = getAir103DefaultDemoPath();
        const air105DefaultDemoPath: string = getAir105DefaultDemoPath();
        const esp32c3DefaultDemoPath: string = getEsp32c3DefaultDemoPath();
        switch (moduleModel) {
            case 'air72XUX/air82XUX':
                const air72XUXDefaultVersionDemoPath: string = getAir72XUXDefaultLatestDemoPath();
                demoPath = path.join(air72XUXDefaultVersionDemoPath, projectDemo);
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
                demoPath = path.join(esp32c3DefaultDemoPath, projectDemo);
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