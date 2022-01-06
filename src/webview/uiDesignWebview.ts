import * as path from 'path';
import * as vscode  from 'vscode';
import { PluginJsonParse } from '../plugConfigParse';
import * as fs from 'fs';
import uiConvert = require('./UI-Converter/uiConvert');
import { ProjectJsonParse } from '../project/projectConfigParse';

let pluginJsonParse = new PluginJsonParse();
let projectJsonParse = new ProjectJsonParse();

// ui设计器操作
export class UiDesign{
	constructor() {
	}

	//UI设计器管理
	async uiDesign(context:vscode.ExtensionContext){
		const activityProjectPath:string = pluginJsonParse.getPluginConfigActivityProject();
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
		const activityProjectPath:string = pluginJsonParse.getPluginConfigActivityProject();
		let uiDesignPath:any = path.join(activityProjectPath,'.luatide',uiDesignName+'.ui');
        if (!fs.existsSync(uiDesignPath)) {
            uiDesignPath = undefined;
        }
		// 判断当前活动工程是否存在ui设计器,存在就解析json，否则直接展示
		let currentLvgl:any = {};
		if (uiDesignPath!==undefined) {
			let currentJson = fs.readFileSync(uiDesignPath, 'utf8');
			try {
				console.log("解析 JSON 内容，并格式化");
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
        private activeProjectPath:string = pluginJsonParse.getPluginConfigActivityProject();
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
                            this.updateUiCodeToProjectPath(uiDesignName,message);
                            this.updateUiCodeToProjectConfig(this.activeProjectPath+"\\"+uiDesignName+'.lua');
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
                        // case "lvgl_huichuan":
                        // 	vscode.window.showInformationMessage(message.text);
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
            // 新建UI设计器panel
            const uiPanel = vscode.window.createWebviewPanel(
                UiDesignPanel.viewType,
                uiDesignName + '设计器',
                column || vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true, // webview被隐藏时保持状态，避免被重置
                }
            );
            UiDesignPanel.currentPanel = new UiDesignPanel(uiPanel, context, uiDesignName, currentLvgl);
        }

        // 更新uidesign生成的代码到活动工程
        public updateUiCodeToProjectPath(uiDesignName:any, message:any) {
            let uiDesignJson = uiConvert.styleManage(message.text);
            let uiCode: any = uiConvert.lvglJsonToCode(uiDesignJson);
            if (!fs.existsSync(this.activeProjectPath + "\\" + ".luatide")) {
                fs.mkdirSync(this.activeProjectPath + "\\" + ".luatide");
            }
            fs.writeFileSync(this.activeProjectPath + "\\" + ".luatide" + "\\" + uiDesignName + '.ui', JSON.stringify(message.text, null, "\t"));
            fs.writeFileSync(this.activeProjectPath + "\\" + uiDesignName + '.lua', uiCode);
        }

        // 更新uidesign生成的代码到活动工程
        public updateUiCodeToProjectConfig(path) {
            try {
                const appFile:string[] = projectJsonParse.getProjectConfigAppFile(this.activeProjectPath);
                if (appFile.indexOf(path)===-1) {
                    projectJsonParse.pushProjectConfigAppFile([path],this.activeProjectPath);
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
            this.updateForUiDesign(context, "./src/webview/UI-Designer/index.html", uiDesignName);
        }
        
        // 更新ui设计器具体逻辑
        private updateForUiDesign(context:vscode.ExtensionContext, templatePath:string, uiDesignName:string) {
            this.uiPanel.title = "UI设计器:" + uiDesignName;
            this.uiPanel.webview.html = this.getUiWebViewContent(context, templatePath);
        }

        // ui设计器webview
        private getUiWebViewContent(context:vscode.ExtensionContext, templatePath:string) {
            console.log("> getWebViewContent:", templatePath);
            const resourcePath = path.join(context.extensionPath, templatePath);
            console.log("> resource:", resourcePath);
            const dirPath = path.dirname(resourcePath);
            console.log("> dirPath:", dirPath);
            let html = fs.readFileSync(resourcePath, 'utf-8');
            //vscode不支持直接加载本地资源，需要替换成其专有路径格式，这里只是简单的将样式和JS的路径替换
            html = html.replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (m, $1, $2) => {
                return $1 + vscode.Uri.file(path.resolve(dirPath, $2)).with({ scheme: 'vscode-resource' }).toString() + '"';
            });
            return html;
    }
    }