import fs from 'fs';
import path from 'path';
import vsctm from 'vscode-textmate';
import oniguruma from 'vscode-oniguruma';

export default async function parse() {
  function readFile(path: string) {
    return new Promise((resolve, reject) => {
      fs.readFile(path, (error, data) => error ? reject(error) : resolve(data));
    })
  }
  
  const cwd = process.cwd();
  const wasmBin = fs.readFileSync(path.join(cwd, './node_modules/vscode-oniguruma/release/onig.wasm')).buffer;
  const vscodeOnigurumaLib = oniguruma.loadWASM(wasmBin).then(() => {
    return {
      createOnigScanner(patterns) { return new oniguruma.OnigScanner(patterns); },
      createOnigString(s) { return new oniguruma.OnigString(s); }
    };
  });
  
  // Create a registry that can create a grammar from a scope name.
  const registry = new vsctm.Registry({
    onigLib: vscodeOnigurumaLib,
    loadGrammar: async (scopeName: string) => {
      if (scopeName !== 'source.circom') {
        console.log(`Unknown scope name: ${scopeName}`);
        throw new Error(`Unknown scope name: ${scopeName}`);
      }
      const data = await readFile('./circom.tmLanguage')
      return vsctm.parseRawGrammar((data as any).toString());
    }
  });
  
  // Load the Circom grammar and any other grammars included by it async.
  const grammar = await registry.loadGrammar('source.circom');
  
  if (!grammar) throw new Error('Could not load Circom grammar');
  const text = (await readFile('./circuits/example.circom') as any).toString().split('\n');
  
  type Signal = {
    isPublic: boolean,
    name: string,
    type: 'input' | 'output',
    width: number,
  }
  
  const signals: Partial<Signal>[] = [];
  let parsingMain = false;
  let currSignal: Partial<Signal> | null = null;
  
  text.reduce((currStack, line) => {
    const lineTokens = grammar.tokenizeLine(line, currStack);
  
    for (const token of lineTokens.tokens) {
      const tokenText = line.substring(token.startIndex, token.endIndex).trim();
  
      if (tokenText.startsWith('main')) {
        parsingMain = true;
        continue;
      }
  
      if (parsingMain) {
        const reservedKeywords = ['public', '{', '}', '[', ']'];
        if (!reservedKeywords.includes(tokenText)) {
          const currSignal = signals.find(s => s.name === tokenText);
          if (currSignal) currSignal.isPublic = true;
        }
      }
  
      if (tokenText.startsWith('signal')) {
        currSignal = { isPublic: false, width: 1 };
      } else if (token.scopes.includes('punctuation.terminator.statement.js') && currSignal) {
        signals.push(currSignal);
        currSignal = null;
      } else if (currSignal !== null && tokenText) {
        if (tokenText === 'output') {
          currSignal.isPublic = true;
          currSignal.type = 'output';
        } else if (tokenText === 'input') {
          currSignal.isPublic = false;
          currSignal.type = 'input';
        } else {
          if (currSignal.type) {
            currSignal.name ||= tokenText;
            if (/^\d+$/.test(tokenText)) {
              currSignal.width = parseInt(tokenText);
            }
          } else {
            currSignal = null;
          }
        }
      }
    }
    return lineTokens.ruleStack;
  }, vsctm.INITIAL);
  
  return signals;  
}
