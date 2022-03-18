import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getUiDesignDefaultPath } from '../variableInterface';
import git = require('isomorphic-git');
import http = require('isomorphic-git/http/node');

// let gitOutputChannel: vscode.OutputChannel = vscode.window.createOutputChannel("NDK Update");
let uiDesignFlag: boolean = true;
// 下载 NDK 代码
async function getUiDesignCode() {
    console.log("\x1b[0;96m[正在下载UI设计器环境，请等待......]");
    let dir: any = getUiDesignDefaultPath();
    let url: string = 'https://gitee.com/openLuat/luatos-uidesign.git';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    if (!fs.existsSync(path.join(dir, '.git'))) {
        await vscode.window
            .withProgress(
                {
                    location: vscode.ProgressLocation.Notification,
                    title: `UiDesign Cloning `,
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
                    vscode.window.showInformationMessage(`UI设计器资源更新成功`);
                },
                (error) => {
                    console.error(error);
                    vscode.window.showErrorMessage(`UI设计器资源更新失败:${error}`);
                }
            );
    }
    else {
        uiDesignPullHandle(url,dir);
    }
}

async function uiDesignPullHandle(url:string,dir:string){
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
    if (localOid!==remoteOid) {
        vscode.window
            .withProgress(
                {
                    location: vscode.ProgressLocation.Notification,
                    title: `UiDesign Pulling `,
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
                    vscode.window.showInformationMessage(`UI设计器资源更新成功`);
                },
                (error) => {
                    console.error(error);
                    vscode.window.showErrorMessage(`UI设计器资源更新失败${error}`);
                }
            );
    }
}

// ui设计器工程下载检测处理
export async function uiProjectHandle() {
    if (uiDesignFlag === false) {
        return;
    }
    if (!fs.existsSync(path.join(getUiDesignDefaultPath(), '.git'))) {
        await vscode.window.showInformationMessage('UI工程需要额外的资源(50+MB),是否下载?', { modal: true }, '是').then(async result => {
            if (result === "是") {
                uiDesignFlag = false;
                await getUiDesignCode();
                uiDesignFlag = true;
            }
        });
    }
    else {
        uiDesignFlag = false;
        await getUiDesignCode();
        uiDesignFlag = true;
    }
}
