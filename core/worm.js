/**
 * WORM - Universal Language Interface
 * Główny obiekt zapewniający dostęp do wszystkich funkcjonalności
 */

const PythonAdapter = require('../adapters/python-adapter');
const CppAdapter = require('../adapters/cpp-adapter');
const GoAdapter = require('../adapters/go-adapter');
const JsAdapter = require('../adapters/js-adapter');

// Użyj simple container jeśli nie ma archiver
let WormContainer;
try {
    WormContainer = require('./container/container');
} catch (error) {
    WormContainer = require('./container/simple-container');
}

class WormCore {
    constructor() {
        this.python = new PythonAdapter();
        this.cpp = new CppAdapter();
        this.go = new GoAdapter();
        this.js = new JsAdapter();
        
        // Container system
        this.container = new WormContainer();
        
        // Rejestr aktywnych sesji
        this.sessions = new Map();
        
        // Konfiguracja globalna
        this.config = {
            timeout: 30000,
            debug: false,
            autoCleanup: true,
            embedded: process.env.WORM_EMBEDDED === 'true'
        };
    }

    /**
     * Tworzy nową sesję WORM
     * @param {string} name - nazwa sesji
     * @returns {WormSession}
     */
    createSession(name = 'default') {
        const session = new WormSession(name, this);
        this.sessions.set(name, session);
        return session;
    }

    /**
     * Pobiera istniejącą sesję
     * @param {string} name - nazwa sesji
     * @returns {WormSession|null}
     */
    getSession(name) {
        return this.sessions.get(name) || null;
    }

    /**
     * Zamyka sesję i czyści zasoby
     * @param {string} name - nazwa sesji
     */
    closeSession(name) {
        const session = this.sessions.get(name);
        if (session) {
            session.cleanup();
            this.sessions.delete(name);
        }
    }

    /**
     * Zamyka wszystkie sesje
     */
    shutdown() {
        for (const [name, session] of this.sessions) {
            session.cleanup();
        }
        this.sessions.clear();
    }
}

class WormSession {
    constructor(name, core) {
        this.name = name;
        this.core = core;
        this.context = new Map();
        this.history = [];
    }

    /**
     * Dostęp do Python API
     */
    get python() {
        return this.core.python.createContext(this);
    }

    /**
     * Dostęp do C++ API
     */
    get cpp() {
        return this.core.cpp.createContext(this);
    }

    /**
     * Dostęp do Go API
     */
    get go() {
        return this.core.go.createContext(this);
    }

    /**
     * Dostęp do JavaScript API
     */
    get js() {
        return this.core.js.createContext(this);
    }

    /**
     * Dostęp do Container API
     */
    get container() {
        return this.core.container;
    }

    /**
     * Zapisuje wartość w kontekście sesji
     * @param {string} key 
     * @param {any} value 
     */
    set(key, value) {
        this.context.set(key, value);
        return this;
    }

    /**
     * Pobiera wartość z kontekstu sesji
     * @param {string} key 
     * @returns {any}
     */
    get(key) {
        return this.context.get(key);
    }

    /**
     * Dodaje operację do historii
     * @param {string} operation 
     * @param {any} result 
     */
    addToHistory(operation, result) {
        this.history.push({
            timestamp: new Date(),
            operation,
            result
        });
    }

    /**
     * Czyści zasoby sesji
     */
    cleanup() {
        this.context.clear();
        this.history = [];
    }
}

// Główna instancja WORM
const WORM = new WormCore();

// Export dla Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WORM;
}

// Export dla przeglądarki
if (typeof window !== 'undefined') {
    window.WORM = WORM;
}

module.exports = { WORM, WormCore, WormSession };