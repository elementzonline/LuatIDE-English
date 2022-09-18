import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getUiDesignDefaultPath } from '../variableInterface';
import git = require('isomorphic-git');
import http = require('isomorphic-git/http/node');

// let gitOutputChannel: vscode.OutputChannel = vscode.window.createOutputChannel("NDK Update");
let uiDesignFlag: boolean = true;
// 下载  UI设计器 代码
export async function getUiDesignCode() {
    console.log("\x1b[Downloading UI designer environment, please wait...]");
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
                        ref: 'master',
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
                    vscode.window.showInformationMessage(`UI Designer resource updated successfully`);
                },
                (error) => {
                    console.error(error);
                    vscode.window.showErrorMessage(`UI designer resource update failed:${error}`);
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
                        ref: 'master',
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
                    vscode.window.showInformationMessage(`UI Designer resource updated successfully`);
                },
                (error) => {
                    console.error(error);
                    vscode.window.showErrorMessage(`UI designer resource update failed ${error}`);
                }
            );
    }
}

// ui设计器工程下载检测处理
export async function uiProjectCheckUpdate() {
    if (uiDesignFlag === false) {
        return;
    }
    if (!fs.existsSync(path.join(getUiDesignDefaultPath(), '.git'))) {
        await vscode.window.showInformationMessage('UI project requires additional resources (50+MB), download?', { modal: true }, 'Yes').then(async result => {
            if (result === "Yes") {
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
