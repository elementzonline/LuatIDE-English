
import {
    Hover,
    Definition,
    createConnection,
    TextDocuments,
    ProposedFeatures,
    InitializeParams,
    CompletionItem,
    SymbolInformation,
    DocumentSymbolParams,
    WorkspaceSymbolParams,
    TextDocumentPositionParams,
    SymbolKind,
    Position,
    DidChangeWatchedFilesParams,
    TextDocumentChangeEvent,
    FileChangeType,
    InitializeResult,
    SignatureHelp,
    DidChangeConfigurationParams,
    TextDocumentSyncKind
} from 'vscode-languageserver';

import {
    TextDocument
} from 'vscode-languageserver-textdocument';

import {
    SymbolEx,
    SymbolQuery
} from "./symbol";

// can only be default-imported using the 'esModuleInterop' flag
// import assert from "assert";

import { URI } from 'vscode-uri';
import { Utils, DirWalker } from "./utils";
import { HoverProvider } from "./hoverProvider";
import { AutoCompletion } from "./autoCompletion";
import { GoToDefinition } from "./goToDefinition";
import { SignatureProvider } from "./signatureProvider";
import { DiagnosticProvider, CheckHow } from "./diagnosticProvider";
import { Setting, FileParseType } from './setting';
// import path = require('path');
// import fs = require('fs');
// const { Subject } = require('await-notify');

export const sleep = (ms)=> {
    return new Promise(resolve=>setTimeout(resolve, ms));
};

// https://code.visualstudio.com/api/language-extensions/language-server-extension-guide
export class Server {
    // Create a connection for the server. The connection uses Node's IPC as a transport.
    // Also include all preview / proposed LSP features.
    private connection = createConnection(ProposedFeatures.all);

    // Create a simple text document manager. The text document manager
    // supports full document sync only
    private documents = new TextDocuments(TextDocument);

    private rootUri: string | null = null;
    private rootWorkspace: string[] | null = [];
    // private rootWorkspaceState = false;
    // private rootWorkspaceMessage = new Subject();
    private isPreInit = false;
    private exportVer: number = 0;
    private exportSym = new Map<string, number>();

