import * as path from 'path';
import { workspace, ExtensionContext, commands, window } from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  // Path to server module
  const serverModule = context.asAbsolutePath(
    path.join('out', 'server', 'server.js')
  );

  // Server options - running the server as a Node process
  const serverOptions: ServerOptions = {
    run: {
      module: serverModule,
      transport: TransportKind.ipc
    },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: { execArgv: ['--nolazy', '--inspect=6009'] }
    }
  };

  // Client options - define the languages your LSP works with
  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: 'file', language: 'kotlin' }],
    synchronize: {
      fileEvents: workspace.createFileSystemWatcher('**/*.kt')
    },
    middleware: {
        provideCodeLenses: async (document, token, next) => {
            const result = await next(document, token);
            return result;
        }
    }
  };

  // Create and start the client
  client = new LanguageClient(
    'kotlinTestRunnerLSP',
    'Kotlin Test Runner LSP',
    serverOptions,
    clientOptions
  );

  // Start the client
  console.log('Starting language client...');
  client.start().then(() => {
      console.log('Language client started successfully');
  }).catch((error) => {
      console.error('Failed to start language client:', error);
  });
}

export function deactivate(): Thenable<void> | undefined {
  console.log("Client deactivated");
  if (!client) {
    return undefined;
  }
  return client.stop();
}
