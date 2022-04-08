
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { getPluginConfigActivityProject } from '../plugConfigParse';

/*
    check the change of the source code
    Add:
        runConfig: {
            "file1": true,
            "file2": false,
        }
*/
export class checkFiles {
    constructor() {
    }

    /* 获取工程的配置文件 */
    async getProjectConfigFiles(){
        const curProjectName = getPluginConfigActivityProject();
        if (curProjectName === '') {
            return true;
        }

        let projectConfigJson = await JSON.parse(fs.readFileSync(path.join(curProjectName, "luatide_project.json")).toString());

        if (Number(projectConfigJson.version) < 2.3){
            // 版本号小于等于 2.2，直接返回
            return true;
        }

        // 当工程为 Ui 和 NDK 工程时，直接返回
        if (projectConfigJson.projectType === "ui" || projectConfigJson.projectType === "ndk"){
            return true;
        }

        if (!projectConfigJson.runConfig){

            // 如果没有配置，则提示是否下载所有文件
            const optionsResult = await vscode.window.showInformationMessage("是否下载工程中的所有文件", "Yes");

            if (optionsResult === 'Yes') {
                projectConfigJson.runConfig = {};
                projectConfigJson.appFile.forEach((e: any) => {
                    projectConfigJson.runConfig[e] = true;
                });
                fs.writeFileSync(path.join(curProjectName, "luatide_project.json"), JSON.stringify(projectConfigJson));
                return true;
            }
            else{
                return true;
            }
        }

        let filesChecked = projectConfigJson.runConfig;
        let curFileChecked = filesChecked;

        // 检查后的文件数组
        let curChangeFiles: any = [];
        // 去展示的文件变化
        let fileToDisplay = {};
        fileToDisplay["delete"] = [];
        fileToDisplay["add"] = [];

        // 去除干扰要素
        for (let cfg in curFileChecked){
            if (!projectConfigJson.appFile.includes(cfg)){
                fileToDisplay["delete"][fileToDisplay["delete"].length] = path.basename(cfg);
                delete curFileChecked[cfg];
            }
        }
        filesChecked = curFileChecked;

        for (let file = 0; file < projectConfigJson.appFile.length; file++){
            let curFile = projectConfigJson.appFile[file];
            if (filesChecked[curFile] === undefined){
                curChangeFiles[curChangeFiles.length] = curFile;
            }
        }

        curChangeFiles.forEach((e: any) => {
            fileToDisplay["add"][fileToDisplay["add"].length] = path.basename(e);
        });

        let msgOptions = "是否下载下列中的文件, 取消则忽略下列文件的下载\n";
        if (fileToDisplay["delete"].length > 0){
            msgOptions += "<删除文件>：\n";
            fileToDisplay["delete"].forEach((e: any) => {
                msgOptions += "        " + e + "\n";
            });
        }

        if (fileToDisplay["add"].length > 0){
            msgOptions += "<新增文件>：\n";
            fileToDisplay["add"].forEach((e: any) => {
                msgOptions += "        " + e + "\n";
            });
        }
        if (msgOptions !== "是否下载下列中的文件, 取消则忽略下列文件的下载\n"){
            // 当下载时，询问是否下载所有文件变化的文件
            const downOption = await vscode.window.showInformationMessage(msgOptions, { modal: true }, "Yes");
    
            if (downOption === 'Yes') {
                curChangeFiles.forEach((e: any) => {
                    filesChecked[e] = true;
                });
            } else {
                curChangeFiles.forEach((e: any) => {
                    filesChecked[e] = false;
                });
            }
        }

        projectConfigJson.runConfig = filesChecked;
        fs.writeFileSync(path.join(curProjectName, "luatide_project.json"), JSON.stringify(projectConfigJson));
        return true;
    }   
}