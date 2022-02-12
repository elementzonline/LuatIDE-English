import * as vscode from 'vscode';
import * as path from 'path';
import * as cp from 'child_process';


export class LuaFormatProvider implements vscode.DocumentFormattingEditProvider {
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    public provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): Thenable<vscode.TextEdit[]> {
        const data = document.getText();

        return new Promise((resolve, reject) => {
            let binaryPath = `${this.context.extensionPath}/tools/luaformat/lua-format`;

            const args = [];

            let cwd:any = undefined;
            if (document.uri.toString().startsWith('file://')) {
                cwd = path.dirname(document.fileName);
            }

            const cmd = cp.spawn(binaryPath, args, { cwd });
            const result: Buffer[] = [], errorMsg: Buffer[] = [];
            cmd.on('error', err => {
                vscode.window.showErrorMessage(`lua格式化代码出错: '${err.message}'`);
                reject(err);
            });
            cmd.stdout.on('data', data => {
                result.push(Buffer.from(data));
            });
            cmd.stderr.on('data', data => {
                errorMsg.push(Buffer.from(data));
            });
            cmd.on('exit', code => {
                const resultStr = Buffer.concat(result).toString();
                const errorMsgStr = Buffer.concat(errorMsg).toString();
                if (code) {
                    reject();
                    return;
                }
                if (resultStr.length > 0) {
                    const range = document.validateRange(new vscode.Range(0, 0, Infinity, Infinity));
                    resolve([new vscode.TextEdit(range, resultStr)]);
                } else {
                    reject(`格式化出现异常:: ${errorMsgStr}`);
                }
            });
            cmd.stdin.write(data);
            cmd.stdin.end();
        });
    }
}

export class LuaRangeFormatProvider implements vscode.DocumentRangeFormattingEditProvider {
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    public provideDocumentRangeFormattingEdits(document: vscode.TextDocument,range:vscode.Range, options: vscode.FormattingOptions, token: vscode.CancellationToken): Thenable<vscode.TextEdit[]> {
        let data = document.getText();
		data = data.substring(document.offsetAt(range.start), document.offsetAt(range.end));
        return new Promise((resolve, reject) => {
            let binaryPath = `${this.context.extensionPath}/tools/luaformat/lua-format`;
            const args = [];
            let cwd:any = undefined;
            if (document.uri.toString().startsWith('file://')) {
                cwd = path.dirname(document.fileName);
            }
            const cmd = cp.spawn(binaryPath, args, { cwd });
            const result: Buffer[] = [], errorMsg: Buffer[] = [];
            cmd.on('error', err => {
                vscode.window.showErrorMessage(`lua格式化代码出错: '${err.message}'`);
                reject(err);
            });
            cmd.stdout.on('data', data => {
                result.push(Buffer.from(data));
            });
            cmd.stderr.on('data', data => {
                errorMsg.push(Buffer.from(data));
            });
            cmd.on('exit', code => {
                const resultStr = Buffer.concat(result).toString();
                const errorMsgStr = Buffer.concat(errorMsg).toString();
                if (code) {
                    reject();
                    return;
                }
                if (resultStr.length > 0) {
                    // const range = document.validateRange(new vscode.Range(0, 0, Infinity, Infinity));
                    resolve([new vscode.TextEdit(range, resultStr)]);
                } else {
                    reject(`格式化代码出现异常: ${errorMsgStr}`);
                }
            });
            cmd.stdin.write(data);
            cmd.stdin.end();
        });
    }
}