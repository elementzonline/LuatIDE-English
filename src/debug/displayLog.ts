/*
 * @Author: your name
 * @Date: 2022-04-07 17:47:01
 * @LastEditTime: 2022-04-08 16:31:31
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \luatide\src\debug\displayLog.ts
 */

import * as ansicolor from 'ansicolor';
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";


enum LOGLEVEL {
    trace = 'T',
    debug = 'D',
    info = 'I',
    warn = 'W',
    error = 'E',
    fatal = 'F'
}

// 获取当前时间戳，并解析后格式化输出
function formatConsoleDate(date: any) {
    var year = date.getFullYear();  // 获取完整的年份(4位,1970-????)
    var month = date.getMonth();    // 获取当前月份(0-11,0代表1月)
    var day = date.getDate();
    var hour = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    return year +
        '-' + (month + 1) +
        '-' + day +
        '_' +
        ((hour < 10) ? '0' + hour : hour) +
        '-' +
        ((minutes < 10) ? '0' + minutes : minutes) +
        '-' +
        ((seconds < 10) ? '0' + seconds : seconds);
}

export class LOGOUTPUT {

    private debugConsoleFlag: boolean;
    private outputWindowFlag: boolean;
    private outputFileFlag: boolean;

    private outputWindowChannel: vscode.OutputChannel | null;
    private outputFileName: string;
    private outputFilePath: string;

    constructor() {
        this.debugConsoleFlag = false;
        this.outputWindowFlag = false;
        this.outputFileFlag = false;
        this.outputWindowChannel = null;
        this.outputFileName = "";
        this.outputFilePath = "";
    }
    public debugConsoleEnable() {
        this.debugConsoleFlag = true;
    }
    public outputWindowEnable() {
        // 定义输出日志到输出
        this.outputWindowChannel = vscode.window.createOutputChannel("LuatIDE");
        // 清空历史输出的数据
        this.outputWindowChannel.clear();
        // 设置输出展示，默认值为false，不会显示焦点
        this.outputWindowChannel.show(false);
        this.outputWindowFlag = true;
    }
    public outputFileEnable(outputPath) {
        this.outputFileName = formatConsoleDate(new Date()) + "_log.txt";
        this.outputFilePath = outputPath;
        this.outputFileFlag = true;
    }

    public print(data: string) {
        const reg: any = /\[[TDIWEF]\]-/ig; 
        const resule: any = reg.exec(data);
        let exts: string;
        const regInvisibleCharacter = /[\r\n]|\n$/ig;
        data = data.replace(regInvisibleCharacter,"");
        if (resule !== null) {
            switch (resule[0][1]) {
                case LOGLEVEL.trace:
                    exts = ansicolor.green(data);
                    break;
                case LOGLEVEL.debug:
                    exts = ansicolor.blue(data);
                    break;
                case LOGLEVEL.info:
                    exts = ansicolor.lightGreen(data);
                    break;
                case LOGLEVEL.warn:
                    exts = ansicolor.yellow(data);
                    break;
                case LOGLEVEL.error:
                    exts = ansicolor.magenta(data);
                    break;
                case LOGLEVEL.fatal:
                    exts = ansicolor.red(data);
                    break;
                default:
                    exts = data;
                    break;
            }
        }
        else {
            exts = data;
        }
        if (this.debugConsoleFlag) {
            vscode.debug.activeDebugConsole.appendLine(exts);
        }
        if (this.outputWindowFlag) {
            this.outputWindowChannel?.appendLine(data);
        }

        if (this.outputFileFlag) {
            let outputFile = path.join(this.outputFilePath, ".luatide", "LuatIDE_log", this.outputFileName);
            fs.appendFileSync(outputFile, data + "\r\n");
        }
    }
}