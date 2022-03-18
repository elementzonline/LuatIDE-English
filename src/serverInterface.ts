/*
 * @Author: czm
 * @Date: 2022-03-16 11:32:34
 * @LastEditTime: 2022-03-17 15:09:26
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \luatide\src\serverInterface.ts
 */

import * as vscode from "vscode";
import * as path from "path";
import * as net from 'net';

import * as util from 'util';
const sleep = util.promisify(setTimeout);

const TAG = "[LuatIDE] " + path.basename(__filename) + "";

export enum cmdType {
    server = "0",
    dbg = "1",
    at = "2"
}


let gSocketHandle: net.Socket | null = null;
function serverStart() {
    // kill活动终端
    vscode.commands.executeCommand("workbench.action.terminal.kill");
    // 打开调试模式显示到用户工作台
    const serverPath = path.join(__dirname, "..", "luatide_server", "build", "ide_service", "ide_service.exe");
    /*-\NEW\zhw\2021.05.27\日志由控制台输出到文件*/
    console.log(TAG, "serverStart serverPath:", serverPath);

    const isCmd = /cmd.exe$/i.test(vscode.env.shell);
    const invokePrefix = isCmd ? '' : '& ';
    const cmdPrefixSuffix = isCmd ? '"' : '';
    let commandLine = invokePrefix + "'" + serverPath + "'";
    const task = new vscode.Task({ type: 'luatide-task' }, vscode.TaskScope.Global, "LuatIDE", 'Debug Server');
    task.execution = new vscode.ShellExecution(cmdPrefixSuffix + commandLine + cmdPrefixSuffix);
    task.isBackground = false; //true 隐藏日志

    task.presentationOptions = {
        echo: false,
        focus: false,
        clear: true,
        showReuseMessage: true
    };
    vscode.tasks.executeTask(task);
}

async function socketConnect() {
    let socketstat: number = 0;
    const socket = net.connect(21331, '127.0.0.1', () => {
        socketstat = 1;
        console.log(TAG, "socketConnect ok socketstat", socketstat);
    });
    socket.on('error', function (err) {
        socket.destroy();
        socketstat = -1;
        console.log(TAG, "socketConnect err", err);
    });
    for (var i = 0; i < 20; i++) {
        await sleep(100);
        if (socketstat === 1) {
            return socket;
        }
        else if (socketstat === -1) {
            return null;
        }
    }
    return null;
}


async function serverConnect() {

    for (var i = 0; i < 50; i++) {
        let sockethand: net.Socket | null = await socketConnect();
        // console.log(TAG, "socket", socketHandle);
        if (sockethand !== null) { return sockethand; }
        console.log(TAG, "socketConnect flase,trying");
        await sleep(100);
    }
    console.log(TAG, "socket too many retries,over");
    // vscode.debug.stopDebugging();
    return null;
}




export async function open(serverRecvCb: Function|null) {

    if (gSocketHandle !== null) {
        console.log(TAG, "server runing! Duplicate open is not allowed");
        return false;
    }
    // 启动中端服务
    serverStart();
    // 连接中端客户端
    if ((gSocketHandle = await serverConnect()) === null) { return false; }


    gSocketHandle?.on('close', () => {
        console.log(TAG, ">> client connection closed");
        gSocketHandle?.destroy();
        gSocketHandle = null;
    });
    gSocketHandle?.on('end', () => {

        console.log(TAG, '>> client connection end');
        gSocketHandle?.destroy();
        gSocketHandle = null;
    });
    gSocketHandle?.on('data', (data: Buffer) => {
        if (serverRecvCb !== null) {
            serverRecvCb(data);
        }
    });

    return true;
}

export async function close() {
    gSocketHandle?.destroy();
    // 有时候断开连接时后台还有未处理完的任务，不能直接关掉任务终端
    // vscode.commands.executeCommand("workbench.action.terminal.kill");
    return true;
}



export async function sendData(type: cmdType, cmd: string, param: string) {
    if (gSocketHandle === null) {
        console.log(TAG, "设备链接未就绪,无法输出控制命令");
        return;
    }
    let serverCmd: { state: string, command: { cmdstyle: string, param: string } } = { state: type, command: { cmdstyle: cmd, param: param } };
    console.log(TAG, "serverCmd:", serverCmd);
    const cmdStr = JSON.stringify(serverCmd) + '\r\n';
    try {
        gSocketHandle.write(cmdStr, (err: any) => {
            if (err) {
                console.log(TAG, "sendData:", err);
            }
        });
    }
    catch (e) { console.log(TAG, "write:", e); }
    return true;
}
