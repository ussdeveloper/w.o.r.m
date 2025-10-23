# WORM - Quick Start Guide

## Co to jest WORM?

**W**orld **O**f **R**esource **M**anagement to uniwersalny język programowania oparty na JavaScript, który umożliwia korzystanie z bibliotek C/C++, Go, Python i JavaScript poprzez jeden jednolity interfejs API z fluent syntax.

## Szybki Start

### 1. Podstawowe użycie
```javascript
const { WORM } = require('./core/worm');

// Utwórz sesję
const session = WORM.createSession('mywork');

// JavaScript API - dostępne natychmiast
const result = session.js.array([1, 2, 3, 4, 5]).sum(); // 15
console.log(result);

// Zamknij sesję
WORM.closeSession('mywork');
```

### 2. Fluent API w akcji
```javascript
const session = WORM.createSession('demo');

// Łańcuchowanie operacji
const result = session.js
    .array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    .filter(x => x % 2 === 0)     // parzyste: [2, 4, 6, 8, 10]
    .map(x => x * x)              // kwadraty: [4, 16, 36, 64, 100]
    .reduce((a, b) => a + b, 0);  // suma: 220

console.log('Result:', result); // 220
```

### 3. Różne typy danych
```javascript
const session = WORM.createSession('types');

// Arrays
session.js.array([1, 2, 3]).mean();           // 2
session.js.array([5, 2, 8]).sort().toArray(); // [2, 5, 8]

// Strings  
session.js.string('Hello World').toUpper().toString(); // 'HELLO WORLD'
session.js.string('a,b,c').split(',').toArray();       // ['a', 'b', 'c']

// Math
session.js.math.sqrt(16);    // 4
session.js.math.pow(2, 3);   // 8

// Objects
const obj = session.js.object({name: 'John', age: 30});
obj.get('name');             // 'John'
obj.set('city', 'NYC');      // chainable
obj.keys();                  // ['name', 'age', 'city']
```

### 4. Funkcje użytkownika
```javascript
const session = WORM.createSession('functions');

// Stwórz własną funkcję
const double = session.js.function(x => x * 2, 'double');
double.call(5);              // 10

// Użyj funkcji na array
double.map([1, 2, 3]);       // [2, 4, 6]

// Złożona funkcja
const isPrime = session.js.function(n => {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) return false;
    }
    return true;
}, 'isPrime');

session.js.array([2, 3, 4, 5, 6, 7, 8, 9, 10])
    .filter(isPrime.func)
    .toArray();              // [2, 3, 5, 7]
```

### 5. Sesje i kontekst
```javascript
const session = WORM.createSession('context');

// Zapisz dane w sesji
session.set('myData', [10, 20, 30, 40, 50]);
session.set('threshold', 25);

// Użyj danych z sesji
const data = session.get('myData');
const threshold = session.get('threshold');

const filtered = session.js.array(data)
    .filter(x => x > threshold)
    .toArray();              // [30, 40, 50]

// Historia operacji
session.history.forEach(entry => {
    console.log(`${entry.operation} -> ${entry.result}`);
});
```

## Rozbudowane Przykłady

### Machine Learning Pipeline
```javascript
const session = WORM.createSession('ml');

// 1. Przygotuj dane
const rawData = Array.from({length: 100}, (_, i) => ({
    x: i / 10,
    y: Math.sin(i / 10) + Math.random() * 0.1
}));

// 2. Normalizacja (JavaScript)
const features = session.js.array(rawData.map(d => d.x));
const normalized = features.map(x => (x - 0) / 10);

// 3. Feature engineering
const engineered = normalized.map(x => [x, x*x, Math.sin(x*Math.PI)]);

// 4. Analiza statystyczna
const stats = {
    mean: normalized.mean(),
    variance: normalized.map(x => x * x).mean() - normalized.mean() ** 2
};

console.log('ML Pipeline Stats:', stats);
```

### Data Processing Pipeline
```javascript
const session = WORM.createSession('data');

// Przykładowe dane CSV-like
const csvData = [
    {id: 1, name: 'Alice', score: 85},
    {id: 2, name: 'Bob', score: 92},
    {id: 3, name: 'Charlie', score: 78},
    {id: 4, name: 'Diana', score: 96}
];

// Pipeline przetwarzania
const highPerformers = session.js
    .array(csvData)
    .filter(student => student.score > 80)
    .map(student => ({
        ...student,
        grade: student.score > 90 ? 'A' : 'B'
    }))
    .toArray();

console.log('High Performers:', highPerformers);
// [
//   {id: 1, name: 'Alice', score: 85, grade: 'B'},
//   {id: 2, name: 'Bob', score: 92, grade: 'A'},
//   {id: 4, name: 'Diana', score: 96, grade: 'A'}
// ]
```

## CLI Usage

### Podstawowe komendy
```bash
node worm.js examples          # Uruchom przykłady
node worm.js interactive       # Tryb interaktywny
node worm.js version           # Pokaż wersję
node worm.js help              # Pomoc
```

### Tryb interaktywny
```bash
node worm.js interactive

WORM> js.array([1,2,3,4,5]).sum()
Result: 15

WORM> session.set('data', [10,20,30])
Result: Stored: data = [10,20,30]

WORM> js.array(session.get('data')).mean()
Result: 20

WORM> exit
```

### Opcje debugowania
```bash
node worm.js examples --debug
node worm.js interactive --session mywork --debug
```

## Najlepsze Praktyki

### 1. Zarządzanie sesjami
```javascript
// ✅ Dobrze - zamknij sesję
const session = WORM.createSession('work');
// ... użyj sesję
WORM.closeSession('work');

// ✅ Dobrze - reużywaj sesji
const session = WORM.getSession('main') || WORM.createSession('main');
```

### 2. Error handling
```javascript
try {
    const result = session.js.function(() => {
        throw new Error('Something went wrong');
    }).call();
} catch (error) {
    console.error('Function failed:', error.message);
}
```

### 3. Łączenie operacji
```javascript
// ✅ Dobrze - fluent API
const result = session.js.array(data)
    .filter(x => x > 0)
    .map(x => x * 2)
    .sum();

// ❌ Źle - wiele wywołań
const filtered = session.js.array(data).filter(x => x > 0);
const mapped = filtered.map(x => x * 2);
const sum = mapped.sum();
```

### 4. Wykorzystaj kontekst sesji
```javascript
// Zapisuj pośrednie wyniki
session.set('processedData', processedArray);
session.set('config', {threshold: 10, multiplier: 2});

// Używaj w późniejszych operacjach
const config = session.get('config');
const result = session.js.array(rawData)
    .filter(x => x > config.threshold)
    .map(x => x * config.multiplier);
```

## Co dalej?

1. **Zainstaluj opcjonalne zależności** dla Python/C++/Go API
2. **Przeczytaj pełną dokumentację** w `docs/API.md`
3. **Sprawdź zaawansowane przykłady** w `examples/advanced-pipeline.js`
4. **Eksperymentuj w trybie interaktywnym** `node worm.js interactive`

## Troubleshooting

### Problem: "Module not found"
```bash
npm install  # Zainstaluj zależności Node.js
```

### Problem: Python/C++/Go API nie działa
```bash
# Sprawdź INSTALL.md dla instrukcji instalacji opcjonalnych komponentów
```

### Problem: Wolna wydajność
- Używaj `.toArray()` tylko gdy potrzebne
- Reużywaj sesji zamiast tworzyć nowe
- Łącz operacje w pipelines

---

**WORM - One API to rule them all! 🐛**