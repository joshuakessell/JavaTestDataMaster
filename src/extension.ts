import * as vscode from 'vscode';
import { parseJavaClass } from './javaParser';
import { generateFakeData } from './openaiService';
import { showClassSelectionDialog, showFieldSelectionDialog, showOutputFormatDialog, showRecordCountDialog, showOutputMethodDialog } from './ui/userInterface';
import { insertInline, replaceComment, exportToFile, copyToClipboard } from './utils/outputHandler';
import { JavaClass, OutputMethod, OutputFormat } from './utils/types'; // OutputFormat is used in the code

export function activate(context: vscode.ExtensionContext) {
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

        const apiKey = vscode.workspace.getConfiguration().get<string>('openai.apiKey');
        if (!apiKey) {
            const setKey = 'Set API Key';
            const response = await vscode.window.showErrorMessage(
                'OpenAI API Key not configured. Would you like to set it now?',
                setKey
            );
            
            if (response === setKey) {
                vscode.commands.executeCommand('extension.configureApiKey');
            }
            return;
        }

        try {
            // Parse Java classes in the current file
            const javaClasses = parseJavaClass(editor.document.getText());
            
            if (javaClasses.length === 0) {
                vscode.window.showErrorMessage('No Java classes found in the current file');
                return;
            }

            // Show UI to select class, fields, etc.
            const selectedClass = await showClassSelectionDialog(javaClasses);
            if (!selectedClass) return;

            const selectedFields = await showFieldSelectionDialog(selectedClass);
            if (!selectedFields || selectedFields.length === 0) return;

            const selectedOutputFormat = await showOutputFormatDialog();
            if (!selectedOutputFormat) return;

            const recordCount = await showRecordCountDialog();
            if (!recordCount) return;

            const outputMethod = await showOutputMethodDialog();
            if (!outputMethod) return;

            // Show status bar message
            const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
            statusBarItem.text = "$(sync~spin) Generating fake data...";
            statusBarItem.show();

            try {
                // Filter selected class to only include selected fields
                const classWithSelectedFields: JavaClass = {
                    name: selectedClass.name,
                    fields: selectedClass.fields.filter(field => 
                        selectedFields.includes(field.name))
                };

                // Generate fake data using OpenAI
                const fakeData = await generateFakeData(classWithSelectedFields, recordCount, selectedOutputFormat, apiKey);
                
                // Handle the output based on selected method
                switch (outputMethod) {
                    case OutputMethod.INLINE:
                        await insertInline(editor, fakeData);
                        break;
                    case OutputMethod.REPLACE_COMMENT:
                        await replaceComment(editor, fakeData);
                        break;
                    case OutputMethod.EXPORT_FILE:
                        await exportToFile(fakeData, selectedClass.name, selectedOutputFormat);
                        break;
                    case OutputMethod.CLIPBOARD:
                        await copyToClipboard(fakeData);
                        break;
                }

                vscode.window.showInformationMessage(`Generated ${recordCount} fake data records successfully!`);
            } catch (error: any) {
                vscode.window.showErrorMessage(`Error generating fake data: ${error.message || 'Unknown error'}`);
            } finally {
                statusBarItem.dispose();
            }
        } catch (error: any) {
            vscode.window.showErrorMessage(`Error parsing Java class: ${error.message || 'Unknown error'}`);
        }
    });

    // Use the object literal syntax for the CodeLensProvider
    const codeLensProvider = {
        provideCodeLenses(
            document: vscode.TextDocument,
            token: vscode.CancellationToken
        ): vscode.ProviderResult<vscode.CodeLens[]> {
            const codeLenses: vscode.CodeLens[] = [];
            
            try {
                // Only provide CodeLens for Java files
                if (document.languageId !== 'java') {
                    return codeLenses;
                }
                
                const javaClasses = parseJavaClass(document.getText());
                
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
            } catch (error: any) {
                console.error("Error providing CodeLens:", error);
            }
            
            return codeLenses;
        }
    };

    // Register CodeLens provider for Java
    const codeLensRegistration = vscode.languages.registerCodeLensProvider(
        { language: 'java' },
        codeLensProvider
    );

    // Add commands to context
    context.subscriptions.push(
        configureApiKeyCommand,
        generateFakeDataCommand,
        codeLensRegistration
    );
}

export function deactivate() {}
