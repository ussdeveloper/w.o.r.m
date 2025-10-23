# WORM Binary Compilation & Container System

## Kompilacja do Binarek

WORM może być skompilowany do pojedynczych plików wykonywalnych z wbudowanymi bibliotekami i kontenerami, podobnie jak Go.

## Wymagania

- pkg (Node.js binary compiler)
- Docker (dla kontenerów)
- Target platforms: Windows, Linux, macOS

## Szybka kompilacja

```bash
# Kompiluj dla bieżącej platformy
npm run build

# Kompiluj dla wszystkich platform
npm run build:all

# Kompiluj z kontenerami
npm run build:container
```

## Wynikowe binaries

- `worm.exe` (Windows)
- `worm` (Linux)
- `worm` (macOS)

Każdy binary zawiera:
- Complete WORM runtime
- Wbudowane biblioteki
- Container filesystem
- Embedded Python/C++/Go tools

## Container System

WORM może pakować pliki do wewnętrznego kontenera:

```bash
worm container add mydata.json
worm container add libs/
worm container list
worm container extract mydata.json
```

Dostęp z kodu:
```javascript
const data = WORM.container.read('mydata.json');
WORM.container.write('output.txt', result);
```