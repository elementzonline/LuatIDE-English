import * as path from 'path';
import * as vscode  from 'vscode';
import * as fs from 'fs';
import * as uiDesignUpdate from '../ui/uiDesignSourceUpdate';
import { getPluginConfigActivityProject } from '../plugConfigParse';
import { getProjectConfigAppFile, getProjectConfigType, pushProjectConfigAppFile } from '../project/projectConfigParse';
import { getLuatIDEDataPath, getUiDesignDefaultPath } from '../variableInterface';

// ui设计器操作
export class UiDesign{
	constructor() {
	}

	//UI设计器管理
	async uiDesign(context:vscode.ExtensionContext){
        const activityProjectPath:string = getPluginConfigActivityProject();
        if (activityProjectPath==='') {
            vscode.window.showWarningMessage('启动UI设计器前请先激活工程',{modal:true});
            return;
        }
        const activityProjectType:string = getProjectConfigType(activityProjectPath);
        if (activityProjectType!=='ui') {
            vscode.window.showErrorMessage('非UI工程不支持UI设计器相关功能,请新建UI工程后重试',{modal:true});
            return;
        }
        // 打开UI设计器之前先检查UI设计器是否需要下载/更新
        await uiDesignUpdate.uiProjectCheckUpdate();
        const uiDesignPath:string = getUiDesignDefaultPath();
        if (fs.existsSync(path.join(uiDesignPath,'vscode-ext','lvgl-editor','vscode-polyfill.js'))) {
            const projectLuatIDEPath:string = path.join(activityProjectPath,'.luatide');
            let uiDesignName:string|undefined = this.getUiDesignName(projectLuatIDEPath);
            if (uiDesignName===undefined) {
                const uiDesignInputName:string = await this.uiDesignIupt();
                if (uiDesignInputName===undefined) {
                    return;
                }
                uiDesignName = uiDesignInputName;
            }
            else{
                uiDesignName = uiDesignName.split(".")[0];
            }
            this.uiDesignHandler(context,uiDesignName);
        }
        else{
            console.log('未检测到UI设计器文件,打开UI设计器失败');
            vscode.window.showErrorMessage('未检测到UI设计器文件,打开UI设计器失败');
        }
	}

	// 获取ui设计器生成名称
	getUiDesignName(dir:string){
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}
		const files = fs.readdirSync(dir);
		let uidesignName:string|undefined = undefined;
		for (let index = 0; index < files.length; index++) {
			const fileName:string = files[index];
			if (fileName.endsWith('.ui')) {
				uidesignName = fileName;
			}
		}
		return uidesignName;
	}

	// 新建设计器用户交互信息输入
	uiDesignIupt():any {
		const result = vscode.window.showInputBox(
			{ 
				password:false,
				ignoreFocusOut:true, // 默认false，设置为true时鼠标点击别的地方输入框不会消失
				placeHolder:'请输入UI设计器所需要生成的lua代码文件名', // 在输入框内的提示信息
				prompt:"请输入UI设计器所需要生成的lua代码文件名"
	
			}).then(function(msg){
				if (msg===undefined) {
					return undefined;
				}
				else{
					return msg;
				}
			});
		return result;
	}

	// 设计器处理
	uiDesignHandler(context:vscode.ExtensionContext,uiDesignName:string) {
		const activityProjectPath:string = getPluginConfigActivityProject();
		let uiDesignPath:any = path.join(activityProjectPath,'.luatide',uiDesignName+'.ui');
        if (!fs.existsSync(uiDesignPath)) {
            uiDesignPath = undefined;
        }
		// 判断当前活动工程是否存在ui设计器,存在就解析json，否则直接展示
		let currentLvgl:any = {};
		if (uiDesignPath!==undefined) {
			let currentJson = fs.readFileSync(uiDesignPath, 'utf8');
			try {
				console.log("解析 JSON 内容,并格式化");
				currentLvgl = JSON.parse(currentJson);
				//
				// TODO 这里可以对 lvgl 的对象根据文档，做一些预处理
				// 譬如填写一些比较的默认字段，甚至做一些属性检查等
				//
			} catch (E) {
				console.error("文件内容不是合法的 JSON");
				return;
			}
		}
		UiDesignPanel.createOrShow(context,uiDesignName,currentLvgl);
	}
	}

