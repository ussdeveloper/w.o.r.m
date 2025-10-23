# WORM Binary Distribution System

## Przegląd

WORM może być kompilowany do standalone binary files z embedded kontenerami i bibliotekami, podobnie jak Go. System wspiera:

- **Single Binary Distribution** - jeden plik exe/binary zawiera wszystko
- **Embedded Container** - pliki, biblioteki i konfiguracja w binary
- **Cross-Platform** - Windows, Linux, macOS
- **No Dependencies** - binary działa bez instalacji zewnętrznych zależności

## Quick Start

### 1. Podstawowa kompilacja

```bash
# Kompiluj dla bieżącej platformy
npm run build

# Kompiluj dla wszystkich platform
npm run build:all

# Kompiluj z pełnymi kontenerami
npm run build:container
```

### 2. Użycie binary

```bash
# Po kompilacji
./dist/worm examples
./dist/worm interactive
./dist/worm container list
```

## Architektura Binary

```
worm.exe (single file)
├── Node.js Runtime (embedded)
├── WORM Engine
├── Language Adapters
├── Container System
├── Embedded Container Data
│   ├── examples/
│   ├── docs/ 
│   ├── libs/
│   └── config/
└── Embedded Tools (optional)
    ├── Python Portable
    ├── Go Compiler
    └── C++ Toolchain
```

## Container System

### Dodawanie plików do kontenera

```bash
# Pojedynczy plik
worm container add mydata.json

# Katalog
worm container add libs/ libraries

# Z custom nazwą
worm container add config.json settings.json
```

### Zarządzanie kontenerem

```bash
# Lista plików
worm container list

# Statystyki
worm container stats

# Ekstraktowanie
worm container extract config.json ./output.json

# Czyszczenie
worm container clear
```

### Programowy dostęp

```javascript
const { WORM } = require('./worm');

// Sesja ma dostęp do kontenera
const session = WORM.createSession('main');

// Czytanie z kontenera
const config = await session.container.readJSON('config.json');
const readme = await session.container.readText('README.md');

// Lista plików
const files = await session.container.list();

// Statystyki
const stats = await session.container.stats();
```

## Build Process

### 1. Przygotowanie

```bash
# Zainstaluj build dependencies
npm install pkg archiver yauzl fs-extra

# Przygotuj container
worm container add examples/
worm container add docs/
worm container add core/config.js
```

### 2. Kompilacja

```bash
# Development build
npm run build:current

# Production builds
npm run build:windows    # worm-win.exe
npm run build:linux      # worm-linux  
npm run build:macos      # worm-macos

# All platforms
npm run build:all
```

### 3. Packaging

```bash
# Pełne pakowanie z kontenerami
npm run build:container

# Wynik:
dist/
├── worm-win.exe
├── worm-linux  
├── worm-macos
├── worm-win-packaged/
├── worm-linux-packaged/
└── worm-macos-packaged/
```

## Docker Containers

### Development

```bash
# Build development container
docker-compose build worm-dev

# Run development environment
docker-compose up worm-dev
```

### Production

```bash
# Build production container
docker-compose build worm-prod

# Run production container
docker-compose up worm-prod
```

### Full Stack

```bash
# Container z Python, Go, C++
docker-compose up worm-full
```

## Embedded Libraries

### Python Portable

Binary może zawierać portable Python:

```javascript
// Automatycznie używa embedded Python
const numpy = session.python.import('numpy');
const result = await numpy.array([1,2,3]).mean();
```

### Go Compiler

Embedded Go compiler dla runtime kompilacji:

```javascript
// Kompilacja i wykonanie Go
const result = await session.go.run(`
    package main
    import "fmt"
    func main() {
        fmt.Print("Hello from embedded Go!")
    }
`);
```

### C++ Toolchain

Embedded C++ compiler:

```javascript
// Kompilacja C++ do biblioteki
const lib = await session.cpp.compile(`
    extern "C" double square(double x) {
        return x * x;
    }
`, 'mathlib');

const result = lib.function('square').call(5.0); // 25.0
```

