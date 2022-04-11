
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
        // if (projectConfigJson.projectType === "ui" || projectConfigJson.projectType === "ndk"){
        //     return true;
        // }
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
                            msgOptions = "是否添加 " + tipsToUser + " 文件到下载列表，是：则添加此文件下载，全是：则添加所有文件，全不：则全不添加，否则单次不添加";
                            const downOption = await vscode.window.showInformationMessage(msgOptions, { modal: true }, "是", "全是", "全不");
                            if (downOption === '是') {
                                filesChecked.push(e);
                            } else if (downOption === '全不') {
                                floderAll = "all";
                                fileIgnored.push(e);
                            } else if (downOption === '全是') {
                                floderAll = "none";
                                filesChecked.push(e);
                            } else{
                                fileIgnored.push(e);
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
                msgOptions = "是否添加文件 " + tipsToUser + " 到下载列表，是：添加，否则不添加";
                const downOption = await vscode.window.showInformationMessage(msgOptions, { modal: true }, "是");
                if (downOption === '是') {
                    filesChecked.push(tar);
                } else{
                    fileIgnored.push(tar);
                }
            }
            projectConfigJson.ignore = fileIgnored;
            projectConfigJson.appFile = filesChecked;
            fs.writeFileSync(path.join(curProjectName, "luatide_project.json"), JSON.stringify(projectConfigJson, null, "\t"));
        }
        return true;
    }
    
    async delFiles(tar: any){
        const curProjectName = getPluginConfigActivityProject();
        if (curProjectName === '') {
            return true;
        }

        let projectConfigJson = await JSON.parse(fs.readFileSync(path.join(curProjectName, "luatide_project.json")).toString());

        if (!projectConfigJson.ignore){
            projectConfigJson.ignore = [];
        }

        let filesChecked = projectConfigJson.appFile;
        let fileIgnored = projectConfigJson.ignore;

        if (tar){
            for (let i = 0; i < tar.length; i++){
                let e = tar[i];

                if (filesChecked.includes(e)){
                    filesChecked.splice(filesChecked.indexOf(e), 1);
                }
                if (fileIgnored.includes(e)){
                    fileIgnored.splice(fileIgnored.indexOf(e), 1);
                }
            }
        }
        projectConfigJson.ignore = fileIgnored;
        projectConfigJson.appFile = filesChecked;
        fs.writeFileSync(path.join(curProjectName, "luatide_project.json"), JSON.stringify(projectConfigJson, null, "\t"));

        return true;
    }
}