export class UiDesignPanel {
    public static currentPanel: UiDesignPanel | undefined;
    public static readonly viewType = 'lvglDesigner';
    private readonly uiPanel: vscode.WebviewPanel;
    private disposables: vscode.Disposable[] = [];
    private activeProjectPath:string = getPluginConfigActivityProject();
    private constructor(uiPanel: vscode.WebviewPanel, context: vscode.ExtensionContext,uiDesignName:string,currentLvgl:any) {
        this.uiPanel = uiPanel;
        this.update(context,uiDesignName);
        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programatically
        this.uiPanel.onDidDispose(() => this.dispose(), null, this.disposables);
        // Update the content based on view changes
        this.uiPanel.onDidChangeViewState(
            e => {
                if (this.uiPanel.visible) {
                    this.update(context,uiDesignName);
                }
            },
            null,
            this.disposables
        );

        // Handle messages from the webview
        this.uiPanel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'alert':
                        vscode.window.showErrorMessage(message.text);
                        return;
                    case 'lvgl_json_receive':
                        this.uiJsonHandle(uiDesignName,message);
                        return;
                    case 'lvglPageReady':
                        if (message.text) {
                            this.uiPanel.webview.postMessage(	
                                {
                                command:'lvgl',
                                text:currentLvgl
                                }
                            );
                        }
                        return;
                    case "lvglReadBase64":
                        // 获取图片基于工程的相对路径
                        let pictureBase64Path:string = message.text;
                        // 获取图片的绝对路径
                        const picturePath:string = path.join(this.activeProjectPath,pictureBase64Path);
                        // 读取文件内容，并转换为 base64
                        console.log("读取本地文件", picturePath);
                        let bitmap = fs.readFileSync(picturePath);
                        let base64 = Buffer.from(bitmap).toString('base64');
                        console.log("转换为base64", base64.substring(0, 100), "...");
                        // 获取后缀名
                        let suffix = path.extname(pictureBase64Path).substring(1,);
                        let prefix = `data:image/${suffix};base64`;

                        // 将内容发送给 webview
                        this.uiPanel.webview.postMessage(
                            {
                                'command':'lvglPictureBase64',
                                'text': {
                                    readBase64: true,
                                    pictureBase64Path,
                                    base64: `${prefix},${base64}`
                                }
                            });
                        break;
                    case "uiConvertOutputData":
                        this.uiConvertToProject(message.text);
                        this.updateUiCodeToProjectConfig(this.activeProjectPath+"\\"+uiDesignName+'.lua');
                        break;
                }
            },
            null,
            this.disposables
        );
    }

    // 创建或者ui设计器
    public static createOrShow(context: vscode.ExtensionContext, uiDesignName: string, currentLvgl: any) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        if (UiDesignPanel.currentPanel) {
            UiDesignPanel.currentPanel.uiPanel.reveal(column);
            return;
        }
        const luatideDataPath = getLuatIDEDataPath();
        // 新建UI设计器panel
        const uiPanel = vscode.window.createWebviewPanel(
            UiDesignPanel.viewType,
            uiDesignName + '设计器',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true, // webview被隐藏时保持状态，避免被重置
                localResourceRoots:[vscode.Uri.file(luatideDataPath)]
            }
        );
        UiDesignPanel.currentPanel = new UiDesignPanel(uiPanel, context, uiDesignName, currentLvgl);
    }

    // 接收UI设计器传送过来的数据，处理后将json对象及事件数据文件内容通过命令传递给UI设计器
    public uiJsonHandle(uiDesignName:any, message:any){
        // 获取当前活动工程工程类型
        const activityProjectPath:string = getPluginConfigActivityProject();
        const activityProjectType:string = getProjectConfigType(activityProjectPath);
        const uiLuaType:string = this.getUiConvertLuaType(activityProjectType);
        const uiJsonPath:string = this.activeProjectPath + "\\" + ".luatide" + "\\" + uiDesignName + '.ui';
        const uiHandlePath:string = path.join(this.activeProjectPath,'UiHandle.lua');
        if (!fs.existsSync(this.activeProjectPath + "\\" + ".luatide")) {
            fs.mkdirSync(this.activeProjectPath + "\\" + ".luatide");
        }
        if (!fs.existsSync(uiHandlePath)) {
            fs.writeFileSync(uiHandlePath,'');
        }
        fs.writeFileSync(uiJsonPath, JSON.stringify(message.text, null, "\t"));
        const uiHandleData:string = fs.readFileSync(uiHandlePath).toString();
        this.uiPanel.webview.postMessage(
            {
                "command" : "uiConvert",
                "text" :  [message.text,uiHandleData,uiLuaType]
            }
        );
    }

    /**
     * uiConvertToProject
     */
    public uiConvertToProject(uiDesignObj:any) {
        const uiLuaPath:string = path.join(this.activeProjectPath,'UiDesign.lua');
        const uiHandlePath:string = path.join(this.activeProjectPath,'UiHandle.lua');
        const projectAppFile:string[] = getProjectConfigAppFile(this.activeProjectPath);
        if (uiDesignObj.uiDesignLua!==undefined) {
            fs.writeFileSync(uiLuaPath,uiDesignObj.uiDesignLua);
        }
        if (projectAppFile.indexOf(path.basename(uiLuaPath))===-1) {
            pushProjectConfigAppFile([path.basename(uiLuaPath)],this.activeProjectPath);
        }
        fs.writeFileSync(uiHandlePath,uiDesignObj.uiHandleLua);
        if (projectAppFile.indexOf(path.basename(uiHandlePath))===-1) {
            pushProjectConfigAppFile([path.basename(uiHandlePath)],this.activeProjectPath);
        }
        vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
    }

    // 依据工程类型判断ui设计器生成代码类型
    getUiConvertLuaType(projectType:string){
        let uiLuaType:string;
        switch (projectType) {
            case 'air101': 
                uiLuaType = 'soc';
                break;
            case 'air103':
                uiLuaType = 'soc';
                break;
            case 'air105':
                uiLuaType = 'soc';
                break;
            case 'esp32c3':
                uiLuaType = 'soc';
                break;
            default:
                uiLuaType = 'air';
                break;
        }
        return uiLuaType;
    }

    // 更新uidesign生成的代码到活动工程
    public updateUiCodeToProjectConfig(filePath:string) {
        try {
            
            const appFile:string[] = getProjectConfigAppFile(this.activeProjectPath);
            const relativePath:string = path.relative(this.activeProjectPath,filePath);
            if (appFile.indexOf(relativePath)===-1) {
                pushProjectConfigAppFile([relativePath],this.activeProjectPath);
            }
            vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
        }
        catch (e) {
            console.log("更新文件到活动工程出错", e);
        }
    }

    // ui设计器webview生命周期结束调用
    public dispose() {
        UiDesignPanel.currentPanel = undefined;
        // Clean up our resources
        this.uiPanel.dispose();
        while (this.disposables.length) {
            const x = this.disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    // 更新webview
    private update(context:vscode.ExtensionContext,uiDesignName: string) {
        // const webview = this._panel.webview;
        const uiDesignDefaultPath:string = getUiDesignDefaultPath();
        const uiDesignHtmlPath:string = path.join(uiDesignDefaultPath,'vscode-ext','lvgl-editor','index.html');
        this.updateForUiDesign(context, uiDesignHtmlPath, uiDesignName);
    }
    
    // 更新ui设计器具体逻辑
    private updateForUiDesign(context:vscode.ExtensionContext, templatePath:string, uiDesignName:string) {
        this.uiPanel.title = "UI设计器:" + uiDesignName;
        this.uiPanel.webview.html = this.getUiWebViewContent(context, templatePath);
    }

    // ui设计器webview
    private getUiWebViewContent(context:vscode.ExtensionContext, templatePath:string) {
        console.log("> getWebViewContent:", templatePath);
        // const resourcePath = path.join(context.extensionPath, templatePath);
        console.log("> resource:", templatePath);
        const dirPath = path.dirname(templatePath);
        console.log("> dirPath:", dirPath);
        let html = fs.readFileSync(templatePath, 'utf-8');
        //vscode不支持直接加载本地资源，需要替换成其专有路径格式，这里只是简单的将样式和JS的路径替换
        html = html.replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (m, $1, $2) => {
            return $1 + vscode.Uri.file(path.join(dirPath, $2)).with({ scheme: 'vscode-resource' }).toString() + '"';
        });
        return html;
}
}