    public constructor() {
        const conn = this.connection;

        Utils.instance().initialize(conn);

        // TODO: wrap all function in try catch and send error to client
        // I didn't find a better way to do this. It is any ?
        // conn.onNotification(
        //     "libPath",(data,handler) =>{
        //         console.log('====000000',data);
        //         this.rootWorkspace?.push(URI.file(data).toString());
        //         console.log('====000end',this.rootWorkspace);
        //         // this.rootWorkspaceState=true;
        //         this.onInitialize(handler);
        //     }
        // );
        conn.onInitialize(handler => this.onInitialize(handler));
        conn.onNotification(async (method,handler) =>
        {
            switch (method) {
                case "activeProjectPath":
                    this.rootWorkspace?.push(handler);
                    break;
                case "libPath":
                    this.rootWorkspace?.push(handler);
                    break;
                default:
                    break;
            }
            try {
                // ?????????????????????????????????
                await this.preInitialized();
                // ?????????luacheck?????????????????????????????????????????????
                this.onInitialized();
            } catch (e) {
                Utils.instance().anyError(e);
            }
        }
        );
        conn.onInitialized(async () => {
            // try {
            //     // ?????????????????????????????????
            //     await this.preInitialized();
            //     // ?????????luacheck?????????????????????????????????????????????
            //     this.onInitialized();
            // } catch (e) {
            //     Utils.instance().anyError(e);
            // }
        });
        conn.onCompletion(handler => {
            try {
                return this.onCompletion(handler);
            } catch (e) {
                Utils.instance().anyError(e);
                return null;
            }
        });
        conn.onDocumentSymbol(handler => {
            try {
                return this.onDocumentSymbol(handler);
            } catch (e) {
                Utils.instance().anyError(e);
                return null;
            }
        });
        conn.onWorkspaceSymbol(handler => {
            try {
                return this.onWorkspaceSymbol(handler);
            } catch (e) {
                Utils.instance().anyError(e);
                return null;
            }
        });
        conn.onDefinition(handler => {
            try {
                return this.onDefinition(handler);
            } catch (e) {
                Utils.instance().anyError(e);
                return null;
            }
        });

        // TODO ???????????????????????????????????????
        // ????????????doc.onDidOpen???????????????
        conn.onDidChangeWatchedFiles(handler => {
            try {
                return this.onFilesChange(handler);
            } catch (e) {
                Utils.instance().anyError(e);
                return null;
            }
        });
        conn.onHover(handler => {
            try {
                return this.onHover(handler);
            } catch (e) {
                Utils.instance().anyError(e);
                return null;
            }
        });
        conn.onSignatureHelp(handler => {
            try {
                return this.onSignature(handler);
            } catch (e) {
                Utils.instance().anyError(e);
                return null;
            }
        });
        conn.onDidChangeConfiguration(handler => {
            try {
                return this.onConfiguration(handler);
            } catch (e) {
                Utils.instance().anyError(e);
                return null;
            }
        });
        conn.onNotification("__export", () => {
            try {
                const symList = SymbolEx.instance().getGlobalSymbolList();
                Utils.instance().writeGlobalSymbols(symList);
            } catch (e) {
                Utils.instance().anyError(e);
                return null;
            }
        },);
        const doc = this.documents;
        doc.onDidSave(handler => {
            try {
                return this.onSaveDocument(handler);
            } catch (e) {
                Utils.instance().anyError(e);
                return null;
            }
        });
        doc.onDidChangeContent(async handler => {
            try {
                await this.waitForPreInit();
                return this.onDocumentChange(handler);
            } catch (e) {
                Utils.instance().anyError(e);
                return null;
            }
        });

        // doc???????????????????????? documentSelector ????????????????????????lua??????????????????
        doc.onDidClose(async handler => {
            // if a file is not in workspace, make sure clear it's diagnostic
            // message after it close
            try {
                const uri = handler.document.uri;
                const ft = Setting.instance().getFileType(uri, 1);
                if (ft & FileParseType.FPT_SINGLE) {
                    DiagnosticProvider.instance().deleteChecking(uri);
                }
            } catch (e) {
                Utils.instance().anyError(e);
                return null;
            }
        });
        doc.onDidOpen(async handler => {
            try {
                await this.waitForPreInit();
                if (Setting.instance().isCheckOnFileOpen()) {
                    DiagnosticProvider.instance().check(
                        handler.document.uri, handler.document.getText());
                }
            } catch (e) {
                Utils.instance().anyError(e);
                return null;
            }
        });
    }

    public init() {
        this.documents.listen(this.connection);
        this.connection.listen();
    }

    private async waitForPreInit() {
        if (this.isPreInit) {
            return true;
        }

        // could not find a better way to wait...
        for (let ts = 0; ts < 32; ts++) {
            const ok = await new Promise((resolve) => setTimeout(() => {
                resolve(this.isPreInit);
            }, 100));

            if (ok) {
                return ok;
            }
        }

        return true;
    }

