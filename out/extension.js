"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const javaParser_1 = require("./javaParser");
const openaiService_1 = require("./openaiService");
const userInterface_1 = require("./ui/userInterface");
const outputHandler_1 = require("./utils/outputHandler");
const types_1 = require("./utils/types"); // OutputFormat is used in the code
function activate(context) {
    console.log('Java Fake Data Generator extension is now active');
    // Register command to configure OpenAI API Key
    const configureApiKeyCommand = vscode.commands.registerCommand('extension.configureApiKey', async () => {
        const apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your OpenAI API Key',
            password: true,
            ignoreFocusOut: true,
            placeHolder: 'sk-...',
        });
        if (apiKey) {
            await vscode.workspace.getConfiguration().update('openai.apiKey', apiKey, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage('OpenAI API Key configured successfully');
        }
    });
    // Register command to generate fake data
    const generateFakeDataCommand = vscode.commands.registerCommand('extension.generateFakeData', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active Java editor found');
            return;
        }
        if (editor.document.languageId !== 'java') {
            vscode.window.showErrorMessage('This command only works with Java files');
            return;
        }
        const apiKey = vscode.workspace.getConfiguration().get('openai.apiKey');
        if (!apiKey) {
            const setKey = 'Set API Key';
            const response = await vscode.window.showErrorMessage('OpenAI API Key not configured. Would you like to set it now?', setKey);
            if (response === setKey) {
                vscode.commands.executeCommand('extension.configureApiKey');
            }
            return;
        }
        try {
            // Parse Java classes in the current file
            const javaClasses = (0, javaParser_1.parseJavaClass)(editor.document.getText());
            if (javaClasses.length === 0) {
                vscode.window.showErrorMessage('No Java classes found in the current file');
                return;
            }
            // Show UI to select class, fields, etc.
            const selectedClass = await (0, userInterface_1.showClassSelectionDialog)(javaClasses);
            if (!selectedClass)
                return;
            const selectedFields = await (0, userInterface_1.showFieldSelectionDialog)(selectedClass);
            if (!selectedFields || selectedFields.length === 0)
                return;
            const selectedOutputFormat = await (0, userInterface_1.showOutputFormatDialog)();
            if (!selectedOutputFormat)
                return;
            const recordCount = await (0, userInterface_1.showRecordCountDialog)();
            if (!recordCount)
                return;
            const outputMethod = await (0, userInterface_1.showOutputMethodDialog)();
            if (!outputMethod)
                return;
            // Show status bar message
            const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
            statusBarItem.text = "$(sync~spin) Generating fake data...";
            statusBarItem.show();
            try {
                // Filter selected class to only include selected fields
                const classWithSelectedFields = {
                    name: selectedClass.name,
                    fields: selectedClass.fields.filter(field => selectedFields.includes(field.name))
                };
                // Generate fake data using OpenAI
                const fakeData = await (0, openaiService_1.generateFakeData)(classWithSelectedFields, recordCount, selectedOutputFormat, apiKey);
                // Handle the output based on selected method
                switch (outputMethod) {
                    case types_1.OutputMethod.INLINE:
                        await (0, outputHandler_1.insertInline)(editor, fakeData);
                        break;
                    case types_1.OutputMethod.REPLACE_COMMENT:
                        await (0, outputHandler_1.replaceComment)(editor, fakeData);
                        break;
                    case types_1.OutputMethod.EXPORT_FILE:
                        await (0, outputHandler_1.exportToFile)(fakeData, selectedClass.name, selectedOutputFormat);
                        break;
                    case types_1.OutputMethod.CLIPBOARD:
                        await (0, outputHandler_1.copyToClipboard)(fakeData);
                        break;
                }
                vscode.window.showInformationMessage(`Generated ${recordCount} fake data records successfully!`);
            }
            catch (error) {
                vscode.window.showErrorMessage(`Error generating fake data: ${error.message || 'Unknown error'}`);
            }
            finally {
                statusBarItem.dispose();
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error parsing Java class: ${error.message || 'Unknown error'}`);
        }
    });
    // Use the object literal syntax for the CodeLensProvider
    const codeLensProvider = {
        provideCodeLenses(document, token) {
            const codeLenses = [];
            try {
                // Only provide CodeLens for Java files
                if (document.languageId !== 'java') {
                    return codeLenses;
                }
                const javaClasses = (0, javaParser_1.parseJavaClass)(document.getText());
                // Add a CodeLens for each class declaration
                for (const javaClass of javaClasses) {
                    // Find the class declaration position
                    const text = document.getText();
                    const classRegex = new RegExp(`(public|private|protected)?\\s+class\\s+${javaClass.name}\\s*`, 'g');
                    const match = classRegex.exec(text);
                    if (match) {
                        const startPos = document.positionAt(match.index);
                        const range = new vscode.Range(startPos, startPos);
                        // Add CodeLens for generating data
                        codeLenses.push(new vscode.CodeLens(range, {
                            title: "Generate Fake Data",
                            command: "extension.generateFakeData",
                            tooltip: "Generate fake data for this class"
                        }));
                    }
                }
            }
            catch (error) {
                console.error("Error providing CodeLens:", error);
            }
            return codeLenses;
        }
    };
    // Register CodeLens provider for Java
    const codeLensRegistration = vscode.languages.registerCodeLensProvider({ language: 'java' }, codeLensProvider);
    // Add commands to context
    context.subscriptions.push(configureApiKeyCommand, generateFakeDataCommand, codeLensRegistration);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map