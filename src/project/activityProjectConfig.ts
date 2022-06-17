// 本文件存放活动工程界面描述字符串
import *  as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { getCurrentPluginConfigActivityProject, getPluginConfigActivityProject } from "../plugConfigParse";
import { extensionPath, getSerialPortInfoList } from "../variableInterface";
import { getProjectConfigMoudlePort, getProjectConfigSimulator, setProjectConfigModulePort} from "./projectConfigParse";

// 获取工程配置描述
export function getactiveProjectConfigDesc(){
    const descStr:string = '工程配置';
    return descStr;
}

// 获取生成量产文件描述
export function getProductionFileDesc(){
    const descStr:string = '生成量产文件';
    return descStr;
}

// 获取ui设计器描述
export function getUiDesignDesc() {
    const descStr:string = 'UI设计器';
    return descStr;
}

// 获取模拟器描述
export function getSimulatorDesc(){
    const activityProjectPath:string = getPluginConfigActivityProject();
    const status:string = getProjectConfigSimulator(activityProjectPath);
    const descStr:string = '模拟器:' + status;
    return descStr;
}

// 获取通讯口描述
export function getConnectPort(){
    // 获取当前活动工程的通讯端口
    const activityProjectPath:string = getPluginConfigActivityProject();
    let comport:string = getProjectConfigMoudlePort(activityProjectPath);
    if(comport === "")
    {
        comport = "Auto";
    }
    const descStr:string = '通讯口:'+comport;
    return descStr;
}

// 获取help帮助描述
export function getHelp(){
    const descStr:string = 'help';
    return descStr;
}

// 获取硬件描述
export function getHardwaveDesc(){
    const descStr:string = '硬件';
    return descStr;
}

// 获取api描述
export function getApiDesc(){
    const descStr:string = "API";
    return descStr;
}

// 获取luatide描述区分标识
export function getDistinguishMark(){
    const markStr:string = 'LuatIDE$ActiviteProject';
    return markStr;
}

// 获取lcd驱动配置描述
export function getLcdDriverDesc(){
    const lcdDriverDesc:string = "LCD驱动配置";
    return lcdDriverDesc;
}

// 获取触摸屏驱动配置描述
export function getTpDriverDesc(){
    const tpDriverDesc:string = "触摸屏驱动配置";
    return tpDriverDesc;
}

// 获取ui工程支持的lcd驱动资源存储路径
export function getLcdDriverSourcePath(){
    const lcdDriverPath:string = path.join(extensionPath,"tools","lcdDriver");
    return lcdDriverPath;
}

// 获取ui工程支持的lcd驱动列表
export function getLcdDriverList(){
    const driverList:string[] = fs.readdirSync(getLcdDriverSourcePath());
    return driverList;
}

//获取活动工程lcd驱动路径
export function getActiveProjectLcdDriverPath(){
    const lcdDriverPath = path.join(getPluginConfigActivityProject(),"LCD.lua");
    return lcdDriverPath;
}

// 获取ui工程支持的tp驱动资源存储路径
export function getTpDriverSourcePath(){
    const lcdDriverPath:string = path.join(extensionPath,"tools","tpDriver");
    return lcdDriverPath;
}

// 获取ui工程支持的tp驱动列表
export function getTpDriverList(){
    const driverList:string[] = fs.readdirSync(getTpDriverSourcePath());
    return driverList;
}

//获取活动工程tp驱动路径
export function getActiveProjectTpDriverPath(){
    const lcdDriverPath = path.join(getPluginConfigActivityProject(),"UiTp.lua");
    return lcdDriverPath;
}

// lcd驱动设置处理
export function lcdDriverSettingHandler(){
    vscode.window.showQuickPick(
        getLcdDriverList(),
        {
            canPickMany:false,
            ignoreFocusOut:true,
            matchOnDescription:true,
            matchOnDetail:true,
            placeHolder:'请选择您所需要配置的LCD驱动文件'
        })
        .then(function(msg){
            // console.log(msg);
            // 执行copy动作
            if (msg===undefined) {
                return;
            }
            fs.copyFileSync(path.join(getLcdDriverSourcePath(),msg),getActiveProjectLcdDriverPath());
            vscode.commands.executeCommand("vscode.open",vscode.Uri.file(getActiveProjectLcdDriverPath()));
    });
}

// tp驱动设置处理
export function tpDriverSettingHandler(){
    vscode.window.showQuickPick(
        getTpDriverList(),
        {
            canPickMany:false,
            ignoreFocusOut:true,
            matchOnDescription:true,
            matchOnDetail:true,
            placeHolder:'请选择您所需要配置的触摸屏驱动文件'
        })
        .then(function(msg){
            // console.log(msg);
            // 执行copy动作
            if (msg===undefined) {
                return;
            }
            fs.copyFileSync(path.join(getTpDriverSourcePath(),msg),getActiveProjectTpDriverPath());
            vscode.commands.executeCommand("vscode.open",vscode.Uri.file(getActiveProjectTpDriverPath()));
    });
}

export async function portSelectSettingHandler(){
    vscode.window.showQuickPick(
        await getSerialPortInfoList(),
        {
            canPickMany:false,
            ignoreFocusOut:true,
            matchOnDescription:true,
            matchOnDetail:true,
            placeHolder:'请选择您的通信端口'
        })
        .then(function(msg){
            // console.log(msg);
            // 执行copy动作
            if (msg===undefined) {
                return;
            }
            // 接收到modulePort数据处理
            const reg = /\[(\w*)\]/ig;
            const comPortList:string[] | null = reg.exec(msg);
            let comPort:string;
            if (comPortList===null) {
                comPort = "";
            }
            else{
                    comPort = comPortList[1];
            }
            setProjectConfigModulePort(comPort, getCurrentPluginConfigActivityProject());
            vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
            return;
});
}