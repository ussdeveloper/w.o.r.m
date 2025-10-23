/**
 * JavaScript Adapter - Natywne funkcje JS
 */

class JsAdapter {
    constructor() {
        this.contexts = new Map();
    }

    createContext(session) {
        return new JsContext(session, this);
    }
}

class JsContext {
    constructor(session, adapter) {
        this.session = session;
        this.adapter = adapter;
        this.functions = new Map();
        this.variables = new Map();
    }

    /**
     * Tworzy funkcję JavaScript
     * @param {Function|string} func - funkcja lub kod
     * @param {string} name - nazwa funkcji
     * @returns {JsFunction}
     */
    function(func, name = 'anonymous') {
        const jsFunc = new JsFunction(func, name, this);
        this.functions.set(name, jsFunc);
        return jsFunc;
    }

    /**
     * Wykonuje kod JavaScript
     * @param {string} code - kod JS
     * @returns {any}
     */
    execute(code) {
        try {
            const result = eval(code);
            this.session.addToHistory(`js.execute(${code})`, result);
            return result;
        } catch (error) {
            throw new Error(`JavaScript execution failed: ${error.message}`);
        }
    }

    /**
     * Tworzy array JavaScript
     * @param {Array} data - dane
     * @returns {JsArray}
     */
    array(data) {
        return new JsArray(data, this);
    }

    /**
     * Tworzy obiekt JavaScript
     * @param {Object} data - dane
     * @returns {JsObject}
     */
    object(data) {
        return new JsObject(data, this);
    }

    /**
     * Dostęp do Math API
     * @returns {JsMath}
     */
    get math() {
        return new JsMath(this);
    }

    /**
     * Dostęp do String API
     * @returns {JsString}
     */
    string(value) {
        return new JsString(value, this);
    }
}

class JsFunction {
    constructor(func, name, context) {
        this.func = typeof func === 'string' ? eval(`(${func})`) : func;
        this.name = name;
        this.context = context;
    }

    /**
     * Wywołuje funkcję
     * @param {...any} args - argumenty
     * @returns {any}
     */
    call(...args) {
        try {
            const result = this.func(...args);
            this.context.session.addToHistory(`js.${this.name}(${args.join(', ')})`, result);
            return result;
        } catch (error) {
            throw new Error(`JavaScript function ${this.name} failed: ${error.message}`);
        }
    }

    /**
     * Mapuje funkcję na array
     * @param {Array} array - array do mapowania
     * @returns {Array}
     */
    map(array) {
        return array.map(this.func);
    }

    /**
     * Filtruje array funkcją
     * @param {Array} array - array do filtrowania
     * @returns {Array}
     */
    filter(array) {
        return array.filter(this.func);
    }
}

class JsArray {
    constructor(data, context) {
        this.data = Array.isArray(data) ? data : [data];
        this.context = context;
    }

    /**
     * Mapuje funkcję na elementy
     * @param {Function} func - funkcja
     * @returns {JsArray}
     */
    map(func) {
        const result = this.data.map(func);
        return new JsArray(result, this.context);
    }

    /**
     * Filtruje elementy
     * @param {Function} func - funkcja filtrująca
     * @returns {JsArray}
     */
    filter(func) {
        const result = this.data.filter(func);
        return new JsArray(result, this.context);
    }

    /**
     * Redukuje array
     * @param {Function} func - funkcja redukcji
     * @param {any} initial - wartość początkowa
     * @returns {any}
     */
    reduce(func, initial) {
        return this.data.reduce(func, initial);
    }

    /**
     * Oblicza sumę
     * @returns {number}
     */
    sum() {
        return this.data.reduce((a, b) => a + b, 0);
    }

    /**
     * Oblicza średnią
     * @returns {number}
     */
    mean() {
        return this.sum() / this.data.length;
    }

    /**
     * Zwraca długość
     * @returns {number}
     */
    length() {
        return this.data.length;
    }

    /**
     * Sortuje array
     * @param {Function} compareFunc - funkcja porównująca
     * @returns {JsArray}
     */
    sort(compareFunc) {
        const result = [...this.data].sort(compareFunc);
        return new JsArray(result, this.context);
    }

    /**
     * Zwraca wartości jako array
     * @returns {Array}
     */
    toArray() {
        return this.data;
    }
}

class JsObject {
    constructor(data, context) {
        this.data = data || {};
        this.context = context;
    }

    /**
     * Pobiera wartość właściwości
     * @param {string} key - klucz
     * @returns {any}
     */
    get(key) {
        return this.data[key];
    }

    /**
     * Ustawia wartość właściwości
     * @param {string} key - klucz
     * @param {any} value - wartość
     * @returns {JsObject}
     */
    set(key, value) {
        this.data[key] = value;
        return this;
    }

    /**
     * Zwraca klucze
     * @returns {Array}
     */
    keys() {
        return Object.keys(this.data);
    }

    /**
     * Zwraca wartości
     * @returns {Array}
     */
    values() {
        return Object.values(this.data);
    }

    /**
     * Zwraca obiekt jako JSON
     * @returns {Object}
     */
    toObject() {
        return this.data;
    }
}

class JsMath {
    constructor(context) {
        this.context = context;
    }

    /**
     * Pierwiastek kwadratowy
     * @param {number} x
     * @returns {number}
     */
    sqrt(x) {
        return Math.sqrt(x);
    }

    /**
     * Potęga
     * @param {number} base
     * @param {number} exp
     * @returns {number}
     */
    pow(base, exp) {
        return Math.pow(base, exp);
    }

    /**
     * Losowa liczba
     * @returns {number}
     */
    random() {
        return Math.random();
    }

    /**
     * Zaokrąglenie
     * @param {number} x
     * @returns {number}
     */
    round(x) {
        return Math.round(x);
    }
}

class JsString {
    constructor(value, context) {
        this.value = String(value);
        this.context = context;
    }

    /**
     * Zamienia na wielkie litery
     * @returns {JsString}
     */
    toUpper() {
        return new JsString(this.value.toUpperCase(), this.context);
    }

    /**
     * Zamienia na małe litery
     * @returns {JsString}
     */
    toLower() {
        return new JsString(this.value.toLowerCase(), this.context);
    }

    /**
     * Dzieli string
     * @param {string} separator
     * @returns {JsArray}
     */
    split(separator) {
        return new JsArray(this.value.split(separator), this.context);
    }

    /**
     * Zwraca długość
     * @returns {number}
     */
    length() {
        return this.value.length;
    }

    /**
     * Zwraca wartość jako string
     * @returns {string}
     */
    toString() {
        return this.value;
    }
}

module.exports = JsAdapter;