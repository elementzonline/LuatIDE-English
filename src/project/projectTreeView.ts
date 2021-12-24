import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { PluginJsonParse } from '../plugConfigParse';
import { PluginConfigInit, PluginVariablesInit } from '../config';
import { ProjectJsonParse } from './projectConfigParse';


let pluginJsonParse = new PluginJsonParse();
let pluginVariablesInit = new PluginVariablesInit();
let projectJsonParse = new ProjectJsonParse();
export class NodeDependenciesProvider implements vscode.TreeDataProvider<Dependency> {
  constructor(private workspaceRoot: string) {}
  private _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined | null | void> = new vscode.EventEmitter<Dependency | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | null | void> = this._onDidChangeTreeData.event;
  
  getTreeItem(element: Dependency): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Dependency): Thenable<Dependency[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage('No dependency in empty workspace');
      return Promise.resolve([]);
    }

    if (element) {
      return Promise.resolve(
        this.getUserProjectInPackageJson(
          path.join(this.workspaceRoot, 'node_modules', element.label, 'package.json')
        )
      );
    } else {
      const packageJsonPath = pluginVariablesInit.getPluginConfigPath();
      if (this.pathExists(packageJsonPath)) {
        return Promise.resolve(this.getUserProjectInPackageJson(packageJsonPath));
      } else {
        vscode.window.showInformationMessage('Workspace has no package.json');
        return Promise.resolve([]);
      }
    }
  }

//   解析用户工程配置文件并在用户工程区域做展示
private getUserProjectInPackageJson(pluginJsonPath: string): Dependency[] {
    const toDep = (projectName: string, projectPath: string): Dependency => {
        return new Dependency(projectName,projectPath, vscode.TreeItemCollapsibleState.None);
    };
    const userProjectAbsulutePathList = pluginJsonParse.getPluginConfigUserProjectAbsolutePathList();
    
    const deps = userProjectAbsulutePathList?Object.keys(userProjectAbsulutePathList).map(
      dep => toDep(userProjectAbsulutePathList[dep].split('\\').pop(),userProjectAbsulutePathList[dep]))
      :[];
      // for (let index = 0; index < userProjectAbsulutePathList.length; index++) {
      //     const projectPath = userProjectAbsulutePathList[index];
      //     const projectName:any = projectPath.split('\\')[-1];
      //     toDep(projectName,projectPath);
      // }
    return deps;
}

// 构造用户工程显示json
// private generateUserProjectShow(){
//   const projectJson:any = '';
//   const projectJsonObj = JSON.parse(projectJson);
//   const projectAppFile = projectJsonObj.Appf
// }

  private pathExists(p: string): boolean {
    try {
      fs.accessSync(p);
    } catch (err) {
      return false;
    }
    return true;
  }



  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}

class Dependency extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    private path: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);  
    this.tooltip = path;
    // this.description = "111"; 
  }

  // iconPath = {
  //   light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
  //   dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
  // };
}
