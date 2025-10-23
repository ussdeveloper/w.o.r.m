/**
 * Podstawowe przykłady użycia WORM
 */

const { WORM } = require('../core/worm');

async function runExamples() {
    console.log('=== WORM - Przykłady użycia ===\n');

    // Utwórz sesję
    const session = WORM.createSession('demo');

    try {
        // === JavaScript API ===
        console.log('1. JavaScript API:');
        
        // Podstawowe operacje
        const jsResult1 = session.js.function(x => x * 2, 'double').call(5);
        console.log(`   double(5) = ${jsResult1}`);
        
        // Array operations
        const jsArray = session.js.array([1, 2, 3, 4, 5]);
        console.log(`   [1,2,3,4,5].sum() = ${jsArray.sum()}`);
        console.log(`   [1,2,3,4,5].mean() = ${jsArray.mean()}`);
        
        // String operations
        const jsString = session.js.string('hello world');
        console.log(`   "hello world".toUpper() = "${jsString.toUpper().toString()}"`);
        
        // Math operations
        console.log(`   math.sqrt(16) = ${session.js.math.sqrt(16)}`);
        console.log(`   math.pow(2, 3) = ${session.js.math.pow(2, 3)}`);

        // === Python API (symulacja) ===
        console.log('\n2. Python API (wymaga python-shell):');
        
        try {
            // Podstawowy Python
            // const pyResult = await session.python.execute('print(2 + 3)');
            // console.log(`   Python: 2 + 3 = ${pyResult}`);
            
            // NumPy (symulacja)
            // const numpy = session.python.import('numpy');
            // const npArray = numpy.array([1, 2, 3, 4, 5]);
            // const mean = await npArray.mean();
            // console.log(`   numpy.array([1,2,3,4,5]).mean() = ${mean}`);
            
            console.log('   Python API - dostępne po zainstalowaniu python-shell');
        } catch (error) {
            console.log(`   Python API - błąd: ${error.message}`);
        }

        // === C++ API (symulacja) ===
        console.log('\n3. C++ API (symulacja):');
        
        const cppMath = session.cpp.math;
        console.log(`   cpp.math.sqrt(25) = ${cppMath.sqrt(25)}`);
        console.log(`   cpp.math.sin(1.57) = ${cppMath.sin(1.57).toFixed(3)}`);
        console.log(`   cpp.math.pow(2, 8) = ${cppMath.pow(2, 8)}`);

        // === Go API (symulacja) ===
        console.log('\n4. Go API (wymaga Go):');
        
        try {
            const goInstalled = await session.go.adapter.checkGoInstallation();
            if (goInstalled) {
                // const goResult = await session.go.strings.function('ToUpper').call('hello');
                // console.log(`   strings.ToUpper("hello") = ${goResult}`);
                console.log('   Go API - dostępne');
            } else {
                console.log('   Go API - Go nie jest zainstalowane');
            }
        } catch (error) {
            console.log(`   Go API - błąd: ${error.message}`);
        }

        // === Zaawansowane przykłady ===
        console.log('\n5. Zaawansowane przykłady:');
        
        // Łączenie operacji
        const data = [1, 2, 3, 4, 5];
        const processedData = session.js.array(data)
            .map(x => x * 2)           // [2, 4, 6, 8, 10]
            .filter(x => x > 5)       // [6, 8, 10]
            .toArray();
        console.log(`   [1,2,3,4,5] -> map(*2) -> filter(>5) = [${processedData}]`);
        
        // Przechowywanie w sesji
        session.set('myData', [10, 20, 30]);
        const storedData = session.get('myData');
        console.log(`   Stored data: [${storedData}]`);

        // Historia operacji
        console.log('\n6. Historia operacji:');
        session.history.slice(-3).forEach((entry, index) => {
            console.log(`   ${index + 1}. ${entry.operation} -> ${entry.result}`);
        });

        // === Fluent API Chain ===
        console.log('\n7. Fluent API Chain:');
        
        const chainResult = session.js
            .array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
            .filter(x => x % 2 === 0)  // parzyste
            .map(x => x * x)           // kwadraty
            .reduce((a, b) => a + b, 0);  // suma z initial value
        
        console.log(`   [1..10] -> filter(even) -> map(square) -> sum = ${chainResult}`);

    } catch (error) {
        console.error('Błąd w przykładach:', error.message);
    } finally {
        // Zamknij sesję
        WORM.closeSession('demo');
    }
}

// Uruchom przykłady jeśli plik jest uruchamiany bezpośrednio
if (require.main === module) {
    runExamples().catch(console.error);
}

module.exports = { runExamples };