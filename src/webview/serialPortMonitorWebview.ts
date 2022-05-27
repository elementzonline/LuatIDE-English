// 该文件用于luatide工具集合内内置串口监视器页面
import * as vscode from 'vscode';
import { getSerialPortInfoList, getSerialPortMonitorHtmlPath, getSerialPortMonitorSourcePath } from '../variableInterface';
import * as fs from "fs";
import * as path from "path";

export class SerialPortMonitor {
    constructor(){

    }
    serialPortMonitorPanel: vscode.WebviewPanel | undefined = undefined;

    serialPortMonitor(context:vscode.ExtensionContext){
        const columnToShowIn = vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.viewColumn
        : undefined;
        if (this.serialPortMonitorPanel) {
            this.serialPortMonitorPanel.reveal(columnToShowIn);
            return;
        }
        else{
            this.serialPortMonitorPanel = vscode.window.createWebviewPanel(
                'serialMonitor',
                "SerialMonitor",
                vscode.ViewColumn.Active,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                },
                );
            this.serialPortMonitorPanel.webview.html = this.getWebviewContent();
            this.serialPortMonitorPanel.webview.onDidReceiveMessage(message => this.receiveMessageHandle(message));
             // Reset when the current panel is closed
            this.serialPortMonitorPanel.onDidDispose(
                () => {
                    this.serialPortMonitorPanel = undefined;
                },
                null,
                context.subscriptions
            );
        }
    }

    getWebviewContent(){
        const serialPortMonitorSourcePath = getSerialPortMonitorSourcePath();
        const serialPortMonitorHtmlPath: string = getSerialPortMonitorHtmlPath();
        let homeHtml: string = fs.readFileSync(serialPortMonitorHtmlPath, "utf-8");
        homeHtml = homeHtml.replace(
            /(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g,
            (m, $1, $2) => {
                return (
                    $1 +
                    vscode.Uri.file(path.resolve(serialPortMonitorSourcePath, $2))
                        .with({ scheme: "vscode-resource" })
                        .toString() +
                    '"'
                );
            }
        );
        return homeHtml;
    }

    // 接收前端的数据并处理
    async receiveMessageHandle(message:any){
        switch(message.command){
            case "homePageReady":
                this.serialPortMonitorPanel?.webview.postMessage(
                    {
                        "command":"serialInitData",
                        "text":{
                            "serialNumberList":await getSerialNumberList(),//["COM1","COM2"]
                            "baudRateList": getBaudRateList(), //[9600,115200]
                            "dataBitsList":getDataBitsList(), //[8,7,6,5]
                            "checkDigitList":getCheckDigitList(), //["none","even"]
                            "stopBits":getStopBitsList() //[1,2]
                        }
                    }
                );
                break;
            case "serialNumber":
                setSerialNumber(message.text);
                break;
            case "baudRate":
                setBaudRate(message.text);
                break;
            case "dataBits":
                setDataBits(message.text);
                break;
            case "checkDigit":
                setCheckDigit(message.text);
                break;
            case "stopBits":
                setStopBits(message.text);
                break;
            case "openSerial":
                // 执行打开串口操作
                if (message.text === true) {
                    openSerialPort();
                    // 发送数据给前端
                    sendDataToFrontEnd(this.serialPortMonitorPanel);
                }
                else{
                    closeSerialPort();
                }
                break;
            case "timingTransmission":
                // 执行定时操作功能
                setTimingState(message.text);
                break;
            case "timingPeriod":
                // 设置定时任务周期时间
                setTimingPeriod(message.text);
                break;
            case "sentData":
                // 设置发送内容
                sendDataToHardware(message.text);
                break;
        }
    }


}

// 获取串口监视器可选配置对象
let serialportOptions:any = {
    "path":"COM2",
    "baudRate":115200,
    "dataBits":8,
    "parity":"none",
    "stopBits":1,
    "autoOpen":false,
};

let timingOptions:any = {
    "state":false,
    "timingPeriod":"1000"
};

// 定时操作状态设置
export function setTimingState(data){
    timingOptions.state = data;
}

// 定时操作周期设置
export function setTimingPeriod(data){
    timingOptions.timingPeriod = data;
}

// 设置串口号
export function setSerialNumber(data: number) {
    serialportOptions.path = data;
}

//设置波特率
export function setBaudRate(data: number) {
    serialportOptions.baudRate = data;
}

// 设置数据位
export function setDataBits(data: number) {
    serialportOptions.dataBits = data;
}

// 设置校验位
export function setCheckDigit(data: string) {
    serialportOptions.parity = data;
}

// 设置停止位
export function setStopBits(data: number) {
    serialportOptions.stopBits = data;
}

// 获取串口号列表
export async function getSerialNumberList() {
    const serialNumberList:string[] = await getSerialPortInfoList();
    return serialNumberList;
}

// 获取波特率支持列表
export function getBaudRateList(){
    const baudRateList:string[] = ["110",
    "300",
    "600",
    "1200",
    "2400",
    "4800",
    "9600",
    "14400",
    "19200",
    "38400",
    "56000",
    "57600",
    "115200",
    "128000",
    "230400", 
    "230400",
    "256000",
    "460800",
    "512000",
    "921600",
    "1000000",
    "1152000",
    "1500000",
    "2000000",
    "3000000",
    "6000000"];
    return baudRateList;
}

// 获取数据位支持列表
export function getDataBitsList(){
    const dataBitsList:number[] = [8,7,6,5];
    return dataBitsList;
}

// 获取校验位支持列表
export function getCheckDigitList(){
    const checkDigit:string[] = ["none","even","mark","odd","space"];
    return checkDigit;
}

// 获取停止位列表
export function getStopBitsList(){
    const stopBits:number[] = [1,2];
    return stopBits;
}

// nodejs serialport 获取数据

import { SerialPort } from 'serialport';

let port;

// 执行打开串口数据
export function openSerialPort(){
    port = new SerialPort(serialportOptions);
    port.open(
        function (err) {
            if (err) {
                return console.log('Error opening port: ', err.message);
            }
        }
    );
}

// 执行关闭串口数据
export function closeSerialPort(){
    port.close();
}

// 执行发送数据给前端指令
export function sendDataToFrontEnd(panel){
    port.on('data', function (data) {
        // console.log('Data:', data.toString());
        panel?.webview.postMessage(
            {
                "command":"receiveData",
                "text":data.toString()
            }
        );
    });
    port.on('error', function (error) {
        // console.log(error);
        panel?.webview.postMessage(
            {
                "command":"receiveData",
                "text":error.toString()
            }
        );
    });
}

// 执行发送数据给硬件指令
export function sendDataToHardware(data){
    if (!timingOptions.state){
        port.write(data);
    }
    else{
        setInterval(port.write(data),timingOptions.timingPeriod);
    }
}