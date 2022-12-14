import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
// import { ProjectJsonParse } from './projectConfigParse';
import { getPluginConfigActivityProject, projectConfigCompatible, setPluginConfigActivityProject } from '../plugConfigParse';
import { getProjectConfigAppFile, getProjectConfigLibPath } from './projectConfigParse';
import { getactiveProjectConfigDesc, getApiDesc, getConnectPort, getDistinguishMark, getDownloadCoreDesc, getHardwareDesc, getHelp, getLcdDriverDesc, getProductionFileDesc, getSimulatorDesc, getTpDriverDesc, getUiDesignDesc } from './activityProjectConfig';
import { getConfigDarkIconPath, getConfigLightIconPath } from '../variableInterface';

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
    let activityPath: string = getPluginConfigActivityProject();
    let treeDir: ActivityTreeItem[] = [];
    if (element === undefined) {
      if (activityPath === '') {
        return Promise.resolve([]);
      }
      else if (!fs.existsSync(path.join(activityPath, 'luatide_project.json'))) {
        setPluginConfigActivityProject('');
        return Promise.resolve([]);
      }
      treeDir = activeProjectDataInit(activityPath);
    }
    else {
      treeDir =  childrenDataInit(element, activityPath);
    }
    return Promise.resolve(treeDir);
  }

}

// 初始化活动工程数据
function activeProjectDataInit(activityPath: string) {
  projectConfigCompatible(activityPath);
  const treeDir: ActivityTreeItem[] = [];
  const activityProjectJson: any = JSON.parse(fs.readFileSync(path.join(activityPath, 'luatide_project.json'), 'utf-8'));
  const activityProjectPath: string = path.dirname(activityPath);
  const activityProjectName: string = activityProjectJson.projectName;
  const libParentPath = path.dirname(activityProjectJson.libPath);
  const libName = path.basename(activityProjectJson.libPath);
  treeDir.push(new ActivityTreeItem(activityProjectName, activityProjectPath, vscode.TreeItemCollapsibleState.Expanded,"ActivityTreeItemShow"));
  if (activityProjectJson.libPath !== "" && fs.existsSync(activityProjectJson.libPath)) {
    treeDir.push(new ActivityTreeItem(libName, libParentPath, vscode.TreeItemCollapsibleState.Collapsed,'ActivityTreeItem'));
  }
  treeDir.push(new ActivityTreeItem(getHelp(), getDistinguishMark(), vscode.TreeItemCollapsibleState.Collapsed,'ActivityTreeItem'));
  if(activityProjectJson.projectType === "ui"){
    treeDir.push(new ActivityTreeItem(getLcdDriverDesc(),"",vscode.TreeItemCollapsibleState.None,'ActivityTreeItem'));
    treeDir.push(new ActivityTreeItem(getTpDriverDesc(),"",vscode.TreeItemCollapsibleState.None,'ActivityTreeItem'));
    treeDir.push(new ActivityTreeItem(getUiDesignDesc(), '', vscode.TreeItemCollapsibleState.None,'ActivityTreeItem'));
  }
  treeDir.push(new ActivityTreeItem(getactiveProjectConfigDesc(), '', vscode.TreeItemCollapsibleState.None,'ActivityTreeItem'));
  treeDir.push(new ActivityTreeItem(getDownloadCoreDesc(), getDistinguishMark(), vscode.TreeItemCollapsibleState.None,'ActivityTreeItem'));
  treeDir.push(new ActivityTreeItem(getProductionFileDesc(), '', vscode.TreeItemCollapsibleState.None,'ActivityTreeItem'));
  treeDir.push(new ActivityTreeItem(getSimulatorDesc(), '', vscode.TreeItemCollapsibleState.None,'ActivityTreeItem'));
  treeDir.push(new ActivityTreeItem(getConnectPort(), getDistinguishMark(), vscode.TreeItemCollapsibleState.None,'ActivityTreeItem'));
  return treeDir;
}

