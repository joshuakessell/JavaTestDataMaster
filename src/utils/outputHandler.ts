import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { OutputFormat } from './types';

/**
 * Insert the generated data at the current cursor position
 * @param editor Active text editor
 * @param data Generated data string
 */
export async function insertInline(editor: vscode.TextEditor, data: string): Promise<void> {
    await editor.edit(editBuilder => {
        editBuilder.insert(editor.selection.active, data);
    });
}

/**
 * Replace a comment placeholder with the generated data
 * @param editor Active text editor
 * @param data Generated data string
 */
export async function replaceComment(editor: vscode.TextEditor, data: string): Promise<void> {
    const text = editor.document.getText();
    
    // Look for comment placeholders like: // GENERATE_FAKE_DATA or /* GENERATE_FAKE_DATA */
    const singleLineCommentRegex = /\/\/\s*GENERATE_FAKE_DATA\s*$/gm;
    const multiLineCommentRegex = /\/\*\s*GENERATE_FAKE_DATA\s*\*\//g;
    
    let match: RegExpExecArray | null = null;
    let found = false;
    
    // Check for single line comment placeholder
    match = singleLineCommentRegex.exec(text);
    if (match) {
        const startPos = editor.document.positionAt(match.index);
        const endPos = editor.document.positionAt(match.index + match[0].length);
        const range = new vscode.Range(startPos, endPos);
        
        await editor.edit(editBuilder => {
            editBuilder.replace(range, data);
        });
        found = true;
    }
    
    // If no single line comment, check for multi-line comment
    if (!found) {
        match = multiLineCommentRegex.exec(text);
        if (match) {
            const startPos = editor.document.positionAt(match.index);
            const endPos = editor.document.positionAt(match.index + match[0].length);
            const range = new vscode.Range(startPos, endPos);
            
            await editor.edit(editBuilder => {
                editBuilder.replace(range, data);
            });
            found = true;
        }
    }
    
    if (!found) {
        throw new Error("No comment placeholder found. Add a comment like // GENERATE_FAKE_DATA or /* GENERATE_FAKE_DATA */");
    }
}

/**
 * Export generated data to a file
 * @param data Generated data string
 * @param className Name of the class (used for filename)
 * @param format Output format
 */
export async function exportToFile(data: string, className: string, format: OutputFormat): Promise<void> {
    // Get file extension based on format
    let extension: string;
    switch (format) {
        case OutputFormat.JSON:
            extension = 'json';
            break;
        case OutputFormat.JAVA:
            extension = 'java';
            break;
        case OutputFormat.CSV:
            extension = 'csv';
            break;
        default:
            extension = 'txt';
    }
    
    // Create filename
    const fileName = `${className}_fake_data.${extension}`;
    
    // Get workspace folder
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        throw new Error("No workspace folder found");
    }
    
    const workspacePath = workspaceFolders[0].uri.fsPath;
    const filePath = path.join(workspacePath, fileName);
    
    // Let the user choose where to save the file
    const uri = await vscode.window.showSaveDialog({
        defaultUri: vscode.Uri.file(filePath),
        filters: {
            'All Files': ['*']
        }
    });
    
    if (uri) {
        fs.writeFileSync(uri.fsPath, data);
        vscode.window.showInformationMessage(`Fake data exported to ${uri.fsPath}`);
    }
}

/**
 * Copy generated data to clipboard
 * @param data Generated data string
 */
export async function copyToClipboard(data: string): Promise<void> {
    await vscode.env.clipboard.writeText(data);
    vscode.window.showInformationMessage('Fake data copied to clipboard');
}
