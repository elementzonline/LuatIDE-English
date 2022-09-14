import { getPluginConfigActivityProject } from "./plugConfigParse";
import { getFileForDirRecursion } from "./project/projectApi";
import * as vscode from 'vscode';
import { getProjectConfigAppFile, getProjectConfigIgnoreFile } from "./project/projectConfigParse";
import { activeProjectManage, deleteProjectConfigFile } from "./project/checkFileWebview";
// import { downloadConfigDisplay } from "./project/checkFile";


// 获取工程配置文件中记录的文件列表(appfile+ignore)
export async function getActiveProjectFileList(projectPath: string) {
    let resultList:string[] = [];
    let appFileList = getProjectConfigAppFile(projectPath);
    let ignoreFileList = getProjectConfigIgnoreFile(projectPath);
    let projectAllFileList: any = appFileList.concat(ignoreFileList);
    projectAllFileList.forEach((e: any) => {
        resultList.push(e);
    });
    return resultList;
}

// 检查活动工程改变
export async function checkActiveProjectChange(context:vscode.ExtensionContext){
	let currentActiveProject:string = getPluginConfigActivityProject();
	if (currentActiveProject !== undefined && currentActiveProject !== "") {
		const relativeFile:any = getFileForDirRecursion(currentActiveProject, "");
	    let oldFileList:any = await getActiveProjectFileList(currentActiveProject);
		let diffFileList = relativeFile.filter(function(v: any){ return oldFileList.indexOf(v) === -1; });
		let delFileList = oldFileList.filter(function(v: any){ return relativeFile.indexOf(v) === -1; });
		if (diffFileList.length > 0){
			let files = {
				"all":relativeFile,
				"new":diffFileList,
			};
			// 下载配置界面显示
			activeProjectManage(context, files, false,false);
			// await downloadConfigDisplay(context,files,false);
		}
		if (delFileList.length > 0){
			const ret = await deleteProjectConfigFile(delFileList);
			if (ret){
				oldFileList = relativeFile;
			}
		}
		
	}
}
