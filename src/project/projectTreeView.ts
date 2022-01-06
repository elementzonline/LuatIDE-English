import * as vscode from 'vscode';
import * as fs from 'fs';
import { PluginJsonParse } from '../plugConfigParse';
// import { PluginConfigInit, PluginVariablesInit } from '../config';
// import { ProjectJsonParse } from './projectConfigParse';


let pluginJsonParse = new PluginJsonParse();
// let pluginVariablesInit = new PluginVariablesInit();
// let projectJsonParse = new ProjectJsonParse();
export class HistoryProjectDataProvider implements vscode.TreeDataProvider<HistoryProjectTreeItem> {
  constructor() { }
  private _onDidChangeTreeData: vscode.EventEmitter<HistoryProjectTreeItem | undefined | null | void> = new vscode.EventEmitter<HistoryProjectTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<HistoryProjectTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;
  public rootloadUrlArray = new Array();

  getTreeItem(element: HistoryProjectTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: HistoryProjectTreeItem): Thenable<HistoryProjectTreeItem[]> {
    this.rootloadUrlArray = [];
    let userProjectAbsulutePathList: any = pluginJsonParse.getPluginConfigUserProjectAbsolutePathList();
    this.generateTreeItem(userProjectAbsulutePathList);
    return Promise.resolve(this.rootloadUrlArray);
  }

  generateTreeItem(userProjectAbsulutePathList: any) {

    for (let index = 0; index < userProjectAbsulutePathList.length; index++) {
      const projectAbsolutePath = userProjectAbsulutePathList[index];
      if (fs.existsSync(projectAbsolutePath)) {
        const nameIndex = projectAbsolutePath.lastIndexOf('\\');
        const projectName: any = projectAbsolutePath.substring(nameIndex + 1);
        const projectPath = projectAbsolutePath.substring(0, nameIndex);
        this.rootloadUrlArray.push(new HistoryProjectTreeItem(projectName, projectPath, vscode.TreeItemCollapsibleState.None));
      }
    }

  }

  // private pathExists(p: string): boolean {
  //   try {
  //     fs.accessSync(p);
  //   } catch (err) {
  //     return false;
  //   }
  //   return true;
  // }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}

export class HistoryProjectTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    private path: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    this.tooltip = this.path;
  }
}

