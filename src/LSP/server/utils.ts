import {
    Connection,
    Diagnostic,
} from 'vscode-languageserver';

import * as fs from "fs";
import * as path from "path";
import { URI } from 'vscode-uri';
import { Setting } from './setting';
import { SymInfoEx } from './symbol';

type WalkerCallBack = (uri: string, ctx: string) => void;

export class DirWalker {
    private static ins: DirWalker;

    private files: number = 0;
    private constructor() {
    }

    public static instance() {
        if (!DirWalker.ins) {
            DirWalker.ins = new DirWalker();
        }

        return DirWalker.ins;
    }

    // 遍历单个目录的Lua文件
    private async walkDir(dirPath: string, callBack: WalkerCallBack) {
        if (Setting.instance().isExcludeDotDir(dirPath)) {
            return;
        }

        // 当使用 withFileTypes 选项设置为 true 调用 fs.readdir() 或
        // fs.readdirSync() 时，生成的数组将填充 fs.Dirent 对象，而不是路径字符串
        const files = await fs.promises.readdir(
            dirPath, { withFileTypes: true });

        for (const file of files) {
            const subPath = path.join(dirPath, file.name);

            if (file.isDirectory()) {
                await this.walkDir(subPath, callBack);
            }
            else if (file.isFile()) {
                await this.walkFile(subPath, callBack);
            }

        }
    }

    // 处理单个Lua文件
    public async walkFile(
        filePath: string, callBack: WalkerCallBack, rawUri?: string) {
        if (!filePath.endsWith(".lua")) {
            return;
        }

        // uri总是用/来编码，在win下，路径是用\的
        // 这时编码出来的uri和vs code传进来的就会不一样，无法快速根据uri查询符号
        const uri = rawUri || URI.from({
            scheme: "file",
            path: filePath.replace(/\\/g, "/")
        }).toString();

        const data = await fs.promises.readFile(filePath);

        this.files++;
        callBack(uri, data.toString());
    }

    public async walk(dirPath: string, callBack: WalkerCallBack) {
        this.files = 0;
        const rootPath = Setting.instance().parseRootPath(dirPath);

        try {
            await this.walkDir(rootPath, callBack);
        } catch (e) {
            Utils.instance().anyError(e);
        }

        return this.files;
    }
}

export class Utils {
    private static ins: Utils;
    private conn: Connection | null = null;

    private constructor() {
    }

    public static instance() {
        if (!Utils.ins) {
            Utils.ins = new Utils();
        }

        return Utils.ins;
    }

    public initialize(conn: Connection) {
        this.conn = conn;
    }

    // 写日志到终端，设置了luaide-lsp.trace: verbose就可以在OUTPUT看到
    public log(ctx: string) {
        this.conn!.console.log(ctx);
    }

    // 导出全局符号，不常用，直接用同步写入就可以了
    public writeGlobalSymbols(symList: SymInfoEx[]) {
        const fileName = Setting.instance().getExportPath();
        const option: fs.WriteFileOptions = { encoding: "utf8", flag: "a" };

        const rootUri = Setting.instance().getRoot();

        // 按名字排序，防止git等版本工具提示变更太多
        symList.sort((a: SymInfoEx, b: SymInfoEx) => {
            if (a.name < b.name) {
                return -1;
            } else if (a.name > b.name) {
                return 1;
            } else {
                return 0;
            }
        });

        fs.writeFileSync(fileName,
            // eslint-disable-next-line max-len
            `-- auto export by luatide-lsp ${symList.length} symbols\n\nreturn {\n`,
            { encoding: "utf8", flag: "w" });

        // let lastUri: string | null = null;
        for (const sym of symList) {
            // if (lastUri !== sym.location.uri) {
            //     lastUri = sym.location.uri;
            //     syncfs.writeFileSync(fileName, `\n-- ${lastUri}\n`, option);
            // }

            const file = sym.location.uri.substring(rootUri.length + 1);
            fs.writeFileSync(fileName,
                `"${sym.name}", -- ${file}\n`, option);
        }
        fs.writeFileSync(fileName, `}\n`, option);
    }

    public static pad(num: number, size: number) {
        let s = String(num);
        while (s.length < (size || 2)) { s = "0" + s; }
        return s;
    }

    // 写日志到文件
    // 测试时，不好调试的可以用日志来调试
    public logFile(ctx: string) {
        const date = new Date();

        const month = Utils.pad(date.getMonth(), 2);
        const day = Utils.pad(date.getMonth(), 2);
        const hour = Utils.pad(date.getHours(), 2);
        const min = Utils.pad(date.getMinutes(), 2);
        const sec = Utils.pad(date.getSeconds(), 2);

        const now =
            `${date.getFullYear()}-${month}-${day} ${hour}:${min}:${sec} `;
        fs.writeFileSync("luatide-lsp.log", now, { encoding: "utf8", flag: "a" });
        fs.writeFileSync("luatide-lsp.log", ctx, { encoding: "utf8", flag: "a" });
        fs.writeFileSync("luatide-lsp.log", "\n", { encoding: "utf8", flag: "a" });
    }

    public anyError(e: any) {
        let msg = "unknow";
        if (e) {
            const name: string = e.name || "unknow";
            const message: string = e.message || "unknow";
            const stack: string = e.stack || "";
            msg = `name: ${name}\nmessage: ${message}\nstack: ${stack}`;
        }

        this.error(msg);
    }

    public error(ctx: string) {
        // 发送自定义协议，这个要在client那定定义一个接收函数
        this.conn!.sendNotification("__error", ctx);
    }

    public diagnostics(uri: string, diags: Diagnostic[]): void {
        this.conn!.sendDiagnostics({ uri: uri, diagnostics: diags });
    }

    // set file executable, use sync make sure luacheck executable before run
    // luacheck
    public setExec(exePath: string) {
        const stat = fs.statSync(exePath);
        if (stat.mode & fs.constants.S_IXUSR) {
            return; // already have permission
        }
        fs.chmodSync(exePath, stat.mode | fs.constants.S_IXUSR);
    }
}

