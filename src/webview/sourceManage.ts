import * as vscode from "vscode";
import * as fs from "fs";
import path = require("path");
import { getAir101DefaultCorePath, getAir101DefaultDemoPath, getAir103DefaultCorePath, getAir103DefaultDemoPath, getAir105DefaultCorePath, getAir105DefaultDemoPath, getAir72XCXDefaultCorePath, getAir72XCXDefaultDemoPath, getAir72XCXDefaultLibPath, getAir72XUXDefaultCorePath, getAir72XUXDefaultDemoPath, getAir72XUXDefaultLibPath, getEsp32c3DefaultCorePath, getEsp32c3DefaultDemoPath, getLuatIDEDataPath, getNdkDefaultPath, getPlugDependentResourceConfigPath, getSourceManageHtmlPath, getUiDesignDefaultPath } from "../variableInterface";
import {  pullAir101Source, pullAir103Source, pullAir105Source, pullAir72XCXCore, pullAir72XCXScript, pullAir72XUXCore, pullAir72XUXScript, pullEsp32c3Source, updateProgressView } from "../serverSourceUpdate";
import { getNdkCode } from "../ndk/ndkCodeDownload";
import { getUiDesignCode } from "../ui/uiDesignSourceUpdate";
import { deleteDirRecursiveMaintainFolder } from "../project/projectApi";


export class SourceManage{
  plugDependentResourceConfigPath = getPlugDependentResourceConfigPath();
  sourceTableData =  "";
    constructor(){

    }
    sourcePanel: vscode.WebviewPanel|undefined = undefined;
    sourceManage(context:vscode.ExtensionContext){
        this.sourceTableData =  JSON.parse(fs.readFileSync(this.plugDependentResourceConfigPath).toString());
        const columnToShowIn = vscode.window.activeTextEditor?vscode.window.activeTextEditor.viewColumn:undefined;
        if (this.sourcePanel) {
            this.sourcePanel.reveal(columnToShowIn);
            return;
        }
        else{
          const luatideDataPath = getLuatIDEDataPath();
          const extensionPath = path.join(__dirname, '../..');
            this.sourcePanel = vscode.window.createWebviewPanel(
                "sourceManage",
                "sourceManage",
                vscode.ViewColumn.Active,
                {
                    enableScripts:true,
                    retainContextWhenHidden:true,
                    localResourceRoots:[vscode.Uri.file(extensionPath),vscode.Uri.file(luatideDataPath)]
                }
            );
            this.sourcePanel.webview.html = this.getWebviewContent();
            this.sourcePanel.webview.onDidReceiveMessage(message => this.receiveMessageHandle(message));
            this.sourcePanel.onDidDispose(
                () =>{
                    this.sourcePanel = undefined;
                },
                null,
                context.subscriptions
            );
        }
    }

