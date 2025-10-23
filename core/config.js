/**
 * WORM Configuration
 */

module.exports = {
    // Globalne ustawienia
    global: {
        timeout: 30000,          // 30 sekund timeout dla operacji
        debug: false,            // tryb debug
        autoCleanup: true,       // automatyczne czyszczenie sesji
        maxSessions: 10,         // maksymalna liczba aktywnych sesji
        logLevel: 'info'         // poziom logowania: debug, info, warn, error
    },

    // Konfiguracja adapterów
    adapters: {
        python: {
            executable: 'python',   // ścieżka do Python
            timeout: 15000,         // timeout dla operacji Python
            maxMemory: '512m',      // maksymalne zużycie pamięci
            virtualenv: null,       // ścieżka do virtualenv
            packages: [             // wymagane pakiety
                'numpy',
                'pandas',
                'scikit-learn'
            ]
        },

        cpp: {
            compiler: {
                windows: 'cl',      // MSVC na Windows
                linux: 'g++',       // GCC na Linux
                macos: 'clang++'    // Clang na macOS
            },
            flags: ['-O2', '-std=c++17'],
            libraries: ['-lm'],     // standardowe biblioteki
            includePaths: [],       // dodatkowe ścieżki include
            libraryPaths: []        // dodatkowe ścieżki bibliotek
        },

        go: {
            executable: 'go',       // ścieżka do Go
            timeout: 10000,         // timeout dla operacji Go
            buildFlags: [],         // flagi kompilacji
            environment: {          // zmienne środowiskowe
                'GOOS': process.platform === 'win32' ? 'windows' : 'linux',
                'GOARCH': 'amd64'
            }
        },

        javascript: {
            engine: 'v8',           // silnik JS
            timeout: 5000,          // timeout dla operacji JS
            maxMemory: '256m',      // maksymalne zużycie pamięci
            sandbox: true           // tryb sandbox
        }
    },

    // Konfiguracja bezpieczeństwa
    security: {
        allowFileSystem: true,      // dostęp do systemu plików
        allowNetwork: true,         // dostęp do sieci
        allowProcessSpawn: true,    // tworzenie procesów
        restrictedPaths: [          // ograniczone ścieżki
            '/etc',
            '/usr/bin',
            'C:\\Windows\\System32'
        ],
        maxCodeLength: 10000,       // maksymalna długość kodu
        maxExecutionTime: 30000     // maksymalny czas wykonania
    },

    // Konfiguracja cachowania
    cache: {
        enabled: true,              // włączenie cache
        ttl: 300000,               // czas życia cache (5 min)
        maxSize: 100,              // maksymalna liczba elementów
        compressionEnabled: true    // kompresja danych w cache
    },

    // Konfiguracja logowania
    logging: {
        enabled: true,
        file: 'worm.log',
        maxSize: '10m',
        maxFiles: 5,
        format: 'json'              // json lub text
    },

    // Domyślne ścieżki
    paths: {
        temp: './temp',             // katalog tymczasowy
        logs: './logs',             // katalog logów
        cache: './cache',           // katalog cache
        libraries: './libraries'    // katalog bibliotek
    },

    // Konfiguracja wydajności
    performance: {
        concurrentSessions: 5,      // równoczesne sesje
        queueSize: 100,            // rozmiar kolejki zadań
        workerThreads: 4,          // liczba wątków roboczych
        memoryLimit: '1g'          // limit pamięci
    },

    // Konfiguracja monitoringu
    monitoring: {
        enabled: false,
        metricsInterval: 5000,     // interwał zbierania metryk (ms)
        healthCheckInterval: 30000, // interwał health check (ms)
        alertThresholds: {
            cpuUsage: 80,          // % CPU
            memoryUsage: 80,       // % pamięci
            errorRate: 10          // % błędów
        }
    }
};