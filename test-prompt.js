// Create a test script to show how our OpenAI prompt would be formatted

// Mock module.exports = { buildPrompt }  
const buildPrompt = function(
    className,
    fields,
    count,
    format
) {
    // Format the fields information
    const fieldListStr = fields.map(field => {
        let fieldStr = `- ${field.name} (${field.type})`;
        
        if (field.annotations && field.annotations.length > 0) {
            fieldStr += ` Annotations: ${field.annotations.join(', ')}`;
        }
        
        if (field.semantics && field.semantics.length > 0) {
            fieldStr += ` Semantic Type: ${field.semantics.join(', ')}`;
        }
        
        return fieldStr;
    }).join('\n');

    return `Generate ${count} realistic fake data objects for the Java class '${className}' with the following fields:

${fieldListStr}

Please generate the data in ${format}.

The generated data should be realistic, following conventions for field types. For example:
- Email fields should have valid email formats
- Date fields should have realistic dates
- Name fields should have realistic names
- Phone numbers should have realistic formats
- ID fields should follow appropriate patterns
- Price fields should have appropriate currency values

Please output ONLY the generated data, without any additional explanation or commentary.`;
}

// Sample user class with fields and semantic hints
const userClass = {
  name: 'User',
  fields: [
    { name: 'id', type: 'Long', annotations: [], semantics: ['id'] },
    { name: 'firstName', type: 'String', annotations: [], semantics: ['firstName'] },
    { name: 'lastName', type: 'String', annotations: [], semantics: ['lastName'] },
    { name: 'email', type: 'String', annotations: [], semantics: ['email'] },
    { name: 'phoneNumber', type: 'String', annotations: [], semantics: ['phoneNumber'] },
    { name: 'age', type: 'int', annotations: [], semantics: ['age'] },
    { name: 'active', type: 'boolean', annotations: [], semantics: ['status'] },
    { name: 'address', type: 'String', annotations: [], semantics: ['streetAddress'] },
    { name: 'city', type: 'String', annotations: [], semantics: ['city'] },
    { name: 'state', type: 'String', annotations: [], semantics: ['state'] },
    { name: 'zipCode', type: 'String', annotations: [], semantics: ['postalCode'] },
    { name: 'accountBalance', type: 'double', annotations: [], semantics: ['currency'] }
  ]
};

// Generate and show the prompt for 3 records in JSON format
console.log('Java Fake Data Generator extension is now active.');
console.log('\nSample prompt for generating fake data:');
console.log('-----------------------------------------');
console.log(buildPrompt(userClass.name, userClass.fields, 3, 'JSON format'));
