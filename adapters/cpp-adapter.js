/**
 * C++ Adapter - Bridge do bibliotek C/C++
 */

let ffi;
try {
    ffi = require('ffi-napi');
} catch (error) {
    console.warn('ffi-napi not installed. C++ API will work in simulation mode.');
    ffi = null;
}

const { spawn } = require('child_process');
const path = require('path');

class CppAdapter {
    constructor() {
        this.libraries = new Map();
        this.compiledLibs = new Map();
    }

    createContext(session) {
        return new CppContext(session, this);
    }
}

class CppContext {
    constructor(session, adapter) {
        this.session = session;
        this.adapter = adapter;
        this.loadedLibraries = new Map();
    }

    /**
     * Ładuje bibliotekę C/C++
     * @param {string} libraryPath - ścieżka do biblioteki
     * @param {Object} functions - definicje funkcji
     * @returns {CppLibrary}
     */
    library(libraryPath, functions = {}) {
        const key = path.basename(libraryPath);
        if (!this.loadedLibraries.has(key)) {
            const lib = new CppLibrary(libraryPath, functions, this);
            this.loadedLibraries.set(key, lib);
        }
        return this.loadedLibraries.get(key);
    }

    /**
     * Kompiluje kod C++ do biblioteki współdzielonej
     * @param {string} code - kod C++
     * @param {string} outputName - nazwa wyjściowej biblioteki
     * @returns {Promise<CppLibrary>}
     */
    async compile(code, outputName = 'temp_lib') {
        return new Promise((resolve, reject) => {
            const sourceFile = `${outputName}.cpp`;
            const libFile = process.platform === 'win32' ? `${outputName}.dll` : `lib${outputName}.so`;
            
            // Zapisz kod do pliku
            require('fs').writeFileSync(sourceFile, code);
            
            // Kompiluj
            const compiler = process.platform === 'win32' ? 'cl' : 'g++';
            const compileArgs = process.platform === 'win32' 
                ? ['/LD', sourceFile, `/Fe:${libFile}`]
                : ['-shared', '-fPIC', sourceFile, '-o', libFile];
            
            const compileProcess = spawn(compiler, compileArgs);
            
            compileProcess.on('close', (code) => {
                if (code === 0) {
                    const lib = new CppLibrary(libFile, {}, this);
                    resolve(lib);
                } else {
                    reject(new Error(`Compilation failed with code ${code}`));
                }
            });
        });
    }

    /**
     * Standardowe biblioteki matematyczne
     * @returns {CppMath}
     */
    get math() {
        return new CppMath(this);
    }
}

class CppLibrary {
    constructor(libraryPath, functions, context) {
        this.libraryPath = libraryPath;
        this.context = context;
        this.functions = new Map();
        
        try {
            // Próba załadowania biblioteki przez FFI
            if (ffi) {
                this.ffiLib = ffi.Library(libraryPath, functions);
                
                // Dodaj funkcje do mapy
                for (const [name, signature] of Object.entries(functions)) {
                    this.functions.set(name, new CppFunction(name, signature, this.ffiLib[name], this.context));
                }
            } else {
                console.warn(`FFI not available, C++ library ${libraryPath} will work in simulation mode`);
                this.ffiLib = null;
            }
        } catch (error) {
            console.warn(`Could not load library ${libraryPath}: ${error.message}`);
            this.ffiLib = null;
        }
    }

    /**
     * Pobiera funkcję z biblioteki
     * @param {string} functionName - nazwa funkcji
     * @param {string} signature - sygnatura funkcji dla FFI
     * @returns {CppFunction}
     */
    function(functionName, signature = 'double') {
        if (!this.functions.has(functionName)) {
            if (this.ffiLib && this.ffiLib[functionName]) {
                const func = new CppFunction(functionName, signature, this.ffiLib[functionName], this.context);
                this.functions.set(functionName, func);
            } else {
                // Twórz placeholder funkcję
                const func = new CppFunction(functionName, signature, null, this.context);
                this.functions.set(functionName, func);
            }
        }
        return this.functions.get(functionName);
    }
}

class CppFunction {
    constructor(name, signature, nativeFunc, context) {
        this.name = name;
        this.signature = signature;
        this.nativeFunc = nativeFunc;
        this.context = context;
    }

    /**
     * Wywołuje funkcję C++
     * @param {...any} args - argumenty
     * @returns {any}
     */
    call(...args) {
        try {
            if (this.nativeFunc) {
                const result = this.nativeFunc(...args);
                this.context.session.addToHistory(`cpp.${this.name}(${args.join(', ')})`, result);
                return result;
            } else {
                // Symulacja dla demonstracji
                console.log(`Would call C++ function ${this.name} with args:`, args);
                return `C++ ${this.name} result`;
            }
        } catch (error) {
            throw new Error(`C++ function ${this.name} failed: ${error.message}`);
        }
    }
}

class CppMath {
    constructor(context) {
        this.context = context;
    }

    /**
     * Pierwiastek kwadratowy (symulacja)
     * @param {number} x
     * @returns {number}
     */
    sqrt(x) {
        // W rzeczywistości wywoływałby funkcję z libm
        const result = Math.sqrt(x);
        this.context.session.addToHistory(`cpp.math.sqrt(${x})`, result);
        return result;
    }

    /**
     * Sinus (symulacja)
     * @param {number} x
     * @returns {number}
     */
    sin(x) {
        const result = Math.sin(x);
        this.context.session.addToHistory(`cpp.math.sin(${x})`, result);
        return result;
    }

    /**
     * Cosinus (symulacja)
     * @param {number} x
     * @returns {number}
     */
    cos(x) {
        const result = Math.cos(x);
        this.context.session.addToHistory(`cpp.math.cos(${x})`, result);
        return result;
    }

    /**
     * Potęga (symulacja)
     * @param {number} base
     * @param {number} exp
     * @returns {number}
     */
    pow(base, exp) {
        const result = Math.pow(base, exp);
        this.context.session.addToHistory(`cpp.math.pow(${base}, ${exp})`, result);
        return result;
    }
}

module.exports = CppAdapter;