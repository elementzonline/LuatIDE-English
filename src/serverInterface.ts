/*
 * @Author: czm
 * @Date: 2022-03-16 11:32:34
 * @LastEditTime: 2022-03-17 10:59:56
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
        gSocketHandle = await socketConnect();
        // console.log(TAG, "socket", socketHandle);
        if (gSocketHandle !== null) { return true; }
        console.log(TAG, "socketConnect flase,trying");
        await sleep(100);
    }
    console.log(TAG, "socket too many retries,over");
    // vscode.debug.stopDebugging();
    return false;
}

export async function open(mockhand:any) {
    // 启动中端服务
    serverStart();
    // 连接中端客户端
    if (await serverConnect() === false) { return false; }

    gSocketHandle?.on('close', () => {

        console.log(TAG, ">> client connection closed\n");
        gSocketHandle?.destroy();
        gSocketHandle = null;
    });
    gSocketHandle?.on('end', () => {

        console.log(TAG, '>> client connection end\n');
        gSocketHandle?.destroy();
        gSocketHandle = null;
    });
    gSocketHandle?.on('data', (data: Buffer) => {
        mockhand.serverRecvCb(data);
    });

    return true;
}




