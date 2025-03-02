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

// Create a connection for the server
const connection = createConnection(ProposedFeatures.all);

// Create a text document manager
const documents = new TextDocuments(TextDocument);

connection.onInitialize((params: InitializeParams): InitializeResult => {
    console.log('Kotlin TR LSP Server initializing...');
    
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

// Make the text document manager listen on the connection
documents.listen(connection);

// Listen on the connection
connection.listen();
console.log('Language Server is now listening...');

// Export for testing
export { connection, documents };
