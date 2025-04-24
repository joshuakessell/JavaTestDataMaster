import * as vscode from 'vscode';
import { JavaClass, OutputFormat, OutputMethod } from '../utils/types';

/**
 * Show dialog to select a class when multiple classes are present in a file
 * @param classes Array of Java classes found in the file
 * @returns Selected JavaClass or undefined if canceled
 */
export async function showClassSelectionDialog(classes: JavaClass[]): Promise<JavaClass | undefined> {
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
export async function showFieldSelectionDialog(javaClass: JavaClass): Promise<string[] | undefined> {
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
export async function showOutputFormatDialog(): Promise<OutputFormat | undefined> {
    const formatItems = [
        { label: 'JSON', format: OutputFormat.JSON, description: 'Generate data as JSON array' },
        { label: 'Java Code', format: OutputFormat.JAVA, description: 'Generate Java code to create objects' },
        { label: 'CSV', format: OutputFormat.CSV, description: 'Generate data as CSV with header' }
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
export async function showRecordCountDialog(): Promise<number | undefined> {
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
export async function showOutputMethodDialog(): Promise<OutputMethod | undefined> {
    const methodItems = [
        { label: 'Insert at Cursor', method: OutputMethod.INLINE, description: 'Insert data at current cursor position' },
        { label: 'Replace Comment', method: OutputMethod.REPLACE_COMMENT, description: 'Replace comment placeholder with data' },
        { label: 'Export to File', method: OutputMethod.EXPORT_FILE, description: 'Export data to a new file' },
        { label: 'Copy to Clipboard', method: OutputMethod.CLIPBOARD, description: 'Copy data to clipboard' }
    ];
    
    const selectedMethod = await vscode.window.showQuickPick(methodItems, {
        placeHolder: 'How do you want to output the generated data?',
    });
    
    return selectedMethod?.method;
}
