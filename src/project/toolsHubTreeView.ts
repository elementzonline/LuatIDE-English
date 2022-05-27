import * as vscode from 'vscode';
// let pluginJsonParse = new PluginJsonParse();
// let projectJsonParse = new ProjectJsonParse();
export class ToolsHubTreeDataProvider implements vscode.TreeDataProvider<ToolsHubTreeItem> {
  constructor() { }

  private _onDidChangeTreeData: vscode.EventEmitter<ToolsHubTreeItem | undefined | null | void> = new vscode.EventEmitter<ToolsHubTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<ToolsHubTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ToolsHubTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: ToolsHubTreeItem): Thenable<ToolsHubTreeItem[]> {
    var treeDir: ToolsHubTreeItem[] = [];
    if (element === undefined) {
      treeDir.push(new ToolsHubTreeItem("串口监视器", "LuatIDE串口监视器", vscode.TreeItemCollapsibleState.None));
      return Promise.resolve(treeDir);
    }
    else {
        // 保留用于工具集合功能扩展
        return Promise.resolve(treeDir);
    }
  }

}

export class ToolsHubTreeItem extends vscode.TreeItem {
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
    command: 'luatide-tools-hub.click',
    arguments: [    //传递两个参数
      this.label,
      this.parentPath
    ]
  };
  tooltip = this.parentPath;
  contextValue = 'ToolsHubTreeItem';
}