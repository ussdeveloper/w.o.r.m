/**
 * Go Adapter - Bridge do programów Go
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

class GoAdapter {
    constructor() {
        this.modules = new Map();
        this.tempDir = path.join(__dirname, '..', 'temp', 'go');
    }

    createContext(session) {
        return new GoContext(session, this);
    }

    /**
     * Sprawdza czy Go jest zainstalowane
     * @returns {Promise<boolean>}
     */
    async checkGoInstallation() {
        return new Promise((resolve) => {
            exec('go version', (error) => {
                resolve(!error);
            });
        });
    }
}

class GoContext {
    constructor(session, adapter) {
        this.session = session;
        this.adapter = adapter;
        this.loadedModules = new Map();
    }

    /**
     * Ładuje moduł Go
     * @param {string} moduleName - nazwa modułu
     * @returns {GoModule}
     */
    module(moduleName) {
        if (!this.loadedModules.has(moduleName)) {
            const module = new GoModule(moduleName, this);
            this.loadedModules.set(moduleName, module);
        }
        return this.loadedModules.get(moduleName);
    }

    /**
     * Kompiluje i uruchamia kod Go
     * @param {string} code - kod Go
     * @param {Array} args - argumenty
     * @returns {Promise}
     */
    async run(code, args = []) {
        return new Promise((resolve, reject) => {
            // Utwórz tymczasowy katalog jeśli nie istnieje
            if (!fs.existsSync(this.adapter.tempDir)) {
                fs.mkdirSync(this.adapter.tempDir, { recursive: true });
            }

            const fileName = `temp_${Date.now()}.go`;
            const filePath = path.join(this.adapter.tempDir, fileName);
            
            // Zapisz kod do pliku
            fs.writeFileSync(filePath, code);
            
            // Uruchom go run
            const goProcess = spawn('go', ['run', filePath, ...args], {
                cwd: this.adapter.tempDir
            });
            
            let output = '';
            let errorOutput = '';
            
            goProcess.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            goProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });
            
            goProcess.on('close', (code) => {
                // Usuń tymczasowy plik
                try {
                    fs.unlinkSync(filePath);
                } catch (e) {
                    // Ignoruj błąd usuwania
                }
                
                if (code === 0) {
                    resolve(output.trim());
                } else {
                    reject(new Error(`Go execution failed: ${errorOutput}`));
                }
            });
        });
    }

    /**
     * Dostęp do standardowych modułów
     */
    get strings() {
        return this.module('strings');
    }

    get fmt() {
        return this.module('fmt');
    }

    get math() {
        return this.module('math');
    }

    get time() {
        return this.module('time');
    }
}

class GoModule {
    constructor(name, context) {
        this.name = name;
        this.context = context;
        this.functions = new Map();
    }

    /**
     * Wywołuje funkcję z modułu
     * @param {string} functionName - nazwa funkcji
     * @returns {GoFunction}
     */
    function(functionName) {
        const key = `${this.name}.${functionName}`;
        if (!this.functions.has(key)) {
            const func = new GoFunction(this.name, functionName, this.context);
            this.functions.set(key, func);
        }
        return this.functions.get(key);
    }
}

class GoFunction {
    constructor(moduleName, functionName, context) {
        this.moduleName = moduleName;
        this.functionName = functionName;
        this.context = context;
    }

    /**
     * Wywołuje funkcję Go
     * @param {...any} args - argumenty
     * @returns {Promise}
     */
    async call(...args) {
        // Generuj kod Go dla wywołania funkcji
        const code = this.generateGoCode(args);
        
        try {
            const result = await this.context.run(code);
            this.context.session.addToHistory(
                `go.${this.moduleName}.${this.functionName}(${args.join(', ')})`, 
                result
            );
            return result;
        } catch (error) {
            throw new Error(`Go function ${this.moduleName}.${this.functionName} failed: ${error.message}`);
        }
    }

    /**
     * Generuje kod Go dla wywołania funkcji
     * @param {Array} args - argumenty
     * @returns {string}
     */
    generateGoCode(args) {
        const imports = this.getImports();
        const argsCode = this.formatArgs(args);
        const functionCall = `${this.moduleName}.${this.functionName}(${argsCode})`;
        
        return `
package main

${imports}

func main() {
    result := ${functionCall}
    fmt.Print(result)
}
        `;
    }

    /**
     * Zwraca importy dla modułu
     * @returns {string}
     */
    getImports() {
        const standardModules = ['fmt', 'strings', 'math', 'time', 'strconv'];
        const imports = ['import (', '    "fmt"'];
        
        if (standardModules.includes(this.moduleName) && this.moduleName !== 'fmt') {
            imports.push(`    "${this.moduleName}"`);
        }
        
        imports.push(')');
        return imports.join('\n');
    }

    /**
     * Formatuje argumenty dla kodu Go
     * @param {Array} args - argumenty
     * @returns {string}
     */
    formatArgs(args) {
        return args.map(arg => {
            if (typeof arg === 'string') {
                return `"${arg.replace(/"/g, '\\"')}"`;
            } else if (typeof arg === 'number') {
                return arg.toString();
            } else if (typeof arg === 'boolean') {
                return arg.toString();
            } else {
                return `"${JSON.stringify(arg)}"`;
            }
        }).join(', ');
    }
}

// Predefiniowane funkcje dla popularnych modułów
class GoStrings extends GoModule {
    constructor(context) {
        super('strings', context);
    }

    /**
     * Zamienia na wielkie litery
     * @param {string} str
     * @returns {Promise<string>}
     */
    async ToUpper(str) {
        return this.function('ToUpper').call(str);
    }

    /**
     * Zamienia na małe litery
     * @param {string} str
     * @returns {Promise<string>}
     */
    async ToLower(str) {
        return this.function('ToLower').call(str);
    }

    /**
     * Sprawdza czy zawiera substring
     * @param {string} str
     * @param {string} substr
     * @returns {Promise<boolean>}
     */
    async Contains(str, substr) {
        const result = await this.function('Contains').call(str, substr);
        return result === 'true';
    }
}

module.exports = GoAdapter;