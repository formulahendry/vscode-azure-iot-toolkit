'use strict';
import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from 'child_process';
import { Utility } from './utility';
import { AppInsightsClient } from './appInsightsClient';
import { BaseExplorer } from './baseExplorer';
const devdiscoRelativePath = '../../node_modules/device-discovery-cli/';
const types = ['eth', 'usb', 'wifi'];

export class DeviceDiscoverer extends BaseExplorer {
    private _deviceStatus = {};

    constructor(outputChannel: vscode.OutputChannel, appInsightsClient: AppInsightsClient) {
        super(outputChannel, appInsightsClient);
    }

    public discoverDevice(): void {
        let label = 'Discovery';
        vscode.window.showQuickPick(types, { placeHolder: "Enter device type to discover" }).then((type) => {
            if (type !== undefined) {
                this._outputChannel.show();
                this.output(label, 'Start discovering device..');
                this._appInsightsClient.sendEvent(`${label}.${type}`);
                this.deviceDiscovery(type);
            }
        });
    }

    private deviceDiscovery(type: string): void {
        let devdiscoPath = path.resolve(__dirname, devdiscoRelativePath);
        this._outputChannel.appendLine(devdiscoPath);
        let process = exec(`devdisco list --${type}`, { cwd: devdiscoPath });
        
        process.stdout.on('data', (data) => {
            this._outputChannel.append(data);
        });

        process.stderr.on('data', (data) => {
            this._outputChannel.append(data);
        });
    }
}