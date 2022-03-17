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


export async function open(mockhand:any) {
    // 启动中端服务
    serverStart();
}






