import { Range } from 'vscode-languageserver';

export interface KotlinTest {
    name: string;
    range: Range;
    className: string;
}

export function detectKotlinTests(content: string): KotlinTest[] {
    const tests: KotlinTest[] = [];
    
    // Simple regex to find test methods
    // Note: This is a basic implementation. For production, you might want to use a proper Kotlin parser
    const classMatch = content.match(/class\s+(\w+)/);
    const className = classMatch ? classMatch[1] : '';

    const testRegex = /@(?:Test|org\.junit\.jupiter\.api\.Test|kotlin\.test\.Test)\s+fun\s+(\w+)/g;
    let match;

    while ((match = testRegex.exec(content)) !== null) {
        const testName = match[1];
        const position = match.index;
        
        // Calculate the range (this is approximate)
        const linesBefore = content.slice(0, position).split('\n');
        const startLine = linesBefore.length - 1;
        const startChar = linesBefore[linesBefore.length - 1].length;
        
        tests.push({
            name: testName,
            range: {
                start: { line: startLine, character: startChar },
                end: { line: startLine, character: startChar + testName.length }
            },
            className
        });
    }

    return tests;
}