    private onInitialize(params: InitializeParams): InitializeResult {
        // TODO no multi dir support for now
        // const folders = params.workspaceFolders;
        // console.log('====8',params);
        // let projectLibPath;
        // if (params.rootPath) {
        //     projectLibPath =  this.getLibPath(params.rootPath);
        //     if (projectLibPath!=="" && !fs.existsSync(projectLibPath)) {
        //         projectLibPath = '';
        //         console.log('lib????????????????????????');
        //     }
        // }

        // // let projectLibPath = 'C:\\Users\\AAA\\AppData\\Roaming\\LuatIDE\\LuatideLib\\Air72XUX_LIB\\V2.4.2\\lib';

        // // console.log('====test',this.rootWorkspace);
        // if (folders && folders.length > 0) {
        //     // this.rootUri = folders[0].uri;
        //     // Utils.instance().log(`using ${this.rootUri} as root`)
         
        //     // console.log(projectLibPath,'====12');
        //     for (let index = 0; index < folders.length; index++) {
        //         this.rootWorkspace?.push(folders[index].uri.toString());  
        //     }
        //     if (this.rootWorkspace?.indexOf(projectLibPath)===-1 && projectLibPath!=="") {
        //         this.rootWorkspace?.push(URI.file(projectLibPath).toString());
        //     }
        // }
        // while (true) {
        //     if (this.rootWorkspaceState===true) {
        //         break;
        //     }
        //     else{
        //         this.rootWorkspaceMessage.wait(1000);
        //         await sleep(1000);
        //         console.log('====001');
        //         continue;
        //     }
        // }
        
        console.log('====init',this.rootWorkspace);
        return {
            capabilities: {
                // Use full sync mode for now.
                // TODO: Add support for Incremental changes. Full syncs will not scale very well.
                textDocumentSync: TextDocumentSyncKind.Incremental,
                // ????????????????????????????????????(Outliine) CTRL + SHIFT + O
                documentSymbolProvider: false,
                workspaceSymbolProvider: false, // ?????????????????? CTRL + T
                definitionProvider: true, // go to definition
                completionProvider: { // ???.??????:?????????????????????????????????
                    // resolve??????????????????????????????????????????????????????????????????
                    resolveProvider: false,
                    // ??????????????????????????????
                    // ??????????????????vs code???????????????????????????????????????
                    // ??????????????????????????????????????????????????????????????????????????????????????????
                    triggerCharacters: ['.', ':']
                },
                hoverProvider: true, // ??????????????????????????????

                // ????????????????????????
                signatureHelpProvider: {
                    triggerCharacters: ["(", ","]
                },
                //documentFormattingProvider: true, // ?????????????????????
                //documentRangeFormattingProvider: true // ?????????????????????
            }
        };
    }

    private async preInitialized() {
        if (!this.rootWorkspace) {
            return;
        }

        const diagnostic = DiagnosticProvider.instance();
        diagnostic.updateCmdArgs();

        this.isPreInit = true;
    }

    private async onInitialized() {
    
        if (!this.rootWorkspace) {
            return;
        }
        const symbol = SymbolEx.instance();
        // console.log('==========44',this.rootWorkspace);
        for (let index = 0; index < this.rootWorkspace.length; index++) {
            const rootUri = this.rootWorkspace[index];
            // console.log('==========55',rootUri);
            const uri = URI.parse(rootUri);
            // console.log('=============66',uri);
            
            const diagnostic = DiagnosticProvider.instance();

            const checkOnInit = Setting.instance().isCheckOnInit();
            const files = await DirWalker.instance().walk(
                uri.fsPath, (uri, ctx) => {
                    // console.log('=============77',uri);
                    symbol.parse(uri, ctx, true);
                    if (checkOnInit) {
                        diagnostic.check(uri, ctx, CheckHow.INITIALIZE);
                    }
                });
            Utils.instance().log(
                // eslint-disable-next-line max-len
                `luatide-lsp LSP initialized done:${this.rootUri} files:${files}`);
        }   
        symbol.setCacheOpen();
        symbol.loadStl();

           
        const interval = Setting.instance().getExportInterval();
        if (interval > 0) {
            setInterval(() => {
                this.exportGlobalTimeout();
            }, interval * 1000);
        }
    }

    // ????????????????????????
    private exportGlobalTimeout() {
        const symbol = SymbolEx.instance();

        // no change
        if (this.exportVer === symbol.getUpdateVersion()) {
            return;
        }

        this.exportVer = symbol.getUpdateVersion();
        const symList = symbol.getGlobalSymbolList();

        let change = false;
        if (symList.length === this.exportSym.size) {
            for (const sym of symList) {
                if (!this.exportSym.get(sym.name)) {
                    change = true;
                    break;
                }
            }
        } else {
            change = true;
        }

        if (!change) {
            return;
        }

        this.exportSym.clear();
        for (const sym of symList) {
            this.exportSym.set(sym.name, 1);
        }

        Utils.instance().writeGlobalSymbols(symList);
    }

