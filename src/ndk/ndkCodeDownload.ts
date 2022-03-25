import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getNdkDefaultPath } from '../variableInterface';
import git = require('isomorphic-git');
import http = require('isomorphic-git/http/node');

const TAG = "[LuatIDE] " + path.basename(__filename) + "";

// let gitOutputChannel: vscode.OutputChannel = vscode.window.createOutputChannel("NDK Update");
let ndkFlag: boolean = true;
// 下载 NDK 代码
async function getNdkCode() {
    console.log(TAG, "\x1b[0;96m[正在下载 NDK 编译环境，请等待......]");
    let dir: any = getNdkDefaultPath();
    let url: string = 'https://gitee.com/openLuat/luatos-ndk.git';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    if (!fs.existsSync(path.join(dir, '.git'))) {
        await vscode.window
            .withProgress(
                {
                    location: vscode.ProgressLocation.Notification,
                    title: `NDK Cloning `,
                    cancellable: false,
                },
                (progress, token) => {
                    progress.report({ increment: 0 });
                    return git.clone({
                        fs,
                        http,
                        dir,
                        url: url,
                        onMessage: console.log,
                        onProgress: (gitProgress) => {
                            progress.report({
                                increment:
                                    (gitProgress.loaded / (gitProgress.total || 100)) * 100,
                                message: "\n\n" + gitProgress.phase,
                            });
                        },
                    });
                }
            ).then(
                () => {
                    vscode.window.showInformationMessage(`NDK 资源更新成功`);
                },
                (error) => {
                    console.error(error);
                    vscode.window.showErrorMessage(`NDK 资源更新失败:${error}`);
                }
            );
    }
    else {
        ndkPullHandle(url, dir);
    }
}

async function ndkPullHandle(url: string, dir: string) {
    // 获取远端最新commit id
    let remoteInfo = await git.getRemoteInfo({
        http,
        url,
    });
    let remoteOid = remoteInfo.refs.heads?.master;
    // 获取本地最新commit id
    let test2 = await git.log({
        fs,
        dir,
    });
    let localOid = test2[0]?.oid;
    if (localOid !== remoteOid) {
        vscode.window
            .withProgress(
                {
                    location: vscode.ProgressLocation.Notification,
                    title: `NDK Pulling `,
                    cancellable: false,
                },
                (progress) => {
                    progress.report({ increment: 0 });
                    return git.fastForward({
                        fs,
                        http,
                        dir,
                        onMessage: console.log,
                        onProgress: (gitProgress) => {
                            progress.report({
                                increment:
                                    (gitProgress.loaded / (gitProgress.total || 100)) * 100,
                                message: "\n\n" + gitProgress.phase,
                            });
                        },
                    });
                }
            ).then(
                () => {
                    vscode.window.showInformationMessage(`NDK 资源更新成功`);
                },
                (error) => {
                    console.error(error);
                    vscode.window.showErrorMessage(`NDK 资源更新失败${error}`);
                }
            );
    }
}

// ndk工程下载检测处理
export async function getNdkProject() {
    if (ndkFlag === false) {
        return;
    }
    if (!fs.existsSync(path.join(getNdkDefaultPath(), '.git'))) {
        await vscode.window.showInformationMessage('NDK工程需要额外的资源(500+MB),是否下载?', { modal: true }, '是').then(async result => {
            if (result === "是") {
                ndkFlag = false;
                await getNdkCode();
                ndkFlag = true;
            }
        });
    }
    else {
        ndkFlag = false;
        await getNdkCode();
        ndkFlag = true;
    }
}
