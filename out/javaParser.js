"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJavaClass = parseJavaClass;
exports.analyzeFieldSemantics = analyzeFieldSemantics;
/**
 * Parse Java class file to extract class and field information
 * @param javaCode The Java code as string
 * @returns Array of parsed Java classes with fields
 */
function parseJavaClass(javaCode) {
    const classes = [];
    try {
        // Find class declarations
        const classRegex = /class\s+(\w+)(?:\s+extends\s+\w+)?(?:\s+implements\s+(?:\w+,\s*)*\w+)?\s*\{/g;
        let classMatch;
        while ((classMatch = classRegex.exec(javaCode)) !== null) {
            const className = classMatch[1];
            const classStartIndex = classMatch.index;
            // Find class end (this is a simple approach and might not work for nested classes)
            let braceCount = 1;
            let classEndIndex = classStartIndex + classMatch[0].length;
            while (braceCount > 0 && classEndIndex < javaCode.length) {
                if (javaCode[classEndIndex] === '{') {
                    braceCount++;
                }
                else if (javaCode[classEndIndex] === '}') {
                    braceCount--;
                }
                classEndIndex++;
            }
            const classBody = javaCode.substring(classStartIndex, classEndIndex);
            // Extract fields
            const fields = extractFields(classBody);
            classes.push({
                name: className,
                fields: fields
            });
        }
    }
    catch (error) {
        console.error("Error parsing Java class:", error);
    }
    return classes;
}
/**
 * Extract fields from class body
 * @param classBody The body of the Java class
 * @returns Array of parsed Java fields
 */
function extractFields(classBody) {
    const fields = [];
    // Regex to match field declarations in Java
    // This regex handles various field declarations including annotations
    const fieldRegex = /(?:@\w+(?:\([^)]*\))?\s+)*(?:public|private|protected)?\s+(?:static\s+|final\s+)*(\w+(?:<[^>]+>)?)\s+(\w+)(?:\s*=\s*[^;]+)?;/g;
    let fieldMatch;
    while ((fieldMatch = fieldRegex.exec(classBody)) !== null) {
        const type = fieldMatch[1];
        const name = fieldMatch[2];
        // Skip methods, constructors, etc.
        if (classBody.substring(fieldMatch.index - 10, fieldMatch.index).includes("(")) {
            continue;
        }
        // Extract annotations if present
        const annotationRegex = /@(\w+)(?:\(([^)]*)\))?/g;
        const annotationSection = classBody.substring(Math.max(0, fieldMatch.index - 200), fieldMatch.index);
        const annotations = [];
        let annotationMatch;
        while ((annotationMatch = annotationRegex.exec(annotationSection)) !== null) {
            annotations.push(annotationMatch[1]);
        }
        fields.push({
            name,
            type,
            annotations
        });
    }
    return fields;
}
/**
 * Utility function to identify field semantic meaning from name/type
 * This helps the OpenAI generator produce more realistic data
 * @param field The field to analyze
 * @returns Additional semantic hints
 */
function analyzeFieldSemantics(field) {
    const semantics = [];
    const nameLC = field.name.toLowerCase();
    const typeLC = field.type.toLowerCase();
    // Check for common ID fields
    if (nameLC === 'id' || nameLC.endsWith('id')) {
        semantics.push('id');
    }
    // Check for name fields
    if (nameLC === 'firstname' || nameLC === 'fname' || nameLC.includes('first_name')) {
        semantics.push('firstName');
    }
    else if (nameLC === 'lastname' || nameLC === 'lname' || nameLC.includes('last_name')) {
        semantics.push('lastName');
    }
    else if (nameLC === 'fullname' || nameLC.includes('full_name')) {
        semantics.push('fullName');
    }
    else if (nameLC.includes('name') && !semantics.length) {
        semantics.push('name');
    }
    // Check for contact information
    if (nameLC === 'email' || nameLC.includes('email') || nameLC.includes('mail')) {
        semantics.push('email');
    }
    if (nameLC === 'phonenumber' || nameLC.includes('phone') ||
        nameLC.includes('mobile') || nameLC.includes('cell')) {
        semantics.push('phoneNumber');
    }
    // Check for address fields
    if (nameLC === 'address' || nameLC.includes('street')) {
        semantics.push('streetAddress');
    }
    else if (nameLC === 'city') {
        semantics.push('city');
    }
    else if (nameLC === 'state' || nameLC === 'province') {
        semantics.push('state');
    }
    else if (nameLC === 'zipcode' || nameLC === 'postalcode' ||
        nameLC.includes('zip') || nameLC.includes('postal')) {
        semantics.push('postalCode');
    }
    else if (nameLC.includes('address') && !semantics.length) {
        semantics.push('address');
    }
    // Check for date/time fields
    if (nameLC.includes('date') || nameLC.includes('time') ||
        typeLC.includes('date') || typeLC.includes('localdate') ||
        typeLC.includes('timestamp') || typeLC.includes('instant')) {
        if (nameLC.includes('birth') || nameLC === 'dob') {
            semantics.push('birthDate');
        }
        else if (nameLC.includes('created') || nameLC === 'createdat') {
            semantics.push('createdAt');
        }
        else if (nameLC.includes('updated') || nameLC === 'updatedat') {
            semantics.push('updatedAt');
        }
        else {
            semantics.push('date');
        }
    }
    // Check for numeric types
    if (typeLC === 'int' || typeLC === 'integer' || typeLC === 'long' ||
        typeLC === 'double' || typeLC === 'float' || typeLC === 'bigdecimal') {
        if (nameLC.includes('price') || nameLC.includes('cost') ||
            nameLC.includes('amount') || nameLC.includes('balance')) {
            semantics.push('currency');
        }
        else if (nameLC.includes('quantity') || nameLC.includes('count') ||
            nameLC.includes('number') && !semantics.includes('phoneNumber')) {
            semantics.push('quantity');
        }
        else if (nameLC === 'age') {
            semantics.push('age');
        }
        else if (semantics.length === 0) {
            // If no specific semantics found but it's a numeric type
            semantics.push('number');
        }
    }
    // Check for boolean types
    if (typeLC === 'boolean' || typeLC === 'bool') {
        if (nameLC === 'active' || nameLC === 'enabled' || nameLC === 'valid') {
            semantics.push('status');
        }
        else if (nameLC.startsWith('is') || nameLC.startsWith('has') || nameLC.startsWith('can')) {
            semantics.push('flag');
        }
        else {
            semantics.push('boolean');
        }
    }
    // If still no semantics found, use the field name as a last resort
    if (semantics.length === 0) {
        semantics.push(nameLC);
    }
    return semantics;
}
//# sourceMappingURL=javaParser.js.map