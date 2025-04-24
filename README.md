# Java Fake Data Generator

A VSCode extension that analyzes Java classes and generates realistic test data using OpenAI's API.

## Features

- Parse Java classes to identify fields, types, and annotations
- Generate realistic fake test data using OpenAI's intelligent API
- Automatically identify field semantics (emails, names, dates, etc.)
- Customize which fields to include in generated data
- Choose output format (JSON, Java code snippet, CSV)
- Multiple output methods:
  - Insert inline at cursor position
  - Replace comment placeholder
  - Export to file
  - Copy to clipboard
- CodeLens integration for quick access to data generation

## Requirements

- Visual Studio Code 1.50.0 or higher
- OpenAI API key

## Getting Started

1. Install the extension from the VS Code Marketplace
2. Configure your OpenAI API key using the command "Set OpenAI API Key"
3. Open a Java file containing classes
4. Use CodeLens or run the "Generate Fake Data for Java Class" command
5. Follow the prompts to customize your generated data

## Usage

### Setting Your OpenAI API Key

Before using the extension, you need to configure your OpenAI API key:

1. Open the Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Type "Set OpenAI API Key" and select the command
3. Enter your API key when prompted

### Generating Fake Data

There are two ways to generate fake data:

1. **Using CodeLens**:
   - Open a Java file
   - Look for the "Generate Fake Data" CodeLens above class declarations
   - Click the CodeLens to start the generation process

2. **Using Command Palette**:
   - Open a Java file
   - Open the Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
   - Type "Generate Fake Data for Java Class" and select the command

### Using Comment Placeholders

To use the "Replace Comment" output method, add one of these comment placeholders in your code:

```java
// GENERATE_FAKE_DATA
```

or 

```java
/* GENERATE_FAKE_DATA */
```

The generated fake data will replace the placeholder comment.

## Customization Options

When generating fake data, you'll be prompted to make several choices:

1. **Select a Class**: If multiple classes are present in the file, choose which one to generate data for
2. **Select Fields**: Choose which fields to include in the generated data
3. **Output Format**: Select JSON, Java code, or CSV format
4. **Record Count**: Specify how many records to generate (1-100)
5. **Output Method**: Choose how to output the generated data

## How It Works

1. The extension parses your Java class to identify fields, types, and annotations
2. It analyzes field names and types to determine semantic meanings (e.g., email, name, address)
3. The parsed class information is sent to OpenAI's API to generate realistic fake data
4. The generated data is returned and output according to your preferences

## Field Semantic Analysis

The extension can automatically identify the semantic meaning of fields based on their names and types:

- Email addresses
- First/last/full names
- Street addresses, cities, states, zip codes
- Phone numbers
- Dates (birth dates, created/updated timestamps)
- Currency values and prices
- IDs and numeric quantities
- Boolean flags and status indicators

This allows the OpenAI model to generate more appropriate and realistic values for each field.

## Privacy & Security

- Your OpenAI API key is stored securely in VSCode's configuration storage
- Java class metadata is sent to OpenAI's API but no actual data from your codebase is transmitted
- No data is stored or logged by the extension beyond what's needed for the current session

## Feedback & Contributions

If you find a bug or have a feature request, please open an issue on our GitHub repository. Contributions are welcome!

## License

This extension is licensed under the MIT License.
