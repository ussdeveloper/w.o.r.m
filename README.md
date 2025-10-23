# W.O.R.M - Universal Language Interface

**W**orld **O**f **R**esource **M**anagement - Uniwersalny język programowania oparty na JavaScript z jednolitym API do bibliotek C/C++, Go, Python.

## Koncepcja

Główny obiekt `WORM` zapewnia dostęp do wszystkich funkcjonalności poprzez fluent API:

```javascript
WORM.python.import('numpy').array([1,2,3]).mean()
WORM.cpp.library('math').function('sqrt').call(16)
WORM.go.module('strings').function('ToUpper').call('hello')
WORM.js.function(x => x * 2).call(5)
```

## Architektura

- **Core Engine** (JavaScript/Node.js)
- **Bridge Adapters** dla każdego języka
- **Universal API** - jednolity interfejs
- **Runtime Manager** - zarządzanie procesami

## Struktura

```
/core/          - Silnik główny
/adapters/      - Adaptery do języków
/api/           - Definicje API
/examples/      - Przykłady użycia
/docs/          - Dokumentacja
```