    // ???????????????????????????
    private onDocumentSymbol(
        handler: DocumentSymbolParams): SymbolInformation[] {
        const uri = handler.textDocument.uri;

        // return [
        //     {
        //         name: "luatide-lsp",
        //         kind: SymbolKind.Function,
        //         location: { uri: uri, range: { start: { line: 1, character: 0 },
        //         end: { line: 1, character: 5 } } }
        //     }
        // ];

        // ????????????????????????????????????????????????
        // ?????????????????????????????????????????????????????????????????????????????????????????????
        // ???????????????????????????????????????????????????????????????
        const symbol = SymbolEx.instance();
        let symList = symbol.getDocumentSymbol(uri);

        if (!symList) {
            const document = this.documents.get(uri);
            if (!document) {
                return [];
            }

            const text = document.getText();
            symList = symbol.parse(uri, text);
        }

        return symList ? symList : [];
    }

    // ???????????????????????????(??????????????????)
    private onWorkspaceSymbol(
        handler: WorkspaceSymbolParams): SymbolInformation[] | null {
        const query = handler.query.trim();
        if (query === "") {
            return null;
        }

        return SymbolEx.instance().getAnySymbol(true, sym => {
            return SymbolEx.checkMatch(query, sym.name) > -500;
        }, 128);
    }

    // ??????????????????????????????????????????
    public getQueryText(uri: string, pos: Position): string | null {
        const document = this.documents.get(uri);

        if (!document) {
            return null;
        }

        // vs code???????????????????????????0??????????????????????????????Ln???Col??????1?????????

        // ???????????????????????????????????????????????????????????????????????????????????????
        return document.getText({
            start: { line: pos.line, character: 0 },
            end: { line: pos.line, character: 10240000 }
        });
    }

