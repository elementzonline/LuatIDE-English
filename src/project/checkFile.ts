
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
        let FileIgnored = projectConfigJson.ignore;

        // 检查后的文件数组
        let curChangeFiles: any = [];
        // 待检查文件变化的文件对象
        let fileToDisplay = {};
        fileToDisplay["add"] = [];
        let tipsToUser = "";
        let msgOptions = "";

        if (tar){
            if (Array.isArray(tar)) {
                tar.forEach((e: any) => {
                    fileToDisplay["add"].push(e);
                    if (!e.includes(".") && !e.includes("/") && !e.includes("\\")) {
                        tipsToUser = e;
                        msgOptions = "是否添加 " + tipsToUser + " 文件夹到下载列表，NO 则忽略下载，Cancel则默认下载";
                    }
                });
            } else {
                fileToDisplay["add"].push(tar);
                tipsToUser = path.basename(tar);
                msgOptions = "是否添加文件 " + tipsToUser + " 到下载列表，NO 则忽略下载，Cancel则默认下载";
            }
    
            const downOption = await vscode.window.showInformationMessage(msgOptions, { modal: true }, "Yes", "No");
            if (downOption === 'Yes') {
                fileToDisplay["add"].forEach((e: any) => {
                    // filesChecked.push(e);
                });
            } else if (downOption === 'No') {
                fileToDisplay["add"].forEach((e: any) => {
                    FileIgnored.push(e);
                    filesChecked.splice(filesChecked.indexOf(e), 1);
                });
            } else {
            }
    
            projectConfigJson.ignore = FileIgnored;
            projectConfigJson.appFile = filesChecked;
            fs.writeFileSync(path.join(curProjectName, "luatide_project.json"), JSON.stringify(projectConfigJson));
        }
        return true;
    }   
}