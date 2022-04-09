
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { getPluginConfigActivityProject } from '../plugConfigParse';

/*
    check the change of the source code
    Add:
        ignore: {
            "file1": true,
            "file2": false,
        }
*/
export class checkFiles {
    constructor() {
    }

    /* 获取工程的配置文件 */
    async getProjectConfigFiles(tar: any) {
        const curProjectName = getPluginConfigActivityProject();
        if (curProjectName === '') {
            return true;
        }

        let projectConfigJson = await JSON.parse(fs.readFileSync(path.join(curProjectName, "luatide_project.json")).toString());

        if (!projectConfigJson.ignore){
            projectConfigJson.ignore = [];
        }
        // 当工程为 Ui 和 NDK 工程时，直接返回
        if (projectConfigJson.projectType === "ui" || projectConfigJson.projectType === "ndk"){
            return true;
        }
        let filesChecked = projectConfigJson.appFile;
        let fileIgnored = projectConfigJson.ignore;

        // 待检查文件变化的文件对象
        let fileToDisplay = {};
        fileToDisplay["add"] = [];
        let tipsToUser = "";
        let msgOptions = "";
        let floderAll = "default";

        if (tar){
            if (Array.isArray(tar)) {
                for (let i = 0; i < tar.length; i++) {
                    let e = tar[i];
                    if (floderAll === "default") {
                        if (e.includes(".")) {
                            tipsToUser = e;
                            msgOptions = "是否忽略 " + tipsToUser + " 文件到下载列表，是：则忽略此文件下载，全是：则忽略所有文件下载，全不：则全部下载否则默认下载";
                            const downOption = await vscode.window.showInformationMessage(msgOptions, { modal: true }, "是", "全是", "全不");
                            if (downOption === '是') {
                                fileIgnored.push(e);
                            } else if (downOption === '全是') {
                                floderAll = "all";
                                fileIgnored.push(e);
                            } else if (downOption === '全不') {
                                floderAll = "none";
                                filesChecked.push(e);
                            } else{
                                filesChecked.push(e);
                            }
                        }
                    } else if (floderAll === "all") {
                        fileIgnored.push(e);
                    } else if (floderAll === "none") {
                        filesChecked.push(e);
                    } else{
                        filesChecked.push(e);
                    }
                }
            } else {
                tipsToUser = path.basename(tar);
                msgOptions = "是否忽略文件 " + tipsToUser + " 到下载列表，是：则忽略下载，否则默认下载";
                const downOption = await vscode.window.showInformationMessage(msgOptions, { modal: true }, "是");
                if (downOption === '是') {
                    fileIgnored.push(tar);
                } else{
                    filesChecked.push(tar);
                }
            }
            projectConfigJson.ignore = fileIgnored;
            projectConfigJson.appFile = filesChecked;
            fs.writeFileSync(path.join(curProjectName, "luatide_project.json"), JSON.stringify(projectConfigJson));
        }
        return true;
    }   
}