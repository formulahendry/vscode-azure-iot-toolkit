"use strict";
import * as vscode from "vscode";
import { AppInsightsClient } from "./appInsightsClient";
import { AzureIoTExplorer } from "./azureIoTExplorer";
import { DeviceTree } from "./deviceTree";

export function activate(context: vscode.ExtensionContext) {
    if (vscode.extensions.getExtension("vsciot-vscode.azure-iot-toolkit")) {
        AppInsightsClient.sendEvent("OfficialExtension.Installed");
        return;
    }

    const viewExtension = "View official extension";
    const installExtension = "Install official extension";
    vscode.window.showWarningMessage<vscode.MessageItem>("This Azure IoT Toolkit is deprecated - please uninstall it and install the Microsoft official extension.",
        { title: viewExtension },
        { title: installExtension, isCloseAffordance: true },
    ).then((selection) => {
        switch (selection && selection.title) {
            case viewExtension:
                vscode.commands.executeCommand("vscode.open",
                    vscode.Uri.parse("https://marketplace.visualstudio.com/items?itemName=vsciot-vscode.azure-iot-toolkit"));
                AppInsightsClient.sendEvent("DeprecatedMessage.Open");
                break;
            case installExtension:
                const terminal = vscode.window.createTerminal("Install");
                terminal.show();
                terminal.sendText("code --install-extension vsciot-vscode.azure-iot-toolkit");
                terminal.sendText("code-insiders --install-extension vsciot-vscode.azure-iot-toolkit");
                AppInsightsClient.sendEvent("DeprecatedMessage.Install");
                break;
            default:
                AppInsightsClient.sendEvent("DeprecatedMessage.Dismiss");
        }
    });

    let azureIoTExplorer = new AzureIoTExplorer(context);
    let deviceTree = new DeviceTree(context);

    vscode.window.registerTreeDataProvider("iotHubDevicesDeprecated", deviceTree);

    context.subscriptions.push(vscode.commands.registerCommand("azure-iot-toolkit.refreshDeviceTree", () => {
        deviceTree.refresh();
    }));

    context.subscriptions.push(vscode.commands.registerCommand("azure-iot-toolkit.getDevice", (deviceId) => {
        azureIoTExplorer.getDevice(deviceId);
    }));

    let sendD2CMessage = vscode.commands.registerCommand("azure-iot-toolkit.sendD2CMessage", (DeviceItem) => {
        azureIoTExplorer.sendD2CMessage(DeviceItem);
    });

    let startMonitorIoTHubMessage = vscode.commands.registerCommand("azure-iot-toolkit.startMonitorIoTHubMessage", () => {
        azureIoTExplorer.startMonitorIoTHubMessage();
    });

    let stopMonitorIoTHubMessage = vscode.commands.registerCommand("azure-iot-toolkit.stopMonitorIoTHubMessage", () => {
        azureIoTExplorer.stopMonitorIoTHubMessage();
    });

    let sendC2DMessage = vscode.commands.registerCommand("azure-iot-toolkit.sendC2DMessage", (DeviceItem) => {
        azureIoTExplorer.sendC2DMessage(DeviceItem);
    });

    let startMonitorC2DMessage = vscode.commands.registerCommand("azure-iot-toolkit.startMonitorC2DMessage", (DeviceItem) => {
        azureIoTExplorer.startMonitorC2DMessage(DeviceItem);
    });

    let stopMonitorC2DMessage = vscode.commands.registerCommand("azure-iot-toolkit.stopMonitorC2DMessage", () => {
        azureIoTExplorer.stopMonitorC2DMessage();
    });

    let sendMessageToEventHub = vscode.commands.registerCommand("azure-iot-toolkit.sendMessageToEventHub", () => {
        azureIoTExplorer.sendMessageToEventHub();
    });

    let startMonitorEventHubMessage = vscode.commands.registerCommand("azure-iot-toolkit.startMonitorEventHubMessage", () => {
        azureIoTExplorer.startMonitorEventHubMessage();
    });

    let stopMonitorEventHubMessage = vscode.commands.registerCommand("azure-iot-toolkit.stopMonitorEventHubMessage", () => {
        azureIoTExplorer.stopMonitorEventHubMessage();
    });

    let listDevice = vscode.commands.registerCommand("azure-iot-toolkit.listDevice", () => {
        azureIoTExplorer.listDevice();
    });

    let createDevice = vscode.commands.registerCommand("azure-iot-toolkit.createDevice", async () => {
        await azureIoTExplorer.createDevice();
        setTimeout(() => { deviceTree.refresh(); }, 2000);
    });

    let deleteDevice = vscode.commands.registerCommand("azure-iot-toolkit.deleteDevice", async (DeviceItem) => {
        await azureIoTExplorer.deleteDevice(DeviceItem);
        setTimeout(() => { deviceTree.refresh(); }, 2000);
    });

    let discoverDevice = vscode.commands.registerCommand("azure-iot-toolkit.discoverDevice", () => {
        azureIoTExplorer.discoverDevice();
    });

    let deploy = vscode.commands.registerCommand("azure-iot-toolkit.deploy", () => {
        azureIoTExplorer.deploy();
    });

    let run = vscode.commands.registerCommand("azure-iot-toolkit.run", () => {
        azureIoTExplorer.run();
    });

    let invokeDeviceMethod = vscode.commands.registerCommand("azure-iot-toolkit.invokeDeviceMethod", (DeviceItem) => {
        azureIoTExplorer.invokeDeviceMethod(DeviceItem);
    });

    let getDeviceTwin = vscode.commands.registerCommand("azure-iot-toolkit.getDeviceTwin", (DeviceItem) => {
        azureIoTExplorer.getDeviceTwin(DeviceItem);
    });

    let updateDeviceTwin = vscode.commands.registerCommand("azure-iot-toolkit.updateDeviceTwin", () => {
        azureIoTExplorer.updateDeviceTwin();
    });

    vscode.workspace.onDidChangeTextDocument((event) => azureIoTExplorer.replaceConnectionString(event));

    context.subscriptions.push(sendD2CMessage);
    context.subscriptions.push(startMonitorIoTHubMessage);
    context.subscriptions.push(stopMonitorIoTHubMessage);
    context.subscriptions.push(sendC2DMessage);
    context.subscriptions.push(startMonitorC2DMessage);
    context.subscriptions.push(stopMonitorC2DMessage);
    context.subscriptions.push(sendMessageToEventHub);
    context.subscriptions.push(startMonitorEventHubMessage);
    context.subscriptions.push(stopMonitorEventHubMessage);
    context.subscriptions.push(listDevice);
    context.subscriptions.push(createDevice);
    context.subscriptions.push(deleteDevice);
    context.subscriptions.push(discoverDevice);
    context.subscriptions.push(deploy);
    context.subscriptions.push(run);
    context.subscriptions.push(invokeDeviceMethod);
    context.subscriptions.push(getDeviceTwin);
    context.subscriptions.push(updateDeviceTwin);
}

export function deactivate() {
}
