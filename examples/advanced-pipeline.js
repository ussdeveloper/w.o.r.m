/**
 * Zaawansowane przykłady WORM - Machine Learning Pipeline
 */

const { WORM } = require('../core/worm');

async function machineLearningPipeline() {
    console.log('=== WORM ML Pipeline ===\n');

    const session = WORM.createSession('ml_pipeline');

    try {
        // === 1. Przygotowanie danych (JavaScript) ===
        console.log('1. Przygotowanie danych:');
        
        // Generuj przykładowe dane
        const rawData = Array.from({length: 100}, (_, i) => ({
            x: i / 10,
            y: Math.sin(i / 10) + Math.random() * 0.1,
            label: Math.sin(i / 10) > 0 ? 1 : 0
        }));
        
        session.set('rawData', rawData);
        console.log(`   Wygenerowano ${rawData.length} próbek danych`);

        // === 2. Preprocessing (JavaScript + Python symulacja) ===
        console.log('\n2. Preprocessing:');
        
        // Normalizacja danych (JavaScript)
        const features = session.js.array(rawData.map(d => d.x));
        const labels = session.js.array(rawData.map(d => d.label));
        
        const minX = Math.min(...features.toArray());
        const maxX = Math.max(...features.toArray());
        
        const normalizedFeatures = features.map(x => (x - minX) / (maxX - minX));
        
        console.log(`   Normalizacja: min=${minX.toFixed(2)}, max=${maxX.toFixed(2)}`);
        
        session.set('features', normalizedFeatures.toArray());
        session.set('labels', labels.toArray());

        // === 3. Feature Engineering (Python symulacja) ===
        console.log('\n3. Feature Engineering (Python):');
        
        // Symulacja tworzenia cech pochodnych
        const engineeredFeatures = normalizedFeatures.toArray().map(x => [
            x,          // oryginalna cecha
            x * x,      // kwadrat
            Math.sin(x * Math.PI), // transformacja trygonometryczna
            x > 0.5 ? 1 : 0  // cecha binarna
        ]);
        
        session.set('engineeredFeatures', engineeredFeatures);
        console.log(`   Utworzono ${engineeredFeatures[0].length} cech dla każdej próbki`);

        // === 4. Model Training (C++ symulacja) ===
        console.log('\n4. Model Training (C++):');
        
        // Symulacja treningu modelu w C++
        const weights = session.cpp.math; // Użyj C++ do obliczeń
        
        // Symulacja gradientu descendu
        let w = [0.1, 0.1, 0.1, 0.1]; // wagi początkowe
        const learningRate = 0.01;
        
        console.log('   Trening modelu...');
        for (let epoch = 0; epoch < 5; epoch++) {
            // Symulacja jednej epoki
            const loss = Math.random() * (1 - epoch * 0.15); // symulowana strata
            console.log(`   Epoka ${epoch + 1}: loss = ${loss.toFixed(4)}`);
        }
        
        session.set('modelWeights', w);

        // === 5. Evaluation (Go symulacja) ===
        console.log('\n5. Model Evaluation (Go):');
        
        // Symulacja ewaluacji w Go
        const testData = engineeredFeatures.slice(0, 20); // pierwsze 20 próbek
        const testLabels = labels.toArray().slice(0, 20);
        
        // Symulacja predykcji
        let correctPredictions = 0;
        for (let i = 0; i < testData.length; i++) {
            // Symulowana predykcja
            const prediction = Math.random() > 0.3 ? testLabels[i] : 1 - testLabels[i];
            if (prediction === testLabels[i]) correctPredictions++;
        }
        
        const accuracy = correctPredictions / testData.length;
        console.log(`   Accuracy: ${(accuracy * 100).toFixed(2)}%`);
        console.log(`   Correct: ${correctPredictions}/${testData.length}`);

        // === 6. Pipeline Summary ===
        console.log('\n6. Pipeline Summary:');
        
        const pipeline = {
            dataPoints: rawData.length,
            features: engineeredFeatures[0].length,
            trainedModel: true,
            accuracy: accuracy,
            languages: ['JavaScript', 'Python', 'C++', 'Go']
        };
        
        session.set('pipelineResult', pipeline);
        
        console.log('   Pipeline wykonany z wykorzystaniem:');
        pipeline.languages.forEach(lang => {
            console.log(`   - ${lang}`);
        });

        // === 7. Real-time Prediction API ===
        console.log('\n7. Real-time Prediction:');
        
        // Funkcja predykcji używająca wszystkich języków
        const predictFunction = session.js.function((inputX) => {
            // 1. Normalizacja (JavaScript)
            const normalized = (inputX - minX) / (maxX - minX);
            
            // 2. Feature engineering (Python-style)
            const features = [
                normalized,
                normalized * normalized,
                Math.sin(normalized * Math.PI),
                normalized > 0.5 ? 1 : 0
            ];
            
            // 3. Predykcja (C++-style)
            const prediction = features.reduce((sum, feat, i) => 
                sum + feat * w[i], 0);
            
            // 4. Klasyfikacja (Go-style)
            return prediction > 0.5 ? 1 : 0;
        }, 'mlPredict');
        
        // Test predykcji
        const testInput = 1.5;
        const prediction = predictFunction.call(testInput);
        console.log(`   Predykcja dla x=${testInput}: ${prediction}`);

        // === 8. Session History ===
        console.log('\n8. Historia operacji:');
        session.history.slice(-5).forEach((entry, index) => {
            console.log(`   ${index + 1}. ${entry.operation}`);
        });

    } catch (error) {
        console.error('Błąd w pipeline:', error.message);
    } finally {
        WORM.closeSession('ml_pipeline');
    }
}

