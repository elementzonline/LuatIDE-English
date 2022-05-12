import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
// import { ProjectJsonParse } from './projectConfigParse';
import { getPluginConfigActivityProject, setPluginConfigActivityProject } from '../plugConfigParse';
import { getProjectConfigAppFile } from './projectConfigParse';

// let pluginJsonParse = new PluginJsonParse();
// let projectJsonParse = new ProjectJsonParse();
export class ActivityTreeDataProvider implements vscode.TreeDataProvider<ActivityTreeItem> {
  constructor() { }

  private _onDidChangeTreeData: vscode.EventEmitter<ActivityTreeItem | undefined | null | void> = new vscode.EventEmitter<ActivityTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<ActivityTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ActivityTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: ActivityTreeItem): Thenable<ActivityTreeItem[]> {
    var treeDir: ActivityTreeItem[] = [];
    let activityPath: string = getPluginConfigActivityProject();
    if (element === undefined) {
      if (activityPath === '') {
        return Promise.resolve([]);
      }
      else if (!fs.existsSync(path.join(activityPath,'luatide_project.json'))) {
        setPluginConfigActivityProject('');
        return Promise.resolve([]);
      }
      // const nameIndex: number = activityPath.lastIndexOf("\\");
      // const activityParentPath: string = activityPath.substring(0, nameIndex);
      // const activityProjectName: string = activityPath.substring(nameIndex + 1);
      const activityProjectJson:any = JSON.parse(fs.readFileSync(path.join(activityPath,'luatide_project.json'),'utf-8'));
      const activityProjectPath:string = path.dirname(activityPath);
      const activityProjectName:string = activityProjectJson.projectName;
      treeDir.push(new ActivityTreeItem(activityProjectName, activityProjectPath, vscode.TreeItemCollapsibleState.Expanded));
      return Promise.resolve(treeDir);
    }
    else {
      const fileParentPath: string = element['parentPath'];
      const filename: string = element['label'];
      let filePath: string;
      if (path.dirname(activityPath)===fileParentPath){
        filePath = activityPath;
      }
      else{
        filePath = path.join(fileParentPath, filename);
      }
      const files = fs.readdirSync(filePath);
      // const activityPath: string = getPluginConfigActivityProject();
      const appFile = getProjectConfigAppFile(activityPath);
      if (appFile !== undefined) {
        for (let i = 0; i < files.length; i++) {
          const childrenFileName: string = files[i];
          const childrenFilePath: string = path.join(filePath, childrenFileName);
          const relativeFilePath: string = path.relative(activityPath, childrenFilePath);
          if (appFile.indexOf(relativeFilePath) !== -1) {
            if (fs.statSync(childrenFilePath).isFile()) {
                treeDir.push(new ActivityTreeItem(childrenFileName, filePath, vscode.TreeItemCollapsibleState.None));
            }
            else {
                treeDir.unshift(new ActivityTreeItem(childrenFileName, filePath, vscode.TreeItemCollapsibleState.Collapsed));
            }
          }
        }
      }
      else {
        vscode.window.showErrorMessage('活动工程目录展开失败,插件appFile项获取异常', { modal: true });
      }
      return Promise.resolve(treeDir);
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
}

export class ActivityTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,      //存储当前标签
    public readonly parentPath: string,   //存储当前标签的路径，不包含该标签这个目录
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
  }

  //为每项添加点击事件的命令
  command = {
    title: "点击打开",
    command: 'luatide-activity-project.click',
    arguments: [    //传递两个参数
      this.label,
      this.parentPath
    ]
  };
  tooltip = this.parentPath;
  contextValue = 'ActivityTreeItem';
}