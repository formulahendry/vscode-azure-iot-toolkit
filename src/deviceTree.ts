import { ConnectionString } from "azure-iot-device";
import * as path from "path";
import * as vscode from "vscode";
import { AppInsightsClient } from "./appInsightsClient";
import { DeviceItem } from "./Model/DeviceItem";
import { Utility } from "./utility";
import iothub = require("azure-iothub");

export class DeviceTree implements vscode.TreeDataProvider<DeviceItem> {
    public _onDidChangeTreeData: vscode.EventEmitter<DeviceItem | undefined> = new vscode.EventEmitter<DeviceItem | undefined>();
    public readonly onDidChangeTreeData: vscode.Event<DeviceItem | undefined> = this._onDidChangeTreeData.event;

    constructor(private context: vscode.ExtensionContext) {
    }

    public refresh(): void {
        this._onDidChangeTreeData.fire();
        AppInsightsClient.sendEvent("RefreshDeviceTree");
    }

    public getTreeItem(element: DeviceItem): vscode.TreeItem {
        return element;
    }

    public async getChildren(element?: DeviceItem): Promise<DeviceItem[]> {
        let iotHubConnectionString = await Utility.getConfig("iotHubConnectionString", "IoT Hub Connection String");
        if (!iotHubConnectionString) {
            return;
        }

        let registry = iothub.Registry.fromConnectionString(iotHubConnectionString);
        let devices = [];
        let hostName = Utility.getHostName(iotHubConnectionString);

        return new Promise<DeviceItem[]>((resolve, reject) => {
            registry.list((err, deviceList) => {
                if (err) {
                    reject(`[Failed to list IoT Hub devices] ${err.message}`);
                } else {
                    deviceList.forEach((device, index) => {
                        let image = device.connectionState.toString() === "Connected" ? "device-on.png" : "device-off.png";
                        let deviceConnectionString = "";
                        if (device.authentication.SymmetricKey.primaryKey != null) {
                            deviceConnectionString = ConnectionString.createWithSharedAccessKey(hostName, device.deviceId,
                                device.authentication.SymmetricKey.primaryKey);
                        } else if (device.authentication.x509Thumbprint.primaryThumbprint != null) {
                            deviceConnectionString = ConnectionString.createWithX509Certificate(hostName, device.deviceId);
                        }
                        devices.push(new DeviceItem(device.deviceId,
                            deviceConnectionString,
                            this.context.asAbsolutePath(path.join("resources", image)),
                            {
                                command: "azure-iot-toolkit.getDevice",
                                title: "",
                                arguments: [device.deviceId],
                            }));
                    });
                    resolve(devices);
                }
            });
        });
    }
}
