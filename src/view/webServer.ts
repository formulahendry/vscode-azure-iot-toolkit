import * as express from "express";
import * as http from "http";
import * as path from "path";
import * as vscode from "vscode";

export class WebServer {
    private _app = express();
    private _server;
    private _port: string;

    constructor(context: vscode.ExtensionContext) {
        this._app.use("/", express.static(context.asAbsolutePath("out/html")));
        this._app.get("/", (req, res) => {
            res.sendFile(context.asAbsolutePath("out/html/index.html"));
        });
        this._server = http.createServer(this._app);
    }

    public start(): void {
        const port = this._server.listen(0).address().port;
        // tslint:disable-next-line
        console.log(`Starting express server on port: ${port}`);
        this._port = port;
    }

    public getServerUrl(): string {
        return `http://localhost:${this._port}`;
    }
}