## Platform-Specific Features

### Windows

- **worm.exe** - single executable
- **Embedded MSVC** - C++ compilation
- **Registry integration** - file associations
- **Windows Service** - background mode

### Linux

- **AppImage support** - portable app format  
- **Embedded GCC** - C++ compilation
- **Systemd integration** - service mode
- **FUSE support** - virtual filesystem

### macOS

- **App Bundle** - native .app format
- **Embedded Clang** - C++ compilation  
- **LaunchAgent** - background service
- **Notarization ready** - security compliance

## Advanced Configuration

### Build Configuration

```javascript
// build.config.js
module.exports = {
    target: 'all',                    // platforms to build
    embedContainer: true,             // include container
    embedPython: true,                // include Python
    embedGo: false,                   // exclude Go
    embedCpp: true,                   // include C++
    optimize: true,                   // compress binary
    compression: 'upx',               // UPX compression
    
    container: {
        include: ['examples/', 'docs/'],
        exclude: ['*.log', '*.tmp'],
        compression: 'gzip'
    },
    
    python: {
        version: '3.11',
        packages: ['numpy', 'pandas'],
        minimal: true
    }
};
```

### Runtime Configuration

```javascript
// Embedded runtime config
const config = {
    embedded: process.env.WORM_EMBEDDED === 'true',
    
    paths: {
        python: process.env.WORM_PYTHON_PATH,
        go: process.env.WORM_GO_PATH,
        cpp: process.env.WORM_CPP_PATH
    },
    
    container: {
        autoLoad: true,
        cacheEnabled: true,
        compressionEnabled: true
    }
};
```

## Distribution

### Release Process

```bash
# 1. Build all platforms
npm run build:all

# 2. Package with containers  
npm run package:container

# 3. Create release archives
npm run package:release

# 4. Generate checksums
npm run checksums

# 5. Upload to GitHub Releases
npm run release:github
```

### Deployment Options

1. **Direct Download**
   - Single binary download
   - No installation required
   - Immediate execution

2. **Package Managers**
   ```bash
   # Chocolatey (Windows)
   choco install worm
   
   # Homebrew (macOS)  
   brew install worm
   
   # APT (Linux)
   apt install worm
   ```

3. **Docker Hub**
   ```bash
   docker run -it worm/universal-lang
   ```

4. **Cloud Deployment**
   - AWS Lambda Layer
   - Google Cloud Functions
   - Azure Functions

## Performance

### Binary Size

- **Minimal**: ~50MB (JS engine + WORM)
- **Standard**: ~100MB (+ Python embedded)
- **Full**: ~200MB (+ Go + C++ + libs)

### Startup Time

- **Cold start**: ~500ms
- **Warm start**: ~100ms  
- **Container load**: ~50ms

### Memory Usage

- **Base runtime**: ~30MB
- **With container**: ~50MB
- **Full execution**: ~100MB

## Security

### Binary Integrity

- **Code signing** - verified binaries
- **Checksums** - SHA256 verification
- **Reproducible builds** - deterministic output

### Sandbox Execution

- **Isolated container** - read-only embedded files
- **Process isolation** - separate language runtimes
- **Resource limits** - memory/CPU constraints

### Network Security

- **TLS verification** - secure downloads
- **Signature verification** - package integrity
- **Audit logging** - execution tracking

## Troubleshooting

### Common Issues

**Binary too large**
```bash
# Use minimal build
npm run build:minimal

# Or exclude languages
npm run build -- --no-python --no-go
```

**Missing dependencies**
```bash
# Check embedded status
worm version --verbose

# Extract container manually
worm container extract-all ./extracted
```

**Performance issues**
```bash
# Enable debug mode
WORM_DEBUG=true worm interactive

# Check resource usage
worm stats --verbose
```

### Debug Mode

```bash
# Enable full debugging
export WORM_DEBUG=true
export WORM_TRACE=true

# Run with debugging
worm examples --debug
```

---

**WORM - One Binary, All Languages! 📦🚀**