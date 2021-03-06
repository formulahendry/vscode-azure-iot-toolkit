"use strict";
import { ConnectionString } from "azure-iot-device";
import * as vscode from "vscode";
import { AppInsightsClient } from "./appInsightsClient";
import { BaseExplorer } from "./baseExplorer";
import { DeviceItem } from "./Model/DeviceItem";
import { Utility } from "./utility";
import iothub = require("azure-iothub");

export class DeviceExplorer extends BaseExplorer {
    constructor(outputChannel: vscode.OutputChannel) {
        super(outputChannel);
    }

    public async listDevice() {
        let label = "Device";
        let iotHubConnectionString = await Utility.getConfig("iotHubConnectionString", "IoT Hub Connection String");
        if (!iotHubConnectionString) {
            return;
        }

        let registry = iothub.Registry.fromConnectionString(iotHubConnectionString);
        this._outputChannel.show();
        this.outputLine(label, "Querying devices...");
        AppInsightsClient.sendEvent(`${label}.List`);
        registry.list((err, deviceList) => {
            this.outputLine(label, `${deviceList.length} device(s) found`);
            deviceList.forEach((device, index) => {
                this.outputLine(`${label}#${index + 1}`, JSON.stringify(device, null, 2));
            });
        });
    }

    public async getDevice(deviceId: string) {
        let label = "Device";
        let iotHubConnectionString = await Utility.getConfig("iotHubConnectionString", "IoT Hub Connection String");
        if (!iotHubConnectionString) {
            return;
        }

        let hostName = Utility.getHostName(iotHubConnectionString);
        let registry = iothub.Registry.fromConnectionString(iotHubConnectionString);
        this._outputChannel.show();
        this.outputLine(label, `Querying device [${deviceId}]...`);
        registry.get(deviceId, this.done("Get", label, hostName));
    }

    public async createDevice() {
        let label = "Device";
        let iotHubConnectionString = await Utility.getConfig("iotHubConnectionString", "IoT Hub Connection String");
        if (!iotHubConnectionString) {
            return;
        }

        let hostName = Utility.getHostName(iotHubConnectionString);
        let registry = iothub.Registry.fromConnectionString(iotHubConnectionString);

        await vscode.window.showInputBox({ prompt: "Enter device id to create" }).then((deviceId: string) => {
            if (deviceId !== undefined) {
                let device = {
                    deviceId,
                };
                this._outputChannel.show();
                this.outputLine(label, `Creating device '${device.deviceId}'`);
                registry.create(device, this.done("Create", label, hostName));
            }
        });
    }

    public async deleteDevice(deviceItem?: DeviceItem) {
        let label = "Device";
        let iotHubConnectionString = await Utility.getConfig("iotHubConnectionString", "IoT Hub Connection String");
        if (!iotHubConnectionString) {
            return;
        }
        let registry = iothub.Registry.fromConnectionString(iotHubConnectionString);

        if (deviceItem.label) {
            await this.deleteDeviceById(deviceItem.label, label, registry);
        } else {
            await vscode.window.showInputBox({ prompt: "Enter device id to delete" }).then((deviceId: string) => {
                if (deviceId !== undefined) {
                    this.deleteDeviceById(deviceId, label, registry);
                }
            });
        }
    }

    private deleteDeviceById(deviceId: string, label: string, registry: iothub.Registry): void {
        this._outputChannel.show();
        this.outputLine(label, `Deleting device ${deviceId}`);
        registry.delete(deviceId, this.done("Delete", label));
    }

    private done(op: string, label: string, hostName: string = null) {
        return (err, deviceInfo, res) => {
            if (err) {
                AppInsightsClient.sendEvent(`${label}.${op}`, { Result: "Fail" });
                this.outputLine(label, `[${op}] error: ${err.toString()}`);
            }
            if (res) {
                let result = "Fail";
                if (res.statusCode < 300) {
                    result = "Success";
                }
                AppInsightsClient.sendEvent(`${label}.${op}`, { Result: result });
                this.outputLine(label, `[${op}][${result}] status: ${res.statusCode} ${res.statusMessage}`);
            }
            if (deviceInfo) {
                if (deviceInfo.authentication.SymmetricKey.primaryKey != null) {
                    deviceInfo.connectionStringWithSharedAccessKey = ConnectionString.createWithSharedAccessKey(hostName,
                        deviceInfo.deviceId, deviceInfo.authentication.SymmetricKey.primaryKey);
                }
                if (deviceInfo.authentication.x509Thumbprint.primaryThumbprint != null) {
                    deviceInfo.connectionStringWithX509Certificate = ConnectionString.createWithX509Certificate(hostName, deviceInfo.deviceId);
                }
                this.outputLine(label, `[${op}] device info: ${JSON.stringify(deviceInfo, null, 2)}`);
            }
        };
    }
}
