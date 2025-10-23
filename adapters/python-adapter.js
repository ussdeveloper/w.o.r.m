/**
 * Python Adapter - Bridge do Python
 */

let PythonShell;
try {
    PythonShell = require('python-shell').PythonShell;
} catch (error) {
    console.warn('python-shell not installed. Python API will work in simulation mode.');
    PythonShell = null;
}

const { spawn } = require('child_process');

class PythonAdapter {
    constructor() {
        this.activeSessions = new Map();
    }

    createContext(session) {
        return new PythonContext(session, this);
    }
}

class PythonContext {
    constructor(session, adapter) {
        this.session = session;
        this.adapter = adapter;
        this.imports = new Map();
        this.variables = new Map();
    }

    /**
     * Importuje moduł Python
     * @param {string} moduleName - nazwa modułu
     * @returns {PythonModule}
     */
    import(moduleName) {
        if (!this.imports.has(moduleName)) {
            const module = new PythonModule(moduleName, this);
            this.imports.set(moduleName, module);
        }
        return this.imports.get(moduleName);
    }

    /**
     * Wykonuje kod Python
     * @param {string} code - kod Python
     * @returns {Promise}
     */
    async execute(code) {
        if (!PythonShell) {
            // Symulacja dla demonstracji
            console.log('Python simulation:', code.trim());
            return ['Simulated Python result'];
        }
        
        return new Promise((resolve, reject) => {
            PythonShell.runString(code, null, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    }

    /**
     * Tworzy funkcję Python
     * @param {string} code - kod funkcji
     * @param {string} name - nazwa funkcji
     * @returns {PythonFunction}
     */
    function(code, name = 'anonymous') {
        return new PythonFunction(code, name, this);
    }
}

class PythonModule {
    constructor(name, context) {
        this.name = name;
        this.context = context;
        this.functions = new Map();
    }

    /**
     * Wywołuje funkcję z modułu
     * @param {string} functionName - nazwa funkcji
     * @returns {PythonFunction}
     */
    function(functionName) {
        const key = `${this.name}.${functionName}`;
        if (!this.functions.has(key)) {
            const func = new PythonFunction(
                `import ${this.name}\nresult = ${this.name}.${functionName}`,
                functionName,
                this.context
            );
            this.functions.set(key, func);
        }
        return this.functions.get(key);
    }

    /**
     * Tworzy array z numpy (przykład fluent API)
     * @param {Array} data - dane dla array
     * @returns {PythonArray}
     */
    array(data) {
        if (this.name === 'numpy') {
            return new PythonArray(data, this.context);
        }
        throw new Error(`Array method not available for module ${this.name}`);
    }
}

class PythonFunction {
    constructor(code, name, context) {
        this.code = code;
        this.name = name;
        this.context = context;
    }

    /**
     * Wywołuje funkcję z argumentami
     * @param {...any} args - argumenty funkcji
     * @returns {Promise}
     */
    async call(...args) {
        const argsCode = args.map(arg => 
            typeof arg === 'string' ? `"${arg}"` : JSON.stringify(arg)
        ).join(', ');
        
        const fullCode = `
${this.code}
result = ${this.name}(${argsCode})
print(result)
        `;

        try {
            const result = await this.context.execute(fullCode);
            this.context.session.addToHistory(`python.${this.name}(${argsCode})`, result);
            return result;
        } catch (error) {
            throw new Error(`Python function ${this.name} failed: ${error.message}`);
        }
    }
}

class PythonArray {
    constructor(data, context) {
        this.data = data;
        this.context = context;
        this.varName = `array_${Date.now()}`;
    }

    /**
     * Oblicza średnią
     * @returns {Promise}
     */
    async mean() {
        const code = `
import numpy as np
${this.varName} = np.array(${JSON.stringify(this.data)})
result = ${this.varName}.mean()
print(result)
        `;
        
        const result = await this.context.execute(code);
        return parseFloat(result[0]);
    }

    /**
     * Oblicza sumę
     * @returns {Promise}
     */
    async sum() {
        const code = `
import numpy as np
${this.varName} = np.array(${JSON.stringify(this.data)})
result = ${this.varName}.sum()
print(result)
        `;
        
        const result = await this.context.execute(code);
        return parseFloat(result[0]);
    }

    /**
     * Zwraca kształt array
     * @returns {Promise}
     */
    async shape() {
        const code = `
import numpy as np
${this.varName} = np.array(${JSON.stringify(this.data)})
result = ${this.varName}.shape
print(result)
        `;
        
        const result = await this.context.execute(code);
        return result[0];
    }
}

module.exports = PythonAdapter;