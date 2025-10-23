/**
 * WORM Unit Tests
 */

const { WORM, WormCore, WormSession } = require('../core/worm');

describe('WORM Core', () => {
    beforeEach(() => {
        // Wyczyść wszystkie sesje przed każdym testem
        WORM.shutdown();
    });

    describe('Session Management', () => {
        test('should create a new session', () => {
            const session = WORM.createSession('test');
            expect(session).toBeInstanceOf(WormSession);
            expect(session.name).toBe('test');
            expect(WORM.sessions.has('test')).toBe(true);
        });

        test('should retrieve existing session', () => {
            const session1 = WORM.createSession('test');
            const session2 = WORM.getSession('test');
            expect(session1).toBe(session2);
        });

        test('should close session', () => {
            WORM.createSession('test');
            WORM.closeSession('test');
            expect(WORM.sessions.has('test')).toBe(false);
        });

        test('should shutdown all sessions', () => {
            WORM.createSession('test1');
            WORM.createSession('test2');
            WORM.shutdown();
            expect(WORM.sessions.size).toBe(0);
        });
    });

    describe('Session Context', () => {
        let session;

        beforeEach(() => {
            session = WORM.createSession('test');
        });

        test('should store and retrieve values', () => {
            session.set('key', 'value');
            expect(session.get('key')).toBe('value');
        });

        test('should add operations to history', () => {
            session.addToHistory('test.operation', 'result');
            expect(session.history).toHaveLength(1);
            expect(session.history[0].operation).toBe('test.operation');
            expect(session.history[0].result).toBe('result');
        });
    });
});

describe('JavaScript Adapter', () => {
    let session;

    beforeEach(() => {
        session = WORM.createSession('js_test');
    });

    afterEach(() => {
        WORM.closeSession('js_test');
    });

    describe('Functions', () => {
        test('should create and call function', () => {
            const double = session.js.function(x => x * 2, 'double');
            const result = double.call(5);
            expect(result).toBe(10);
        });

        test('should map function over array', () => {
            const double = session.js.function(x => x * 2, 'double');
            const result = double.map([1, 2, 3]);
            expect(result).toEqual([2, 4, 6]);
        });

        test('should filter array with function', () => {
            const isEven = session.js.function(x => x % 2 === 0, 'isEven');
            const result = isEven.filter([1, 2, 3, 4, 5]);
            expect(result).toEqual([2, 4]);
        });
    });

    describe('Arrays', () => {
        test('should create array and calculate sum', () => {
            const arr = session.js.array([1, 2, 3, 4, 5]);
            expect(arr.sum()).toBe(15);
        });

        test('should calculate mean', () => {
            const arr = session.js.array([2, 4, 6]);
            expect(arr.mean()).toBe(4);
        });

        test('should return length', () => {
            const arr = session.js.array([1, 2, 3]);
            expect(arr.length()).toBe(3);
        });

        test('should map array', () => {
            const arr = session.js.array([1, 2, 3]);
            const result = arr.map(x => x * 2);
            expect(result.toArray()).toEqual([2, 4, 6]);
        });

        test('should filter array', () => {
            const arr = session.js.array([1, 2, 3, 4, 5]);
            const result = arr.filter(x => x > 3);
            expect(result.toArray()).toEqual([4, 5]);
        });

        test('should sort array', () => {
            const arr = session.js.array([3, 1, 4, 1, 5]);
            const result = arr.sort();
            expect(result.toArray()).toEqual([1, 1, 3, 4, 5]);
        });

        test('should reduce array', () => {
            const arr = session.js.array([1, 2, 3, 4]);
            const result = arr.reduce((a, b) => a + b, 0);
            expect(result).toBe(10);
        });
    });

    describe('Strings', () => {
        test('should convert to uppercase', () => {
            const str = session.js.string('hello');
            const result = str.toUpper();
            expect(result.toString()).toBe('HELLO');
        });

        test('should convert to lowercase', () => {
            const str = session.js.string('HELLO');
            const result = str.toLower();
            expect(result.toString()).toBe('hello');
        });

        test('should split string', () => {
            const str = session.js.string('hello world');
            const result = str.split(' ');
            expect(result.toArray()).toEqual(['hello', 'world']);
        });

        test('should return length', () => {
            const str = session.js.string('hello');
            expect(str.length()).toBe(5);
        });
    });

    describe('Math', () => {
        test('should calculate square root', () => {
            const result = session.js.math.sqrt(16);
            expect(result).toBe(4);
        });

        test('should calculate power', () => {
            const result = session.js.math.pow(2, 3);
            expect(result).toBe(8);
        });

        test('should round number', () => {
            const result = session.js.math.round(3.7);
            expect(result).toBe(4);
        });

        test('should return random number', () => {
            const result = session.js.math.random();
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThan(1);
        });
    });

    describe('Objects', () => {
        test('should create object and get/set properties', () => {
            const obj = session.js.object({name: 'John'});
            expect(obj.get('name')).toBe('John');
            
            obj.set('age', 30);
            expect(obj.get('age')).toBe(30);
        });

        test('should return keys', () => {
            const obj = session.js.object({a: 1, b: 2});
            const keys = obj.keys();
            expect(keys).toEqual(['a', 'b']);
        });

        test('should return values', () => {
            const obj = session.js.object({a: 1, b: 2});
            const values = obj.values();
            expect(values).toEqual([1, 2]);
        });
    });
});

