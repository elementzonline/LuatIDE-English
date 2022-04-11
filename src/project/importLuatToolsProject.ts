import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { getPluginConfigPath, getAir72XUXDefaultLatestLibPath, getDefaultWorkspacePath } from '../variableInterface';
import { getDefaultProjectName } from '../project/ProjectHandle';
import { getCreateProjectCorepathHandle, getCreateProjectLibpathHandle} from '../project/projectApi';

export class importLuatToolsProjectClass {
    constructor() {
    }

    /* 0. 用户点击导入 LuaTools 项目按钮后，出现文件资源管理器界面 */
    async openFileSystemControl(context:vscode.ExtensionContext){
        const options = {
			canSelectFiles: true,		//是否选择文件
			canSelectFolders: false,		//是否选择文件夹
			canSelectMany: false,		//是否选择多个文件
			defaultUri: vscode.Uri.file("C://"),	//默认打开文件位置
			openLabel: '选择您需要导入的 LuaTools 项目 ini 文件'
		};
        const importLuatToolsProjectPath: any = await this.getLuatToolsImportPathWithInterface(options);
        if (importLuatToolsProjectPath === undefined) {
            return undefined;
        }
        if (importLuatToolsProjectPath === "core find failed"){
            return "core find failed";
        }
        return importLuatToolsProjectPath;
    }
    
    /*
    解析 LuaTools 工程文件
    @fileDir:               ini文件绝对路径
    */
    async analyzeLuatToolsIniFile(fileDir: any){
        let analyObj = {};
        let dataArr: any = [];

        if (fileDir.lastIndexOf(".ini") !== -1){
            let luatToolsIniData: string = fs.readFileSync(fileDir, "utf-8");
            if (luatToolsIniData){
                /* 获取文件中的所有数据 */
                let lines = luatToolsIniData.split(/(\r\n)+/);
                for (const line of lines){
                    if (line !== "" && line !== undefined && line !== "\r\n"){
                        if (line.indexOf("[") > -1){
                            dataArr[dataArr.length] = line;
                        } else {
                            dataArr[dataArr.length] = line.replace(/\s+/g, "");
                        }
                    }
                }

                /* 提取有用数据 */
                // 临时文件根目录
                let rootDir: any;
                dataArr.forEach((e: any) => {
                    // let temAnalyObj = {};
                    if (e.indexOf("core_path") > -1){
                        analyObj["corePath"] = e.match(/[^core_path\s=\s].+/g);
                    } else {
                        /* 判断是否是有效的数据进行对象填充 */
                        if (e.indexOf("[") > -1){
                            rootDir = e;
                            analyObj[rootDir] = [];
                        } else {
                            analyObj[rootDir][analyObj[rootDir].length] = e.split(/=.*/)[0];
                        }
                    }
                });

                if (!analyObj["corePath"] || analyObj["corePath"][0] === "" || !fs.existsSync(analyObj["corePath"][0])){
                    return ["core find failed", analyObj];
                }
                
                return analyObj;
            }
            return undefined;
        }
        return undefined;
    }

