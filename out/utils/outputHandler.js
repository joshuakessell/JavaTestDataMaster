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
exports.insertInline = insertInline;
exports.replaceComment = replaceComment;
exports.exportToFile = exportToFile;
exports.copyToClipboard = copyToClipboard;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const types_1 = require("./types");
/**
 * Insert the generated data at the current cursor position
 * @param editor Active text editor
 * @param data Generated data string
 */
async function insertInline(editor, data) {
    await editor.edit(editBuilder => {
        editBuilder.insert(editor.selection.active, data);
    });
}
/**
 * Replace a comment placeholder with the generated data
 * @param editor Active text editor
 * @param data Generated data string
 */
async function replaceComment(editor, data) {
    const text = editor.document.getText();
    // Look for comment placeholders like: // GENERATE_FAKE_DATA or /* GENERATE_FAKE_DATA */
    const singleLineCommentRegex = /\/\/\s*GENERATE_FAKE_DATA\s*$/gm;
    const multiLineCommentRegex = /\/\*\s*GENERATE_FAKE_DATA\s*\*\//g;
    let match = null;
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
async function exportToFile(data, className, format) {
    // Get file extension based on format
    let extension;
    switch (format) {
        case types_1.OutputFormat.JSON:
            extension = 'json';
            break;
        case types_1.OutputFormat.JAVA:
            extension = 'java';
            break;
        case types_1.OutputFormat.CSV:
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
async function copyToClipboard(data) {
    await vscode.env.clipboard.writeText(data);
    vscode.window.showInformationMessage('Fake data copied to clipboard');
}
//# sourceMappingURL=outputHandler.js.map