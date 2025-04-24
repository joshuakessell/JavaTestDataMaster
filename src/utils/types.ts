/**
 * Represents a Java class structure
 */
export interface JavaClass {
    name: string;
    fields: JavaField[];
}

/**
 * Represents a Java field with type and annotation information
 */
export interface JavaField {
    name: string;
    type: string;
    annotations: string[];
}

/**
 * Enum for supported output formats
 */
export enum OutputFormat {
    JSON = 'json',
    JAVA = 'java',
    CSV = 'csv'
}

/**
 * Enum for supported output methods
 */
export enum OutputMethod {
    INLINE = 'inline',
    REPLACE_COMMENT = 'replace_comment',
    EXPORT_FILE = 'export_file',
    CLIPBOARD = 'clipboard'
}
