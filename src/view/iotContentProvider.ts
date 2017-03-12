"use strict";
import * as path from "path";
import * as vscode from "vscode";
import { WebServer } from "./webServer";

export class IotContentProvider implements vscode.TextDocumentContentProvider {
    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
    private _webserver: WebServer;

    constructor(context: vscode.ExtensionContext) {
        this._webserver = new WebServer(context);
        this._webserver.start();
    }

    public provideTextDocumentContent(uri: vscode.Uri): string {
        return `
<body style="margin:0px;padding:0px;overflow:hidden">
    <iframe src="${this._webserver.getServerUrl()}" frameborder="0"
    style="overflow:hidden;overflow-x:hidden;overflow-y:hidden;height:100%;width:100%;
    position:absolute;top:0px;left:0px;right:0px;bottom:0px" height="100%" width="100%"></iframe>
</body>`;
    }

    get onDidChange(): vscode.Event<vscode.Uri> {
        return this._onDidChange.event;
    }

    public update(uri: vscode.Uri) {
        this._onDidChange.fire(uri);
    }
}