// 活动工程子数据刷新
function childrenDataInit(element: any,activityPath) {
  const treeDir: ActivityTreeItem[] = [];
  const fileParentPath: string = element['parentPath'];
  const filename: string = element['label'];
  const libPath: string = getProjectConfigLibPath(activityPath);
  if (path.join(fileParentPath, filename) === libPath) {
    const files = fs.readdirSync(libPath);
    for (let i = 0; i < files.length; i++) {
      const childrenFileName: string = files[i];
      const childrenFilePath: string = path.join(libPath, childrenFileName);
      if (fs.statSync(childrenFilePath).isFile()) {
        treeDir.push(new ActivityTreeItem(childrenFileName, libPath, vscode.TreeItemCollapsibleState.None,'ActivityTreeItem'));
      }
      else {
        treeDir.unshift(new ActivityTreeItem(childrenFileName, libPath, vscode.TreeItemCollapsibleState.Collapsed,'ActivityTreeItem'));
      }
    }
  }
  else if(filename=== getHelp() &&  fileParentPath===getDistinguishMark()){
    treeDir.push(new ActivityTreeItem(getHardwareDesc(), getDistinguishMark(), vscode.TreeItemCollapsibleState.None,'ActivityTreeItem'));
    treeDir.push(new ActivityTreeItem(getApiDesc(), getDistinguishMark(), vscode.TreeItemCollapsibleState.None,'ActivityTreeItem'));
  }
  else {
    let filePath: string;
    if (path.dirname(activityPath) === fileParentPath) {
      filePath = activityPath;
    }
    else {
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
            treeDir.push(new ActivityTreeItem(childrenFileName, filePath, vscode.TreeItemCollapsibleState.None,'ActivityTreeItemShow'));
          }
          else {
            treeDir.unshift(new ActivityTreeItem(childrenFileName, filePath, vscode.TreeItemCollapsibleState.Collapsed,'ActivityTreeItemShow'));
          }
        }
      }
    }
    else {
      vscode.window.showErrorMessage('Active project directory expansion failed, the plugin appFile item gets abnormally', { modal: true });
    }
  }
  return treeDir;
}

export class ActivityTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,      //存储当前标签
    public readonly parentPath: string,   //存储当前标签的路径，不包含该标签这个目录
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly type:string
  ) {
    super(label, collapsibleState);
    const selectPath = path.join(parentPath, label);
    const configDarkIconPath:string = getConfigDarkIconPath();
    const configLightIconPath:string = getConfigLightIconPath();
    const configIconPath = vscode.window.activeColorTheme.kind === 1 ? configLightIconPath : configDarkIconPath;
    switch (selectPath) {
      case getactiveProjectConfigDesc():
        this.iconPath = configIconPath;
        break;
      case getProductionFileDesc():
        this.iconPath = configIconPath;
        break;
      case getUiDesignDesc():
        this.iconPath = configIconPath;
        break;
      case getSimulatorDesc():
        this.iconPath = configIconPath;
        break;
      case  getDistinguishMark()+"\\"+getDownloadCoreDesc():
        this.iconPath = configIconPath;
        break;
      case getLcdDriverDesc():
        this.iconPath = configIconPath;
        break;
      case getTpDriverDesc():
        this.iconPath = configIconPath;
        break;
      default:
          if(selectPath.startsWith(getDistinguishMark()+"\\通讯口:")){
            this.iconPath = configIconPath;
            break;
          }
          break;
    }
  }

  //为每项添加点击事件的命令
  command = {
    title: "Click to open",
    command: 'luatide-activity-project.click',
    arguments: [    //传递两个参数
      this.label,
      this.parentPath,
    ]
  };
  tooltip = this.parentPath;
  contextValue = this.type;
}

 /* 实时检测主题颜色变化,刷新设置颜色 */
vscode.window.onDidChangeActiveColorTheme((e) => {
  vscode.commands.executeCommand('luatide-activity-project.Project.refresh');
});