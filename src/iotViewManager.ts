"use strict";
import * as vscode from "vscode";
import { IotContentProvider } from "./view/iotContentProvider";

export class IotViewManager {
    private _context: vscode.ExtensionContext;
    private _iotContentProvider: IotContentProvider;
    private _registration: vscode.Disposable;
    private _previewUri: vscode.Uri = vscode.Uri.parse("iot-toolkit://show-iot-view");

    constructor(context: vscode.ExtensionContext) {
        this._context = context;
        this._iotContentProvider = new IotContentProvider(context);
        this._registration = vscode.workspace.registerTextDocumentContentProvider("iot-toolkit", this._iotContentProvider);
    }

    public showIotView(): void {
        // this._iotContentProvider.update(this._previewUri);
        vscode.commands.executeCommand("vscode.previewHtml", this._previewUri, vscode.ViewColumn.Two, "IoT").then((success) => {
        }, (reason) => {
            vscode.window.showErrorMessage(reason);
        });
    }
}
