// import * as vscode from 'vscode';
// import * as fs from 'fs';
// import * as path from 'path';


// export class LuatideProvider implements vscode.TreeDataProvider<Project> {
//     constructor(private workspaceRoot: string) {}
  
//     getTreeItem(element: Project): vscode.TreeItem {
//       return element;
//     }
  
//     getChildren(element?: any): Thenable<Project[]> {
//           if (element) {
//             return element.children;
//           }
//           return Promise.resolve([]);
//         }
  
// }
// let pluginConfigJsonPath:string =  "c:";

// private getitemInPluginConfigJson(pluginConfigJsonPath: string): Project[] {
//   if (fs.existsSync(pluginConfigJsonPath)) {
//     const pluginConfigJson = JSON.parse(fs.readFileSync(pluginConfigJsonPath, 'utf-8'));

//     const toDep = (projectPath: string, projectName: string): Project => {
//       if (fs.existsSync(path.join(projectPath, projectName))) {
//         return new Project(
//           projectPath,
//           projectName,
//           vscode.TreeItemCollapsibleState.Collapsed
//         );
//       } else {
//         return new Project(projectPath, projectName, vscode.TreeItemCollapsibleState.None);
//       }
//     };

//     const deps = pluginConfigJson.dependencies
//       ? Object.keys(pluginConfigJson.dependencies).map(dep =>
//           toDep(dep, pluginConfigJson.dependencies[dep])
//         )
//       : [];
//     const devDeps = pluginConfigJson.devDependencies
//       ? Object.keys(pluginConfigJson.devDependencies).map(dep =>
//           toDep(dep, pluginConfigJson.devDependencies[dep])
//         )
//       : [];
//     return deps.concat(devDeps);
//   } else {
//     return [];
//   }
// }

  // class Project extends vscode.TreeItem {
  //   constructor(
  //     public readonly label: string,
  //     private parentPath: string,
  //     public readonly collapsibleState: vscode.TreeItemCollapsibleState
  //   ) {
  //     super(label, collapsibleState);
  //     this.tooltip = path.join(this.parentPath,this.label);
  //     this.description = this.parentPath;
  //   }
  
  //   iconPath = {
  //     light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
  //     dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
  //   };
  // }
