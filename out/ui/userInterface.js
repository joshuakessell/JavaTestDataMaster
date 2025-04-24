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
exports.showClassSelectionDialog = showClassSelectionDialog;
exports.showFieldSelectionDialog = showFieldSelectionDialog;
exports.showOutputFormatDialog = showOutputFormatDialog;
exports.showRecordCountDialog = showRecordCountDialog;
exports.showOutputMethodDialog = showOutputMethodDialog;
const vscode = __importStar(require("vscode"));
const types_1 = require("../utils/types");
/**
 * Show dialog to select a class when multiple classes are present in a file
 * @param classes Array of Java classes found in the file
 * @returns Selected JavaClass or undefined if canceled
 */
async function showClassSelectionDialog(classes) {
    if (classes.length === 1) {
        return classes[0]; // If only one class, return it directly
    }
    const classItems = classes.map(cls => ({
        label: cls.name,
        description: `${cls.fields.length} fields`,
        class: cls
    }));
    const selectedClass = await vscode.window.showQuickPick(classItems, {
        placeHolder: 'Select a class to generate fake data for',
    });
    return selectedClass?.class;
}
/**
 * Show dialog to select fields to include in the fake data generation
 * @param javaClass The Java class containing fields
 * @returns Array of selected field names or undefined if canceled
 */
async function showFieldSelectionDialog(javaClass) {
    const fieldItems = javaClass.fields.map(field => ({
        label: field.name,
        description: field.type,
        detail: field.annotations.length > 0 ? `Annotations: ${field.annotations.join(', ')}` : undefined,
        picked: true // All fields are selected by default
    }));
    const selectedFields = await vscode.window.showQuickPick(fieldItems, {
        placeHolder: 'Select fields to include (all selected by default)',
        canPickMany: true
    });
    if (!selectedFields) {
        return undefined;
    }
    return selectedFields.map(item => item.label);
}
/**
 * Show dialog to select output format
 * @returns Selected OutputFormat or undefined if canceled
 */
async function showOutputFormatDialog() {
    const formatItems = [
        { label: 'JSON', format: types_1.OutputFormat.JSON, description: 'Generate data as JSON array' },
        { label: 'Java Code', format: types_1.OutputFormat.JAVA, description: 'Generate Java code to create objects' },
        { label: 'CSV', format: types_1.OutputFormat.CSV, description: 'Generate data as CSV with header' }
    ];
    const selectedFormat = await vscode.window.showQuickPick(formatItems, {
        placeHolder: 'Select output format',
    });
    return selectedFormat?.format;
}
/**
 * Show dialog to enter number of records to generate
 * @returns Number of records or undefined if canceled
 */
async function showRecordCountDialog() {
    const countInput = await vscode.window.showInputBox({
        prompt: 'How many fake data records do you want to generate?',
        placeHolder: 'Enter a number (1-100)',
        validateInput: value => {
            const num = parseInt(value);
            if (isNaN(num) || num < 1) {
                return 'Please enter a valid number greater than 0';
            }
            if (num > 100) {
                return 'Please enter a number less than or equal to 100';
            }
            return null;
        }
    });
    return countInput ? parseInt(countInput) : undefined;
}
/**
 * Show dialog to select output method
 * @returns Selected OutputMethod or undefined if canceled
 */
async function showOutputMethodDialog() {
    const methodItems = [
        { label: 'Insert at Cursor', method: types_1.OutputMethod.INLINE, description: 'Insert data at current cursor position' },
        { label: 'Replace Comment', method: types_1.OutputMethod.REPLACE_COMMENT, description: 'Replace comment placeholder with data' },
        { label: 'Export to File', method: types_1.OutputMethod.EXPORT_FILE, description: 'Export data to a new file' },
        { label: 'Copy to Clipboard', method: types_1.OutputMethod.CLIPBOARD, description: 'Copy data to clipboard' }
    ];
    const selectedMethod = await vscode.window.showQuickPick(methodItems, {
        placeHolder: 'How do you want to output the generated data?',
    });
    return selectedMethod?.method;
}
//# sourceMappingURL=userInterface.js.map