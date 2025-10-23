# WORM API Documentation

## Główny Obiekt WORM

### Tworzenie Sesji
```javascript
const session = WORM.createSession('mySession');
```

### Zamykanie Sesji
```javascript
WORM.closeSession('mySession');
WORM.shutdown(); // zamyka wszystkie sesje
```

## JavaScript API

### Podstawowe Operacje
```javascript
// Funkcje
const double = session.js.function(x => x * 2, 'double');
const result = double.call(5); // 10

// Array operations
const arr = session.js.array([1, 2, 3, 4, 5]);
arr.sum();        // 15
arr.mean();       // 3
arr.length();     // 5
arr.map(x => x * 2);     // [2, 4, 6, 8, 10]
arr.filter(x => x > 3);  // [4, 5]
arr.sort();              // [1, 2, 3, 4, 5]

// String operations
const str = session.js.string('Hello World');
str.toUpper();    // 'HELLO WORLD'
str.toLower();    // 'hello world'
str.split(' ');   // ['Hello', 'World']
str.length();     // 11

// Math operations
session.js.math.sqrt(16);     // 4
session.js.math.pow(2, 3);    // 8
session.js.math.random();     // random number

// Object operations
const obj = session.js.object({name: 'John', age: 30});
obj.get('name');          // 'John'
obj.set('city', 'NYC');   // chainable
obj.keys();               // ['name', 'age', 'city']
obj.values();             // ['John', 30, 'NYC']
```

## Python API

### Import i Moduły
```javascript
// Import modułu
const numpy = session.python.import('numpy');
const pandas = session.python.import('pandas');

// Funkcje modułu
const sqrt = numpy.function('sqrt');
const result = await sqrt.call(16); // 4

// NumPy arrays
const arr = numpy.array([1, 2, 3, 4, 5]);
const mean = await arr.mean();    // 3.0
const sum = await arr.sum();      // 15
const shape = await arr.shape();  // (5,)
```

### Wykonywanie Kodu Python
```javascript
const result = await session.python.execute(`
import numpy as np
arr = np.array([1, 2, 3])
print(arr.mean())
`);
```

### Funkcje Python
```javascript
const pyFunc = session.python.function(`
def calculate(x, y):
    return x ** 2 + y ** 2
`, 'calculate');

const result = await pyFunc.call(3, 4); // 25
```

## C++ API

### Biblioteki Systemowe
```javascript
// Matematyka
const result1 = session.cpp.math.sqrt(25);    // 5
const result2 = session.cpp.math.sin(1.57);   // ~1
const result3 = session.cpp.math.pow(2, 8);   // 256

// Ładowanie własnej biblioteki
const myLib = session.cpp.library('./mylib.so', {
    'add': ['int', ['int', 'int']],
    'multiply': ['double', ['double', 'double']]
});

const addFunc = myLib.function('add');
const result = addFunc.call(5, 3); // 8
```

### Kompilacja Kodu C++
```javascript
const cppCode = `
extern "C" {
    double calculate(double x, double y) {
        return x * x + y * y;
    }
}
`;

const lib = await session.cpp.compile(cppCode, 'math_lib');
const calc = lib.function('calculate', ['double', ['double', 'double']]);
const result = calc.call(3.0, 4.0); // 25.0
```

## Go API

### Standardowe Moduły
```javascript
// Strings module
const result1 = await session.go.strings.function('ToUpper').call('hello');
// 'HELLO'

const result2 = await session.go.strings.function('Contains').call('hello', 'ell');
// true

// Math module
const result3 = await session.go.math.function('Sqrt').call(16);
// 4

// Time module
const result4 = await session.go.time.function('Now').call();
// current timestamp
```

### Wykonywanie Kodu Go
```javascript
const goCode = `
package main

import (
    "fmt"
    "strings"
)

func main() {
    result := strings.ToUpper("hello world")
    fmt.Print(result)
}
`;

const result = await session.go.run(goCode); // 'HELLO WORLD'
```

### Własne Moduły Go
```javascript
const myModule = session.go.module('mypackage');
const myFunc = myModule.function('MyFunction');
const result = await myFunc.call(arg1, arg2);
```

## Zarządzanie Sesją

### Kontekst Sesji
```javascript
// Zapisywanie danych
session.set('key', value);
const value = session.get('key');

// Historia operacji
session.history.forEach(entry => {
    console.log(entry.timestamp, entry.operation, entry.result);
});
```

### Łączenie Operacji (Fluent API)
```javascript
// Przykład pipeline
const result = session.js
    .array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    .filter(x => x % 2 === 0)     // parzyste: [2, 4, 6, 8, 10]
    .map(x => x * x)              // kwadraty: [4, 16, 36, 64, 100]
    .reduce((a, b) => a + b);     // suma: 220

// Łączenie różnych języków
const data = [1, 2, 3, 4, 5];

// 1. Preprocessing w JavaScript
const processedData = session.js.array(data)
    .map(x => x * 2)
    .toArray();

// 2. Analiza w Python
const numpy = session.python.import('numpy');
const npArray = numpy.array(processedData);
const mean = await npArray.mean();

// 3. Obliczenia w C++
const mathResult = session.cpp.math.sqrt(mean);

// 4. Formatowanie w Go
const formatted = await session.go.fmt.function('Sprintf').call("%.2f", mathResult);
```

## Zaawansowane Funkcje

### Asynchroniczne Operacje
```javascript
// Równoległe wykonanie
const promises = [
    session.python.import('numpy').array([1,2,3]).mean(),
    session.cpp.math.sqrt(16),
    session.go.strings.function('ToUpper').call('hello')
];

const results = await Promise.all(promises);
```

### Error Handling
```javascript
try {
    const result = await session.python.execute('invalid python code');
} catch (error) {
    console.error('Python error:', error.message);
}
```

### Konfiguracja
```javascript
// Globalna konfiguracja
WORM.config.timeout = 60000;
WORM.config.debug = true;

// Konfiguracja sesji
const session = WORM.createSession('mySession');
session.config = {
    pythonPath: '/usr/bin/python3',
    cppCompiler: 'g++',
    goPath: '/usr/local/go/bin/go'
};
```

## Przykłady Zastosowań

### Machine Learning Pipeline
```javascript
const session = WORM.createSession('ml');

// 1. Przygotowanie danych (JS)
const data = session.js.array(rawData).map(normalize);

// 2. Feature engineering (Python)
const sklearn = session.python.import('sklearn.preprocessing');
const scaler = sklearn.function('StandardScaler');
const scaledData = await scaler.fit_transform(data);

// 3. Trening modelu (C++)
const model = session.cpp.library('./ml_model.so');
const trainedModel = model.function('train').call(scaledData);

// 4. Ewaluacja (Go)
const metrics = await session.go.module('ml').function('evaluate').call(trainedModel);
```

### Data Processing Pipeline
```javascript
const session = WORM.createSession('data');

// 1. Załaduj dane (JS)
const rawData = session.js.array(csvData);

// 2. Czyść dane (Python)
const pandas = session.python.import('pandas');
const df = pandas.DataFrame(rawData);
const cleanedData = await df.dropna().values;

// 3. Agreguj (C++)
const stats = session.cpp.math.calculateStats(cleanedData);

// 4. Format output (Go)
const report = await session.go.fmt.function('generateReport').call(stats);
```