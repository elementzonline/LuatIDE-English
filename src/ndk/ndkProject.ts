/*
 * @Author: your name
 * @Date: 2022-02-17 16:11:48
 * @LastEditTime: 2022-03-25 15:21:07
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \luatide\src\ndk\ndkbuild.ts
 */

import * as vscode from "vscode";
import * as path from 'path'; // 导入fs库和path库
// import * as ndkConfig from './ndkConfig';
import * as fs from 'fs';
import * as childProcess from 'child_process';
const { Subject } = require('await-notify');

import { popProjectConfigAppFile, pushProjectConfigAppFile } from '../project/projectConfigParse';

import { getNdkDefaultPath } from "../variableInterface";

const TAG = "[LuatIDE] " + path.basename(__filename) + "";


export function getExampleList() {

}

// 删除文件夹
function deleteFolder(filePath) {
    if (fs.existsSync(filePath)) {
        const files = fs.readdirSync(filePath);
        files.forEach((file) => {
            const nextFilePath = `${filePath}/${file}`;
            const states = fs.statSync(nextFilePath);
            if (states.isDirectory()) {
                //recurse
                deleteFolder(nextFilePath);
            } else {
                //delete file
                fs.unlinkSync(nextFilePath);
            }
        });
        fs.rmdirSync(filePath);
    }
}

// 拷贝头文件到工程目录
// ndk工程结构就绪之后，json生成之前调用该函数。拷贝头文件到工程目录
export async function resourceCopyProject(activeWorkspace: string) {
    const ndkPath: string = getNdkDefaultPath();
    const cmdPath = path.join(ndkPath, "platform", "Air72x", "core", "copy_to_project.bat " + activeWorkspace, "ndk");

    childProcess.execSync(cmdPath).toString();
    return true;
}


export async function build(activeWorkspace: string) {
    const ndkPath: string = getNdkDefaultPath();
    console.log(TAG, "Start compiling the NDK, please wait");
    console.log(TAG, "ndk project path:", activeWorkspace);
    console.log(TAG, "ndk Compilation tool chain path:", ndkPath);

    let ndkBuildLibPath: string = path.join(activeWorkspace, "ndk", "build", "user.lib");

    popProjectConfigAppFile(ndkBuildLibPath, activeWorkspace);

    // 如果NDK工程中build目录存在，先删除掉，后面通过build目录中的user.lib判断是否编译成功
    let ndkBuildPath: string = path.join(activeWorkspace, "ndk", "build");
    if (fs.existsSync(ndkBuildPath) === true) {
        console.log(TAG, "If the build directory exists, delete the directory");
        deleteFolder(ndkBuildPath);
    }

    // 开始编译
    const pathExeNew = path.join(activeWorkspace, "ndk", "build.bat");
    console.log(TAG, pathExeNew);
    const task = new vscode.Task({ type: 'luatide-task' }, vscode.TaskScope.Global, "LuatIDE", 'NDK build');

    task.execution = new vscode.ShellExecution(pathExeNew, [ndkPath]);
    task.isBackground = false; //true 隐藏日志
    task.presentationOptions = {
        echo: false,
        focus: false,
        clear: true,
        showReuseMessage: true
    };
    vscode.tasks.executeTask(task);

    let taskRunStatus = false;
    // 这里订阅的Task结束事件，不区分Task，所有的的Task的时间都会过来，
    // 所以在用完通知之后需要使用dispose取消订阅
    let onDidEndTaskHand = vscode.tasks.onDidEndTask(function (event: any) {
        console.log(TAG, event);
        if (event.execution._task._name === "LuatIDE" && event.execution._task._source === "NDK build") {
            taskRunStatus = true;
        }
    });


    let timesleep = new Subject();
    while (1) {
        if (taskRunStatus === false) {
            await timesleep.wait(1000);
            console.log(TAG, "Wait for the NDK compilation task to finish!");
        }
        else {
            // 取消订阅这个消息
            onDidEndTaskHand.dispose();
            break;
        }
    }


    // 找一下build目录下有没有user.lib.有的话就是编译成功了,直接返回true
    if (fs.existsSync(ndkBuildLibPath) === false) {
        return false;
    }

    // user.lib存在的话就添加到appfile中
    pushProjectConfigAppFile([path.relative(activeWorkspace, ndkBuildLibPath)], activeWorkspace);
    return true;
}