    /* 1. 获取导入的 LuaTools 工程的路径 */
    async getLuatToolsImportPath(options:any){
        let temRetOne =  await vscode.window.showOpenDialog(options);

        if (temRetOne !== undefined) {
            const importProjectPath = temRetOne[0].fsPath.toString();
            /* 获取默认的工程名称 */
            let defProjectName: any;

            /* 解析ini中的数据并提取 */
            const analyRes = await this.analyzeLuatToolsIniFile(importProjectPath);
            if (!analyRes){
                return undefined;
            }
            if (analyRes === "core find failed"){
                return "core find failed";
            }

            /* 选择工程的保存地址 */
            let inputProjrctPath: any = await vscode.window.showOpenDialog({
                canSelectFiles: false,		//是否选择文件
                canSelectFolders: true,		//是否选择文件夹
                canSelectMany: false,		//是否选择多个文件
                defaultUri: vscode.Uri.file("C://"),	//默认打开文件位置
                openLabel: '选择您导入的 LuaTools 项目的保存地址'
            });
            
            if (inputProjrctPath === undefined) {
                return undefined;
            }

            defProjectName = await vscode.window.showInputBox({ 
                password:false,
                ignoreFocusOut:true, // 默认false，设置为true时鼠标点击别的地方输入框不会消失
                placeHolder:'请勿输入特殊字符', // 在输入框内的提示信息
                prompt:"请输入导入的 LuaTools 的工程的初始化名称"
            });

            if (defProjectName){
                /* 判断是否存在特殊字符 */
                var flag = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>《》/?~！@#￥……&*（）――|{}【】‘；：”“'。，、？ ]");
                if (flag.test(defProjectName)){
                    vscode.window.showErrorMessage("输入的工程名称存在特殊字符");
                    return undefined;
                }

                /* 在选中的地址下创建项目文件夹 */
                let selectedPath = inputProjrctPath[0].fsPath.toString();
                let luatToolsProjectFloder = path.join(selectedPath, defProjectName);
                if (!fs.existsSync(luatToolsProjectFloder)){
                    fs.mkdirSync(luatToolsProjectFloder);
                }

                if (!fs.existsSync(luatToolsProjectFloder)) {
                    return undefined;
                }

                // 工程中的文件信息数组
                let fileJson: any = [];
                fileJson["data"] = [];
                /* 进行文件的读写操作 */
                for (let key in analyRes){
                    if (key === "corePath"){
                        let tarStr = analyRes[key][0].toString();
                        let temFileName = path.basename(tarStr);
                        if (temFileName){
                            fs.copyFileSync(tarStr, path.join(luatToolsProjectFloder, temFileName));
                            fileJson["core"] = path.join(luatToolsProjectFloder, temFileName);
                        }
                    }
                    if (key !== "[info]" && key !== "corePath"){
                        let temDir = key.replace(/\[|\]/g, "");
                        let temDes = path.basename(temDir);
                        fs.mkdirSync(path.join(luatToolsProjectFloder, temDes));
                        fileJson["data"].push(temDes);
                        /* 判断文件是否存在 */
                        for (let i = 0; i < analyRes[key].length; i++){
                            if (!fs.existsSync(path.join(temDir, analyRes[key][i]))) {
                                return "ERROR: " + path.join(temDir, analyRes[key][i]);
                            }
                        }
                        analyRes[key].forEach((e: any) => {
                            fs.copyFileSync(path.join(temDir, e), path.join(luatToolsProjectFloder, temDes, e));
                            fileJson["data"].push(path.join(temDes, e));
                        });
                    }
                }

                let ideJson: any = await JSON.parse(fs.readFileSync(getPluginConfigPath()).toString());
                const ideVersion = ideJson.version;
                /* 写入appData中的json文件中 */
                for (let i = 0; i < ideJson.projectList.length; i++){
                    if (defProjectName === ideJson.projectList[i]["projectName"] && selectedPath === ideJson.projectList[i]["projectPath"]){
                        vscode.window.showErrorMessage("同一地址下存在相同名称的工程，请重试！");
                        return undefined;
                    }
                }
                let tarPJson = {
                    projectPath: selectedPath,
                    projectName: defProjectName
                };
                ideJson.projectList.push(tarPJson);
                fs.writeFileSync(getPluginConfigPath(), JSON.stringify(ideJson).toString());

                /* 写入工程的appfile所在文件 */
                let appFileJson = {};
                appFileJson["version"] = ideVersion;
                appFileJson["projectType"] = "pure";
                appFileJson["corePath"] = path.join(luatToolsProjectFloder, path.basename(analyRes["corePath"][0].toString()));
                appFileJson["libPath"] = getAir72XUXDefaultLatestLibPath();
                appFileJson["moduleModel"] =  (path.basename(analyRes["corePath"][0].toString())).includes(".soc") ? "air101" : "Air72XUX/Air82XUX";
                appFileJson["appFile"] = [];
                fileJson["data"].forEach((file: any) => {
                    appFileJson["appFile"].push(file);
                });
                fs.writeFileSync(path.join(luatToolsProjectFloder, "luatide_project.json"), JSON.stringify(appFileJson).toString());
                return [selectedPath, defProjectName];
            }
        }
        return undefined;
    }

    
    /* 2. 获取导入的 LuatTools 工程的路径 */
    async getLuatToolsImportPathWithInterface(options:any){
        let temRetOne =  await vscode.window.showOpenDialog(options);
        let fileToExist: any;

        if (temRetOne !== undefined) {
            const importProjectPath = temRetOne[0].fsPath.toString();

            /* 解析ini中的数据并提取 */
            const analyRes = await this.analyzeLuatToolsIniFile(importProjectPath);
            if (!analyRes){
                vscode.window.showErrorMessage("LuaTools 项目中文件错误导入失败，请检查后重试！");
                return undefined;
            }

            let firstImportData = {};
            firstImportData["type"] = "luatTools";
            firstImportData["errorData"] = {};
            firstImportData["correctData"] = {};
            firstImportData["correctData"].projectName = getDefaultProjectName();
            firstImportData["correctData"].projectPath = getDefaultWorkspacePath();
            firstImportData["correctData"].moduleModel = "air72XUX/air82XUX";
            firstImportData["correctData"].libPath = getAir72XUXDefaultLatestLibPath();

            /* 判断是否是数组，当为数组时，表示 Core 存在问题 */
            if (Array.isArray(analyRes)){
                if (analyRes[0] === "core find failed"){
                    firstImportData["errorData"].corePath = analyRes[1]["corePath"][0].toString();
                    fileToExist = analyRes[1];
                }
            } else {
                firstImportData["correctData"].corePath = analyRes["corePath"][0].toString();
                fileToExist = analyRes;
            }

            /* 判断文件是否存在 */
            for (let key in fileToExist){
                if (key !== "[info]" && key !== "corePath"){
                    let temDir = key.replace(/\[|\]/g, "");
                    for (let i = 0; i < fileToExist[key].length; i++){
                        if (!fs.existsSync(path.join(temDir, fileToExist[key][i]))) {
                            return "ERROR: " + path.join(temDir, fileToExist[key][i]);
                        }
                    }
                }
            }

            return [fileToExist, firstImportData];
        }
        return undefined;
    }

