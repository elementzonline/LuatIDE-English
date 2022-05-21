// 本文件存放活动工程界面描述字符串
import { getPluginConfigActivityProject } from "../plugConfigParse";
import { getProjectConfigMoudlePort } from "./projectConfigParse";

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
    const descStr:string = '模拟器:ON';
    return descStr;
}

// 获取通讯口描述
export function getConnectPort(){
    // 获取当前活动工程的通讯端口
    const activityProjectPath:string = getPluginConfigActivityProject();
    const comport:string = getProjectConfigMoudlePort(activityProjectPath);
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