describe('C++ Adapter', () => {
    let session;

    beforeEach(() => {
        session = WORM.createSession('cpp_test');
    });

    afterEach(() => {
        WORM.closeSession('cpp_test');
    });

    describe('Math Functions', () => {
        test('should calculate square root', () => {
            const result = session.cpp.math.sqrt(25);
            expect(result).toBe(5);
        });

        test('should calculate sin', () => {
            const result = session.cpp.math.sin(Math.PI / 2);
            expect(result).toBeCloseTo(1, 5);
        });

        test('should calculate cos', () => {
            const result = session.cpp.math.cos(0);
            expect(result).toBeCloseTo(1, 5);
        });

        test('should calculate power', () => {
            const result = session.cpp.math.pow(2, 8);
            expect(result).toBe(256);
        });
    });

    describe('Library Loading', () => {
        test('should create library object', () => {
            const lib = session.cpp.library('test.so', {});
            expect(lib).toBeDefined();
            expect(lib.libraryPath).toBe('test.so');
        });

        test('should create function from library', () => {
            const lib = session.cpp.library('test.so', {});
            const func = lib.function('testFunc', 'double');
            expect(func).toBeDefined();
            expect(func.name).toBe('testFunc');
        });
    });
});

describe('Integration Tests', () => {
    let session;

    beforeEach(() => {
        session = WORM.createSession('integration_test');
    });

    afterEach(() => {
        WORM.closeSession('integration_test');
    });

    test('should execute fluent API chain', () => {
        const result = session.js
            .array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
            .filter(x => x % 2 === 0)
            .map(x => x * x)
            .reduce((a, b) => a + b);
        
        // Parzyste: [2, 4, 6, 8, 10]
        // Kwadraty: [4, 16, 36, 64, 100]
        // Suma: 220
        expect(result).toBe(220);
    });

    test('should combine different APIs', () => {
        // JavaScript
        const jsResult = session.js.array([1, 2, 3]).sum();
        expect(jsResult).toBe(6);
        
        // C++ Math
        const cppResult = session.cpp.math.sqrt(jsResult);
        expect(cppResult).toBeCloseTo(2.449, 3);
        
        // Session storage
        session.set('combined_result', cppResult);
        expect(session.get('combined_result')).toBe(cppResult);
    });

    test('should track operations in history', () => {
        session.js.function(x => x * 2, 'double').call(5);
        session.cpp.math.sqrt(16);
        
        expect(session.history.length).toBeGreaterThanOrEqual(2);
        
        const operations = session.history.map(entry => entry.operation);
        expect(operations).toEqual(
            expect.arrayContaining([
                expect.stringContaining('js.double'),
                expect.stringContaining('cpp.math.sqrt')
            ])
        );
    });
});

describe('Error Handling', () => {
    let session;

    beforeEach(() => {
        session = WORM.createSession('error_test');
    });

    afterEach(() => {
        WORM.closeSession('error_test');
    });

    test('should handle JavaScript function errors', () => {
        const errorFunc = session.js.function(() => {
            throw new Error('Test error');
        }, 'errorFunc');
        
        expect(() => errorFunc.call()).toThrow('Test error');
    });

    test('should handle invalid array operations', () => {
        const arr = session.js.array([]);
        expect(() => arr.reduce((a, b) => a + b)).toThrow();
    });
});

// Mock dla testów Python i Go (wymagają zewnętrznych zależności)
describe('Python Adapter (Mock)', () => {
    test('should be available', () => {
        const session = WORM.createSession('python_test');
        expect(session.python).toBeDefined();
        WORM.closeSession('python_test');
    });
});

describe('Go Adapter (Mock)', () => {
    test('should be available', () => {
        const session = WORM.createSession('go_test');
        expect(session.go).toBeDefined();
        WORM.closeSession('go_test');
    });
});