    async checkLuatToolsProjectCorrectWithInterface(projectData: any, analyRes: any) {
        
        let inputProjrctPath = projectData.text.data.projectPath;
        // 项目文件夹名称
        let defProjectName = projectData.text.data.projectName;
        // 项目文件夹所在路径
        let selectedPath = path.join(inputProjrctPath, "..");

        if (inputProjrctPath === undefined) {
            return undefined;
        }

        /* 检查是否存在相同名称的项目 */
        let ideJson: any = await JSON.parse(fs.readFileSync(getPluginConfigPath()).toString());
        const ideVersion = ideJson.version;
        /* 写入appData中的json文件中 */
        for (let i = 0; i < ideJson.projectList.length; i++){
            if (defProjectName === ideJson.projectList[i]["projectName"] && selectedPath === ideJson.projectList[i]["projectPath"]){
                vscode.window.showErrorMessage("同一地址下存在相同名称的工程，请重试！");
                return undefined;
            }
        }
        let tarPJson = {
            projectPath: selectedPath,
            projectName: defProjectName
        };
        ideJson.projectList.push(tarPJson);
        fs.writeFileSync(getPluginConfigPath(), JSON.stringify(ideJson).toString());

        if (defProjectName){
            /* 在选中的地址下创建项目文件夹 */
            let luatToolsProjectFloder = inputProjrctPath;

            if (!fs.existsSync(luatToolsProjectFloder)){
                fs.mkdirSync(luatToolsProjectFloder);
            }

            if (!fs.existsSync(luatToolsProjectFloder)) {
                return undefined;
            }

            // 工程中的文件信息数组
            let fileJson: any = [];
            fileJson["data"] = [];
            /* 进行文件的读写操作 */
            for (let key in analyRes){
                if (key !== "[info]" && key !== "corePath"){
                    let temDir = key.replace(/\[|\]/g, "");
                    let temDes = path.basename(temDir);
                    fs.mkdirSync(path.join(luatToolsProjectFloder, temDes));
                    fileJson["data"].push(temDes);
                    /* 判断文件是否存在 */
                    for (let i = 0; i < analyRes[key].length; i++){
                        if (!fs.existsSync(path.join(temDir, analyRes[key][i]))) {
                            return "ERROR: " + path.join(temDir, analyRes[key][i]);
                        }
                    }
                    analyRes[key].forEach((e: any) => {
                        fs.copyFileSync(path.join(temDir, e), path.join(luatToolsProjectFloder, temDes, e));
                        fileJson["data"].push(path.join(temDes, e));
                    });
                }
            }

            //获取core文件
            let tarCoreStr = getCreateProjectCorepathHandle(projectData.text.data.corePath, projectData.text.data.moduleModel);
            let temFileName = path.basename(tarCoreStr);
            fs.copyFileSync(tarCoreStr, path.join(luatToolsProjectFloder, temFileName));
            fileJson["core"] = path.join(luatToolsProjectFloder, temFileName);

            /* 写入工程的appfile所在文件 */
            let appFileJson = {};
            appFileJson["version"] = ideVersion;
            appFileJson["projectType"] = projectData.text.type;
            appFileJson["corePath"] = getCreateProjectCorepathHandle(projectData.text.data.corePath, projectData.text.data.moduleModel);
            appFileJson["libPath"] = getCreateProjectLibpathHandle(projectData.text.data.libPath, projectData.text.data.moduleModel);
            appFileJson["moduleModel"] =  projectData.text.data.moduleModel;
            appFileJson["appFile"] = [];
            fileJson["data"].forEach((file: any) => {
                appFileJson["appFile"].push(file);
            });
            fs.writeFileSync(path.join(luatToolsProjectFloder, "luatide_project.json"), JSON.stringify(appFileJson).toString());
            return [selectedPath, defProjectName];
        }
    }
}