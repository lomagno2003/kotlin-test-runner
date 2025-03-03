import {
    createConnection,
    InitializeParams,
    InitializeResult,
    TextDocumentSyncKind,
    Connection,
    ServerCapabilities
  } from 'vscode-languageserver/node';
  
  describe('Language Server', () => {
    // Extend the mock connection type to include our handler
    type MockConnection = {
      onInitialize: jest.Mock;
      onInitialized: jest.Mock;
      onCodeLens: jest.Mock;
      onExecuteCommand: jest.Mock;
      listen: jest.Mock;
      onDidOpenTextDocument: jest.Mock;
      onDidChangeTextDocument: jest.Mock;
      onDidCloseTextDocument: jest.Mock;
      onDidSaveTextDocument: jest.Mock;
      onWillSaveTextDocument: jest.Mock;
      onWillSaveTextDocumentWaitUntil: jest.Mock;
      initializeHandler?: (params: InitializeParams) => InitializeResult;
    };
  
    // Create the mock connection with the extended type
    const mockConnection: MockConnection = {
      onInitialize: jest.fn(),
      onInitialized: jest.fn(),
      onCodeLens: jest.fn(),
      onExecuteCommand: jest.fn(),
      listen: jest.fn(),
      onDidOpenTextDocument: jest.fn(),
      onDidChangeTextDocument: jest.fn(),
      onDidCloseTextDocument: jest.fn(),
      onDidSaveTextDocument: jest.fn(),
      onWillSaveTextDocument: jest.fn(),
      onWillSaveTextDocumentWaitUntil: jest.fn()
    };
  
    beforeEach(() => {
      // Clear all mocks
      jest.clearAllMocks();
      jest.resetModules();
  
      // Mock the createConnection function
      jest.mock('vscode-languageserver/node', () => ({
        ...jest.requireActual('vscode-languageserver/node'),
        createConnection: jest.fn().mockReturnValue(mockConnection)
      }));
  
      // Store the initialize handler when it's set
      mockConnection.onInitialize.mockImplementation((handler) => {
        mockConnection.initializeHandler = handler;
      });
    });
  
    test('server initializes with correct capabilities', async () => {
      // Import the server after setting up mocks
      require('./server');
  
      const initParams: InitializeParams = {
        processId: null,
        rootUri: null,
        capabilities: {}
      };
  
      // Ensure handler exists before calling
      expect(mockConnection.initializeHandler).toBeDefined();
      const result = await mockConnection.initializeHandler!(initParams);
  
      expect(result).toEqual({
        capabilities: {
          textDocumentSync: TextDocumentSyncKind.Full,
          executeCommandProvider: {
            commands: ['kotlin.test.run']
          },
          codeLensProvider: {
              resolveProvider: true
          }
        }
      });
    });
  
    test('server starts listening', () => {
      require('./server');
      expect(mockConnection.listen).toHaveBeenCalled();
    });
  
    test('document manager is properly initialized', () => {
      require('./server');
      expect(mockConnection.onDidOpenTextDocument).toHaveBeenCalled();
      expect(mockConnection.onDidChangeTextDocument).toHaveBeenCalled();
      expect(mockConnection.onDidCloseTextDocument).toHaveBeenCalled();
    });
  });
  