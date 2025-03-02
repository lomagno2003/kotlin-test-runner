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
const connection = createConnection(process.stdin, process.stdout);

// Create a text document manager
const documents = new TextDocuments(TextDocument);

connection.onInitialize((params: InitializeParams): InitializeResult => {
    return {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Full,
            executeCommandProvider: {
                commands: ['kotlin.test.run']
            }
        }
    };
});

// Add CodeLens support to show "Run Test" above each test
connection.onCodeLens((params: CodeLensParams): CodeLens[] => {
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

// Export for testing
export { connection, documents };
