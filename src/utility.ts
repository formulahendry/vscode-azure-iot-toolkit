"use strict";
import * as vscode from "vscode";
import { AppInsightsClient } from "./appInsightsClient";

export class Utility {
    public static getConfiguration(): vscode.WorkspaceConfiguration {
        return vscode.workspace.getConfiguration("azure-iot-toolkit");
    }

    public static async getConfig(id: string, name: string) {
        let config = Utility.getConfiguration();
        let configValue = config.get<string>(id);
        if (!configValue || configValue.startsWith("<<insert")) {
            AppInsightsClient.sendEvent("SetConfig");
            return await vscode.window.showInputBox({
                prompt: `${name}`,
                placeHolder: `Enter your ${name}`,
            }).then((value: string) => {
                if (value !== undefined) {
                    config.update(id, value, true);
                    return value;
                } else {
                    const GoToAzureRegistrationPage = "Go to Azure registration page";
                    const GoToAzureIoTHubPage = "Go to Azure IoT Hub page";
                    vscode.window.showInformationMessage("Don't have Azure IoT Hub? Register a free Azure account to get a free one.",
                        GoToAzureRegistrationPage, GoToAzureIoTHubPage).then((selection) => {
                            switch (selection) {
                                case GoToAzureRegistrationPage:
                                    vscode.commands.executeCommand("vscode.open",
                                        vscode.Uri.parse("https://azure.microsoft.com/en-us/free/"));
                                    AppInsightsClient.sendEvent("Open.AzureRegistrationPage");
                                    break;
                                case GoToAzureIoTHubPage:
                                    vscode.commands.executeCommand("vscode.open",
                                        vscode.Uri.parse("https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-get-started"));
                                    AppInsightsClient.sendEvent("Open.AzureIoTHubPage");
                                    break;
                                default:
                            }
                        });
                }
                return null;
            });
        }
        return configValue;
    }

    public static getConfigWithId(id: string) {
        let config = Utility.getConfiguration();
        let configValue = config.get<string>(id);
        if (!configValue || configValue.startsWith("<<insert")) {
            return null;
        }
        return configValue;
    }

    public static getConfigFlag(id: string): boolean {
        let config = Utility.getConfiguration();
        return config.get<boolean>(id);
    }

    public static getHostName(iotHubConnectionString: string): string {
        let result = /^HostName=([^=]+);/.exec(iotHubConnectionString);
        return result ? result[1] : "";
    }
}