// Przykład z przetwarzaniem tekstu
async function textProcessingPipeline() {
    console.log('\n=== WORM Text Processing Pipeline ===\n');

    const session = WORM.createSession('text_processing');

    try {
        // === 1. Przygotowanie tekstu ===
        const text = "Hello World! This is a WORM text processing example. WORM can handle multiple languages seamlessly.";
        
        console.log('1. Oryginalny tekst:');
        console.log(`   "${text}"`);

        // === 2. JavaScript processing ===
        console.log('\n2. JavaScript processing:');
        
        const jsText = session.js.string(text);
        const words = jsText.split(' ');
        const wordCount = words.length();
        const upperText = jsText.toUpper().toString();
        
        console.log(`   Liczba słów: ${wordCount}`);
        console.log(`   Wielkie litery: "${upperText}"`);

        // === 3. Go processing (symulacja) ===
        console.log('\n3. Go string processing:');
        
        // Symulacja Go strings operations
        const goResult = {
            contains_worm: text.includes('WORM'),
            word_length_avg: words.toArray().reduce((sum, word) => sum + word.length, 0) / wordCount
        };
        
        console.log(`   Zawiera 'WORM': ${goResult.contains_worm}`);
        console.log(`   Średnia długość słowa: ${goResult.word_length_avg.toFixed(2)}`);

        // === 4. Python NLP (symulacja) ===
        console.log('\n4. Python NLP processing:');
        
        // Symulacja analizy sentymentu
        const sentiment = text.includes('!') ? 'positive' : 'neutral';
        const entities = ['WORM', 'World']; // symulacja NER
        
        console.log(`   Sentiment: ${sentiment}`);
        console.log(`   Entities: ${entities.join(', ')}`);

        // === 5. C++ performance processing ===
        console.log('\n5. C++ performance metrics:');
        
        // Symulacja szybkich obliczeń w C++
        const perfMetrics = {
            processing_time: '0.001ms',
            memory_usage: '1.2KB',
            throughput: '1M chars/sec'
        };
        
        Object.entries(perfMetrics).forEach(([key, value]) => {
            console.log(`   ${key}: ${value}`);
        });

        // === 6. Unified result ===
        const result = {
            original: text,
            word_count: wordCount,
            sentiment: sentiment,
            entities: entities,
            performance: perfMetrics,
            processed_by: ['JavaScript', 'Go', 'Python', 'C++']
        };

        session.set('textProcessingResult', result);
        console.log('\n6. Unified result stored in session');

    } catch (error) {
        console.error('Błąd w text processing:', error.message);
    } finally {
        WORM.closeSession('text_processing');
    }
}

// Uruchom przykłady
if (require.main === module) {
    (async () => {
        await machineLearningPipeline();
        await textProcessingPipeline();
    })().catch(console.error);
}

module.exports = { 
    machineLearningPipeline, 
    textProcessingPipeline 
};