import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import { getPluginConfigActivityProject } from '../../plugConfigParse';
import { getProjectConfigLibPath } from '../../project/projectConfigParse';
import { getAir72XUXDefaultLatestLibPath } from '../../variableInterface';
import { URI } from 'vscode-uri';	
// add "vscode-languageclient": "^5.2.1" in package.json and run: npm install
import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind
} from 'vscode-languageclient';
// import { getPluginConfigActivityProject } from '../../plugConfigParse';
// import { getProjectConfigLibPath } from '../../project/projectConfigParse';
// import { getAir72XUXDefaultLatestLibPath } from '../../variableInterface';
	

export function clientOperation(context) {
    /*************************lsp */                                         
    // 指定服务器入口文件路径
    const serverModule = context.asAbsolutePath(
        path.join('out','LSP', 'server', 'server.js'));

    // debug选项
    // 必须用F5调试模式打开插件，才有效
    // --inspect=21332表示server.js在21332监听debug连接
    // 在Debug-->Add Configuration里加一个选项Attack，注意新增的端口和监听端口对应
    // 用F5打开插件后，创建对应的文件激活插件，然后在左边栏切换到Debug View
    // 在Debug选项里选择Attach，即可连接到服务器，这时就可以断点调试server了
    // 如果断点显示Unverified breakpoint，应该是当前调试session不对，在debug界面应该
    // 能看到两个session，一个Run Extension，一个Attack，选中Attack即可
    const debugOptions = { execArgv: ['--nolazy', '--inspect=21332'] };
    console.log(`LSP server path:${serverModule}`);
    // If the extension is launched in debug mode then the debug server options
    // are used Otherwise the run options are used
    const serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: TransportKind.ipc,
            options: debugOptions
        }
    };

    // Options to control the language client
    const clientOptions: LanguageClientOptions = {
        // 设置触发插件功能
        // lua为后缀的文件或者语言为Lua的untitled文件(新建一个文件，还没保存)
        documentSelector: [
            { scheme: 'file', language: 'lua' },
            { language: 'lua', scheme: 'untitled' }
        ],
        synchronize: {
            // Notify the server about file changes
            configurationSection: ['lua'],
            // 检测文件变动，onDidChangeWatchedFiles事件才会触发
            fileEvents: vscode.workspace.createFileSystemWatcher('**/*.lua')
        }
    };

    // Create the language client and start the client.
    const client = new LanguageClient(
        'luatide-lsp',
        'luatide-lsp',
        serverOptions,
        clientOptions
    );
    /*--start--获取活动工程libPath*/ 
    const workspacePath:string = getPluginConfigActivityProject();
    let libPath:string;
    if (fs.existsSync(workspacePath)) {
        libPath = getProjectConfigLibPath(workspacePath);
        if (libPath==="") {
            libPath = getAir72XUXDefaultLatestLibPath();
        }
    }
    else{
        libPath = "";
    }
    
    /*--end--获取活动工程libPath*/ 
    client.onReady().then(() => {
        // client.sendNotification("libPath",libPath);
        client.sendNotification("activeProjectPath",URI.file(workspacePath).toString());
        client.sendNotification("libPath",URI.file(libPath).toString());
        // console.log('==发送成功',libPath);
        // 收到server的自定义消息
        client.onNotification("__error", (ctx: string) => {
            vscode.window.showErrorMessage(`${ctx}`);
        });
    });

    // "luatide-lsp.trace.server": "verbose"
    // 把这个添加到设置(没错，就是File-->Preferences-->Setting)
    // F5调试插件，激活插件
    // 在新打开的的vsc里的控制台OUTPUT里即可看到这个选项，可以看到server日志

    // Start the client. This will also launch the server
    const disposableClt = client.start();
    // 在插件deactivate时，把这个client销毁掉
    context.subscriptions.push(disposableClt);
    /*************************lsp */
}

// class LspOperation {
//     constructor() {
        
//     }

//     start(){

//     }

//     stop(){

//     }
// }