    // ???????????????????????????????????????????????????
    public getQuerySymbol(
        uri: string, text: string, pos: Position): SymbolQuery | null {
        // vs code??????????????????????????????????????????????????????????????????????????????????????????
        const leftText = text.substring(0, pos.character);
        const rightText = text.substring(pos.character);

        // let module = null;
        let name: string = "";
        let kind: SymbolKind = SymbolKind.Variable;

        // ???????????????m:test()??????m
        let base;
        let extBase;

        // ????????????????????????.??????:??????
        let indexer;

        let beg: number = pos.character;
        let end: number = pos.character;

        /*
         * https://javascript.info/regexp-groups
         * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match
         * \w???????????????????????????a-zA-Z0-9_
         * .|:?????????lua???m.n??????m:n???????????????
         * (\w+)?$????????????????????????????????????????????? ev: ???????????????????????????????????????
         * A:B.C.D.E: ==>  Array ["A:B.C.D.E:", "E:", undefined]
         * A:B.C.D.E:F ==> Array ["A:B.C.D.E:F", "E:", "F"]
         * ABC ==> Array ["ABC", undefined, "ABC"]
         */
        const leftWords = leftText.match(/(\w+[.|:])*(\w+)?$/);
        if (leftWords) {
            // match???????????????????????????????????? ??????????????????????????????????????????????????????
            if (leftWords[1]) {
                // A:B.C.D.E:F ==> Array ["A", "B", "C", "D", "E", "F"]
                const allBase = leftWords[0].split(/[.|:]/g);
                base = allBase[0];
                if (allBase.length > 2) {
                    extBase = allBase.slice(1, allBase.length - 1);
                }
            }
            if (leftWords[2]) {
                name = leftWords[2];
                // name????????????????????????????????????????????????????????????
                beg -= name.length;
            }
        }

        // test()?????????test???(????????????????????????????????????????????????????????????
        const rightWords = rightText.match(/^(\w+)\s*(\()?/);
        if (rightWords) {
            // test() ????????? ["test(","test","("]
            const rightSym = rightWords[1];
            if (rightSym) {
                name += rightSym;
                end += rightSym.length;
            }
            // ????????????????????????????????????
            if (rightWords[2]) {
                kind = SymbolKind.Function;
            }
        }

        const dotPos = text.lastIndexOf(".", beg);
        if (dotPos > 0) {
            indexer = ".";
        }
        const colonPos = text.lastIndexOf(":", beg);
        if (colonPos > dotPos) {
            indexer = ":";
        }

        return {
            uri: uri,
            base: base,
            name: name,
            kind: kind,
            extBase: extBase,
            position: { line: pos.line, beg: beg, end: end },
            text: text,
            indexer: indexer
        };
    }

    // ????????????????????????????????????????????????
    public ensureSymbolCache(uri: string) {
        if (SymbolEx.instance().getCache(uri)) {
            return;
        }
        const document = this.documents.get(uri);
        if (!document) {
            return;
        }

        SymbolEx.instance().rawParse(uri, document.getText());
    }

    // go to definetion
    private onDefinition(handler: TextDocumentPositionParams): Definition {
        return GoToDefinition.instance().doDefinition(
            this, handler.textDocument.uri, handler.position);
    }

    // ??????????????????
    private onCompletion(
        handler: TextDocumentPositionParams): CompletionItem[] | null {
        const uri = handler.textDocument.uri;

        return AutoCompletion.instance().doCompletion(
            this, uri, handler.position);
    }

    // ??????????????????????????????????????????????????????
    // ?????????????????????????????????????????????????????????????????????????????????????????????
    private onDocumentChange(handler: TextDocumentChangeEvent<TextDocument>) {
        const uri = handler.document.uri;
        const text = handler.document.getText();
        SymbolEx.instance().parse(uri, text);

        if (Setting.instance().isCheckOnTyping()) {
            DiagnosticProvider.instance().check(uri, text);
        }
    }

    // ?????????????????????????????????????????????????????????????????????
    private doFileChange(uri: string, doSym: boolean) {
        const path = URI.parse(uri);
        DirWalker.instance().walkFile(path.fsPath, (fileUri, ctx) => {
            if (doSym) {
                SymbolEx.instance().parse(fileUri, ctx);
            }
            if (Setting.instance().isLuaCheckOpen()) {
                DiagnosticProvider.instance().check(fileUri, ctx);
            }
        }, uri
        );
    }

    // ????????????
    private onFilesChange(handler: DidChangeWatchedFilesParams) {
        for (const event of handler.changes) {

            const uri = event.uri;
            const type = event.type;
            switch (type) {
                case FileChangeType.Created: {
                    this.doFileChange(uri, true);
                    break;
                }
                case FileChangeType.Changed: {
                    const doc = this.documents.get(uri);
                    // ??????????????????????????????????????????????????? onDocumentChange ??????
                    // ?????????????????????????????????
                    if (doc) {
                        this.doFileChange(uri, false);
                        return;
                    }

                    this.doFileChange(uri, true);
                    break;
                }
                case FileChangeType.Deleted: {
                    SymbolEx.instance().delDocumentSymbol(uri);
                    DiagnosticProvider.instance().deleteChecking(uri);
                    break;
                }
            } // switch
        } // for
    }

    private onHover(handler: TextDocumentPositionParams): Hover | null {
        // return {
        //     contents: {
        //         //language: "lua",
        //         kind: MarkupKind.Markdown,
        //         value: "```lua\nfunction(a, b) return a + b end\n```"
        //     },
        //     range: {
        //         start: { line: 0, character: 0 },
        //         end: { line: 1, character: 0 }
        //     }
        // };
        return HoverProvider.instance().doHover(
            srv, handler.textDocument.uri, handler.position);
    }

    // ???????????????????????????
    private onSignature(
        handler: TextDocumentPositionParams): SignatureHelp | null {

        const pos = handler.position;
        const uri = handler.textDocument.uri;
        const doc = this.documents.get(uri);

        if (!doc) {
            return null;
        }
        return SignatureProvider.instance().doSignature(
            this, uri, pos, doc.getText(), doc.offsetAt(pos));
    }

    // ????????????????????????????????????????????????????????????vs code
    private onConfiguration(handler: DidChangeConfigurationParams) {
        Setting.instance().setConfiguration(handler.settings);
        DiagnosticProvider.instance().updateCmdArgs();
    }

    // ????????????
    private onSaveDocument(handler: TextDocumentChangeEvent<TextDocument>) {
        if (!Setting.instance().isCheckOnSave()) {
            return;
        }
        const doc = handler.document;
        DiagnosticProvider.instance().check(doc.uri, doc.getText());
    }
}

const srv = new Server();
srv.init();

