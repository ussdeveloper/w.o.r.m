# WORM Installation Guide

## Wymagania Systemowe

### Podstawowe
- Node.js 14+ 
- npm 6+

### Opcjonalne (dla pełnej funkcjonalności)
- Python 3.7+ (dla Python API)
- Go 1.16+ (dla Go API)
- C/C++ compiler (dla C++ API)
  - Windows: Visual Studio Build Tools lub MinGW
  - Linux: gcc/g++
  - macOS: Xcode Command Line Tools

## Instalacja

### 1. Klonowanie/Pobranie
```bash
# Jeśli używasz git
git clone <repository-url> WORM
cd WORM

# Lub po prostu wypakuj pliki do katalogu WORM
```

### 2. Instalacja zależności Node.js
```bash
npm install
```

### 3. Instalacja opcjonalnych zależności

#### Python (dla Python API)
```bash
# Zainstaluj python-shell
npm install python-shell

# Zainstaluj Python packages
pip install numpy pandas scikit-learn
```

#### C++ (dla C++ API)  
```bash
# Zainstaluj FFI
npm install ffi-napi

# Windows - zainstaluj Visual Studio Build Tools
# Linux - zainstaluj build-essential
sudo apt-get install build-essential

# macOS - zainstaluj Xcode Command Line Tools
xcode-select --install
```

#### Go (dla Go API)
```bash
# Pobierz i zainstaluj Go z https://golang.org/dl/
# Lub użyj package managera:

# Windows (Chocolatey)
choco install golang

# Linux (Ubuntu)
sudo apt-get install golang-go

# macOS (Homebrew)
brew install go
```

## Weryfikacja Instalacji

### Podstawowy test
```bash
node worm.js version
node worm.js examples
```

### Test wszystkich komponentów
```bash
node worm.js test
```

### Test interaktywny
```bash
node worm.js interactive
```

W trybie interaktywnym wypróbuj:
```
js.array([1,2,3,4,5]).sum()
js.math.sqrt(16)
cpp.math.pow(2, 8)
```

## Rozwiązywanie Problemów

### Błąd: "python-shell not found"
```bash
npm install python-shell
```

### Błąd: "Python not found"
```bash
# Windows
set PATH=%PATH%;C:\Python39

# Linux/macOS
export PATH=$PATH:/usr/bin/python3
```

### Błąd: "ffi-napi compilation failed"
```bash
# Windows - zainstaluj Visual Studio Build Tools
# Lub użyj precompiled binary
npm install --global windows-build-tools

# Linux
sudo apt-get install build-essential python3-dev

# macOS
xcode-select --install
```

### Błąd: "Go not found"
```bash
# Sprawdź instalację Go
go version

# Dodaj Go do PATH
export PATH=$PATH:/usr/local/go/bin
```

### Problemy z uprawnieniami (Linux/macOS)
```bash
# Jeśli potrzebujesz sudo dla npm
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

## Konfiguracja

### Domyślna konfiguracja
Plik `core/config.js` zawiera wszystkie ustawienia.

### Własna konfiguracja
Utwórz plik `config.local.js`:
```javascript
module.exports = {
    adapters: {
        python: {
            executable: '/usr/bin/python3',
            virtualenv: '/path/to/venv'
        },
        cpp: {
            compiler: {
                linux: 'clang++'
            }
        },
        go: {
            executable: '/usr/local/go/bin/go'
        }
    }
};
```

## Testowanie Komponentów

### Test JavaScript API
```bash
node -e "
const {WORM} = require('./core/worm');
const session = WORM.createSession('test');
console.log('JS API:', session.js.array([1,2,3]).sum());
WORM.shutdown();
"
```

### Test Python API (jeśli zainstalowany)
```bash
node -e "
const {WORM} = require('./core/worm');
const session = WORM.createSession('test');
session.python.execute('print(\"Python API works!\")').then(console.log).catch(console.error).finally(() => WORM.shutdown());
"
```

### Test C++ API
```bash
node -e "
const {WORM} = require('./core/worm');
const session = WORM.createSession('test');
console.log('C++ API:', session.cpp.math.sqrt(25));
WORM.shutdown();
"
```

### Test Go API (jeśli zainstalowany)
```bash
node -e "
const {WORM} = require('./core/worm');
const session = WORM.createSession('test');
session.go.adapter.checkGoInstallation().then(installed => {
    console.log('Go API available:', installed);
    WORM.shutdown();
});
"
```

## Użycie w Projekcie

### Import w Node.js
```javascript
const { WORM } = require('./path/to/worm/core/worm');

const session = WORM.createSession('myapp');

// Użyj API
const result = session.js.array([1,2,3,4,5]).mean();

// Zamknij sesję
WORM.closeSession('myapp');
```

### Global install (opcjonalne)
```bash
npm link

# Teraz możesz używać z dowolnego miejsca
worm examples
worm interactive
```

## Performance Tips

1. **Reużywaj sesji** - zamiast tworzyć nowe sesje, używaj istniejących
2. **Zamykaj sesje** - pamiętaj o zamykaniu nieużywanych sesji
3. **Cache kompilacji** - C++ i Go kompilacje są cachowane
4. **Batch operations** - grupuj operacje Python/Go dla lepszej wydajności

## Przykład Pełnej Instalacji (Ubuntu)

```bash
# 1. Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Python
sudo apt-get install python3 python3-pip
pip3 install numpy pandas scikit-learn

# 3. C++ tools
sudo apt-get install build-essential

# 4. Go
wget https://golang.org/dl/go1.19.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.19.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc

# 5. WORM
cd WORM
npm install
npm install python-shell ffi-napi

# 6. Test
node worm.js examples
```