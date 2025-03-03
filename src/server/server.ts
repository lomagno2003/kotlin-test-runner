import {
    createConnection,
    TextDocuments,
    ProposedFeatures,
    InitializeParams,
    InitializeResult,
    TextDocumentSyncKind,
    CodeLens,
    CodeLensParams
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';
import { detectKotlinTests } from './testDetector';
import { executeKotlinTest } from './testExecutor';

// Create a connection for the server
const connection = createConnection(ProposedFeatures.all);

// Create a text document manager
const documents = new TextDocuments(TextDocument);

let workspaceRoot: string | undefined = undefined;

connection.onInitialize((params: InitializeParams): InitializeResult => {
    console.log('Kotlin TR LSP Server initializing...');
    
    workspaceRoot = params.workspaceFolders?.[0]?.uri;

    return {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Full,
            codeLensProvider: {
                resolveProvider: true
            },
            executeCommandProvider: {
                commands: ['kotlin.test.run']
            }
        }
    };
});

// Register initialized handler
connection.onInitialized(() => {
    connection.window.showInformationMessage('Server initialized successfully');
    console.log('Server initialized');
});

// Add CodeLens support to show "Run Test" above each test
connection.onCodeLens((params: CodeLensParams): CodeLens[] => {
    console.log('Kotlin TR LSP CodeLens called...');

    const document = documents.get(params.textDocument.uri);
    if (!document) return [];

    const tests = detectKotlinTests(document.getText());
    
    return tests.map(test => ({
        range: test.range,
        command: {
            title: '▶ Run Test',
            command: 'kotlin.test.run',
            arguments: [test.className, test.name]
        }
    }));
});

// Add this after your other connection handlers
connection.onExecuteCommand(async (params) => {
    if (params.command === 'kotlin.test.run') {
        const [className, testName] = params.arguments || [];
        console.log(`Running test: ${className}.${testName}`);
        
        try {
            // Execute the test
            const result = await executeKotlinTest(className, testName);
            
            // Show the test results
            if (result.success) {
                connection.window.showInformationMessage(
                    `✅ Test passed: ${className}#${testName}`
                );
            } else {
                connection.window.showErrorMessage(
                    `❌ Test failed: ${className}#${testName}\n${result.errorMessage}`
                );
            }
        } catch (e) {
            connection.window.showErrorMessage(
                `Error running test: ${(e as Error).message}`
            );
        }
    }
});

// Make the text document manager listen on the connection
documents.listen(connection);

// Listen on the connection
connection.listen();
console.log('Language Server is now listening...');

// Export for testing
export { connection, documents };