    getWebviewContent(){
        const sourceManageHtmlPath = getSourceManageHtmlPath();
        let homeHtml: string = fs.readFileSync(sourceManageHtmlPath, "utf-8");
        const homeHtmlJsPath = path.join(sourceManageHtmlPath,"../");
        homeHtml = homeHtml.replace(
            /(<link.+?href="|<script.+?src="|<img.+?src=")(?!http)(.+?)"/g,
            (m, $1, $2) => {
                return (
                    $1 +
                    vscode.Uri.file(path.resolve(homeHtmlJsPath, $2))
                        .with({ scheme: "vscode-resource" })
                        .toString() +
                    '"'
                );
            }
        );
        return homeHtml;
    }

    async receiveMessageHandle(message:any){
        switch (message.command) {
            case 'homePageReady':
                this.sourcePanel?.webview.postMessage(
                    {
                        "command":"sourceTableData",
                        "text":this.sourceTableData
                    }
                );
                break;
            case 'downloadSourceList':
              console.log(message.text);
              // 下载资源处理
              this.downloadHandler(message.text);
              break;
            case 'uninstallSourceList':
              console.log(message.text);
              this.uninstallHandler(message.text);
              break;
            default:
                break;
        }
    }

    // 下载资源处理
    async downloadHandler(downloadData:string) {
      for (let index = 0; index < downloadData.length; index++) {
        const element = downloadData[index];
        let downloadingHint:string;
        switch (element['id']) {
          case "8910_script":
            downloadingHint = '正在为您拉取最新air72XUX/air82XUX的DEMO及Lib文件,请耐心等待';
            await updateProgressView("是",downloadingHint,pullAir72XUXScript);
            this.changeDownloadState(element['id'],this.sourceTableData);
            break;
          case "8910_lua_lod":
            downloadingHint = '正在为您拉取最新air72XUX/air82XUX固件,请耐心等待';
            await updateProgressView("是",downloadingHint,pullAir72XUXCore);
            this.changeDownloadState(element['id'],this.sourceTableData);
            break;
          case "1603_script":
            downloadingHint = '正在为您拉取最新air72XCX的DEMO及Lib文件,请耐心等待';
            await updateProgressView("是",downloadingHint,pullAir72XCXScript);
            this.changeDownloadState(element['id'],this.sourceTableData);
            break;
          case "1603_lua_lod":
            downloadingHint = '正在为您拉取最新air72XCX固件文件,请耐心等待';
            await updateProgressView("是",downloadingHint,pullAir72XCXCore);
            this.changeDownloadState(element['id'],this.sourceTableData);
            break;
          case "101_lua_lod":
            downloadingHint = '正在为您拉取最新air101资源文件,请耐心等待';
            await updateProgressView("是",downloadingHint,pullAir101Source);
            this.changeDownloadState(element['id'],this.sourceTableData);
            break;
          case "103_lua_lod":
            downloadingHint = '正在为您拉取最新air103资源文件,请耐心等待';
            await updateProgressView("是",downloadingHint,pullAir103Source);
            this.changeDownloadState(element['id'],this.sourceTableData);
            break;
          case "105_lua_lod":
            downloadingHint = '正在为您拉取最新air105资源文件,请耐心等待';
            await updateProgressView("是",downloadingHint,pullAir105Source);
            this.changeDownloadState(element['id'],this.sourceTableData);
            break;
          case "esp32c3_lua_lod":
            downloadingHint = '正在为您拉取最新esp32c3资源文件,请耐心等待';
            await updateProgressView("是",downloadingHint,pullEsp32c3Source);
            this.changeDownloadState(element['id'],this.sourceTableData);
            break;
          case "UI设计器":
            await getUiDesignCode();
            this.changeDownloadState(element['id'],this.sourceTableData);
            break;
          case "NDK":
            await getNdkCode();
            this.changeDownloadState(element['id'],this.sourceTableData);
            break;
          default:
            break;
        }
      }
      
    }

    // 卸载资源处理
    async uninstallHandler(uninstallData:string){
      for (let index = 0; index < uninstallData.length; index++) {
        const element = uninstallData[index];
        switch (element['id']) {
          case "8910_script":
            const air72XUXDefaultLibPath = getAir72XUXDefaultLibPath();
            const air72XUXDemoPath =  getAir72XUXDefaultDemoPath();
            deleteDirRecursiveMaintainFolder(air72XUXDefaultLibPath);
            deleteDirRecursiveMaintainFolder(air72XUXDemoPath);
            this.changeDownloadState(element['id'],this.sourceTableData);
            break;
          case "8910_lua_lod":
            const air72XUXDefaultCorePath =  getAir72XUXDefaultCorePath();
            deleteDirRecursiveMaintainFolder(air72XUXDefaultCorePath);
            this.changeDownloadState(element['id'],this.sourceTableData);
            break;
          case "1603_script":
            const air72XCXDefaultLibPath = getAir72XCXDefaultLibPath();
            const air72XCXDemoPath =  getAir72XCXDefaultDemoPath();
            deleteDirRecursiveMaintainFolder(air72XCXDefaultLibPath);
            deleteDirRecursiveMaintainFolder(air72XCXDemoPath);
            this.changeDownloadState(element['id'],this.sourceTableData);
            break;
          case "1603_lua_lod":
            const air72XCXDefaultCorePath = getAir72XCXDefaultCorePath();
            deleteDirRecursiveMaintainFolder(air72XCXDefaultCorePath);
            this.changeDownloadState(element['id'],this.sourceTableData);
            break;
          case "101_lua_lod":
            const air101DefaultDemoPath =  getAir101DefaultDemoPath();
            const air101DefaultCorePath = getAir101DefaultCorePath();
            deleteDirRecursiveMaintainFolder(air101DefaultDemoPath);
            deleteDirRecursiveMaintainFolder(air101DefaultCorePath);
            this.changeDownloadState(element['id'],this.sourceTableData);
            break;
          case "103_lua_lod":
            const air103DefaultDemoPath =  getAir103DefaultDemoPath();
            const air103DefaultCorePath = getAir103DefaultCorePath();
            deleteDirRecursiveMaintainFolder(air103DefaultDemoPath);
            deleteDirRecursiveMaintainFolder(air103DefaultCorePath);
            this.changeDownloadState(element['id'],this.sourceTableData);
            break;
          case "105_lua_lod":
            const air105DefaultDemoPath =  getAir105DefaultDemoPath();
            const air105DefaultCorePath = getAir105DefaultCorePath();
            deleteDirRecursiveMaintainFolder(air105DefaultDemoPath);
            deleteDirRecursiveMaintainFolder(air105DefaultCorePath);
            this.changeDownloadState(element['id'],this.sourceTableData);
            break;
          case "esp32c3_lua_lod":
            const esp32c3DefaultDemoPath =  getEsp32c3DefaultDemoPath();
            const esp32c3DefaultCorePath = getEsp32c3DefaultCorePath();
            deleteDirRecursiveMaintainFolder(esp32c3DefaultDemoPath);
            deleteDirRecursiveMaintainFolder(esp32c3DefaultCorePath);
            this.changeDownloadState(element['id'],this.sourceTableData);
            break;
          case "UI设计器":
            const uiDesignPath = getUiDesignDefaultPath();
            deleteDirRecursiveMaintainFolder(uiDesignPath);
            this.changeDownloadState(element['id'],this.sourceTableData);
            break;
          case "NDK":
            const ndkPath = getNdkDefaultPath();
            deleteDirRecursiveMaintainFolder(ndkPath);
            this.changeDownloadState(element['id'],this.sourceTableData);
            break;
          default:
            break;
        }
      }
    }


    // 修改下载状态
  changeDownloadState(sourceName, tabledata) {
    let sourceStateHanler = function (sourceName, tabledata) {
      for (let index = 0; index < tabledata.length; index++) {
        const element = tabledata[index];
        if (element.id === sourceName && element.state === "Not Installed") {
          element.state = "Installed";
        }
        else if (element.id === sourceName && element.state === "Installed") {
          element.state = "Not Installed";
        }
        else if (element.children && element.children !== []) {
          sourceStateHanler(sourceName, element.children);
        }
      }
    };
    sourceStateHanler(sourceName, tabledata);
    // 更新下载资源列表数据
    this.sourcePanel?.webview.postMessage(
      {
        "command": "refreshSourceTableData",
        "text": tabledata
      }
    );
    const plugDependentResourceConfigPath = getPlugDependentResourceConfigPath();
    fs.writeFileSync(plugDependentResourceConfigPath,JSON.stringify(tabledata,null,"\t"));
  }

}
