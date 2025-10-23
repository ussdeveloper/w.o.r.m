# WORM License Plate Recognition System

## 🚗 Opis

System rozpoznawania tablic rejestracyjnych wykorzystujący **WORM Universal Language** - demonstracja możliwości łączenia wielu języków programowania w jednym projekcie:

- **JavaScript** - główna logika i interfejs
- **Python** - OpenCV do przechwytywania obrazu i wykrywania obiektów  
- **C++** - szybkie przetwarzanie obrazu i optymalizacje
- **Go** - równoległe przetwarzanie OCR

## 🎯 Funkcjonalności

- ✅ Przechwytywanie obrazu z kamery USB w czasie rzeczywistym
- ✅ Wykrywanie regionów tablic rejestracyjnych (Computer Vision)
- ✅ OCR (Optical Character Recognition) z pomocą Tesseract
- ✅ Walidacja polskich formatów tablic rejestracyjnych
- ✅ Równoległe przetwarzanie z wykorzystaniem Go
- ✅ Optymalizacje obrazu w C++ dla lepszej wydajności
- ✅ Statystyki przetwarzania w czasie rzeczywistym
- ✅ Intuicyjna składnia kropkowa WORM

## 🛠️ Wymagania Systemowe

### Podstawowe
- **Node.js** 14+ 
- **Python** 3.7+
- **WORM Universal Language** (główny projekt)

### Opcjonalne (dla pełnej funkcjonalności)
- **Tesseract OCR** - rozpoznawanie tekstu
- **OpenCV** - przetwarzanie obrazu
- **C++ Compiler** - optymalizacje wydajności  
- **Go** - równoległe przetwarzanie
- **Kamera USB/Webcam** - źródło obrazu

## 📦 Instalacja

### 1. Przygotowanie środowiska WORM
```bash
cd c:\Users\sulaco\Desktop\W.O.R.M
npm install
```

### 2. Instalacja zależności przykładu
```bash
cd examples\license-plate-recognition
npm install
```

### 3. Konfiguracja Python (opcjonalne)
```bash
# Instalacja pakietów Python
pip install opencv-python numpy pytesseract pillow

# Sprawdzenie instalacji OpenCV
python -c "import cv2; print('OpenCV version:', cv2.__version__)"
```

### 4. Instalacja Tesseract OCR (opcjonalne)

#### Windows:
1. Pobierz z: https://github.com/UB-Mannheim/tesseract/wiki
2. Zainstaluj w standardowej lokalizacji: `C:\Program Files\Tesseract-OCR\`
3. Dodaj do PATH lub skonfiguruj ścieżkę w kodzie

#### Linux:
```bash
sudo apt-get install tesseract-ocr tesseract-ocr-pol
```

#### macOS:
```bash
brew install tesseract tesseract-lang
```

## 🚀 Uruchomienie

### Tryb podstawowy (symulacja)
```bash
cd examples\license-plate-recognition
node license-plate-recognizer.js
```

### Z pełną funkcjonalnością
```bash
# Sprawdź dostępność kamer
python -c "import cv2; [print(f'Camera {i}: Available') for i in range(3) if cv2.VideoCapture(i).isOpened()]"

# Uruchom system
npm start
```

## 📝 Przykład użycia WORM API

```javascript
const { WORM } = require('../../core/worm');

// Utworzenie sesji WORM
const session = WORM.createSession('license_plate_demo');

// Python - przechwytywanie z kamery
const frame = await session.python.execute(`
    import cv2
    cap = cv2.VideoCapture(0)
    ret, frame = cap.read()
    print(f"Captured: {frame.shape}")
`);

// C++ - szybkie przetwarzanie
const enhanced = session.cpp.library('image_processor', {
    'enhance_contrast': ['void', ['pointer', 'int', 'int']]
});

// Go - równoległe OCR
const ocrResult = await session.go.run(`
    package main
    import "fmt"
    
    func main() {
        // Concurrent OCR processing
        fmt.Println("Processing multiple regions...")
    }
`);

// JavaScript - logika biznesowa
const validPlates = session.js.array(detectedPlates)
    .filter(plate => plate.confidence > 0.8)
    .map(plate => ({ ...plate, country: 'PL' }));
```

## 🏗️ Architektura Systemu

```
┌─────────────────────────────────────────────────────────────┐
│                    WORM Session Manager                     │
├─────────────────────────────────────────────────────────────┤
│  JavaScript Controller (license-plate-recognizer.js)       │
├─────────────────┬─────────────────┬─────────────────────────┤
│   Python CV     │   C++ Image     │   Go Concurrent         │
│   - OpenCV      │   - Fast math   │   - Worker pools        │
│   - Tesseract   │   - Filtering   │   - Channel comm        │
│   - NumPy       │   - Enhancement │   - Load balancing      │
└─────────────────┴─────────────────┴─────────────────────────┘
                           │
                    ┌─────────────┐
                    │ USB Camera  │
                    │   Input     │
                    └─────────────┘
```

## 🎛️ Konfiguracja

### Ustawienia rozpoznawania
```javascript
const recognizer = new LicensePlateRecognizer();

// Próg pewności OCR (0.0 - 1.0)
recognizer.confidenceThreshold = 0.7;

// Formaty tablic do rozpoznawania
recognizer.supportedFormats = ['PL', 'EU'];

// Concurrent workers
recognizer.workerCount = 4;
```

### Obsługiwane formaty tablic

#### Polskie tablice:
- `WA 1234A` - stary format
- `WA 12345` - nowy format  
- `WAR 1234` - niektóre regiony

#### Rozszerzenia (planowane):
- Tablice europejskie
- Tablice amerykańskie
- Custom formaty

## 📊 Przykładowy Output

```
🚗 WORM License Plate Recognition System
========================================

📷 Checking camera availability...
Camera 0: Available (640x480)
🐍 Initializing Python OpenCV and OCR...
OpenCV and OCR initialized
⚡ Initializing C++ image processing...
C++ image processing (simulated): Fast contrast enhancement, blur, rectangle detection
🚀 Initializing Go concurrent processor...
Go processor (simulated): 4 concurrent workers initialized
✅ System initialized successfully!

🎬 Starting real-time license plate recognition...

🎯 Detected: WA 5678B (confidence: 0.93)
🎯 Detected: KR 12345 (confidence: 0.87)
📊 Frame 10/50 - Processing time: 45ms

🎯 Detected: PO 9876A (confidence: 0.91)
📊 Frame 20/50 - Processing time: 38ms

📊 License Plate Recognition Results:
=====================================
Frames processed: 50
Plates detected: 15
Average processing time: 42.3ms
Detection rate: 30.0%

🎯 Detected License Plates:
---------------------------
WA 5678B - Confidence: 0.930 (3 detections)
KR 12345 - Confidence: 0.870 (2 detections)
PO 9876A - Confidence: 0.910 (4 detections)
GD 4321C - Confidence: 0.850 (1 detections)

🏁 Recognition session completed
```

## 🔧 Rozwiązywanie problemów

### Brak kamery
```
❌ ERROR: No cameras available
```
**Rozwiązanie:** Sprawdź połączenie USB, sterowniki kamery, uprawnienia dostępu

### Błąd OpenCV
```
ModuleNotFoundError: No module named 'cv2'
```
**Rozwiązanie:** `pip install opencv-python`

### Błąd Tesseract
```
TesseractNotFoundError
```
**Rozwiązanie:** Zainstaluj Tesseract OCR i skonfiguruj ścieżkę

### Błędy C++/Go
System działa w trybie symulacji gdy nie są dostępne zewnętrzne zależności.

## 🚀 Rozszerzenia

### Planowane funkcjonalności:
- [ ] Web interface (React + WebSocket)
- [ ] Database logging (PostgreSQL)
- [ ] Mobile app (React Native)
- [ ] Cloud deployment (Docker)
- [ ] Machine Learning models (TensorFlow)
- [ ] Real-time alerts
- [ ] Batch processing
- [ ] Video file input

### Integracje:
- [ ] REST API
- [ ] MQTT messaging  
- [ ] Elasticsearch logging
- [ ] Grafana dashboards
- [ ] Slack notifications

## 📚 Dokumentacja WORM

Więcej informacji o WORM Universal Language:
- [Główna dokumentacja](../../README.md)
- [Przykłady użycia](../../examples/)
- [API Reference](../../docs/api.md)
- [Build system](../../docs/build.md)

## 🤝 Wkład w rozwój

1. Fork projektu
2. Utwórz feature branch
3. Wprowadź zmiany
4. Dodaj testy
5. Wyślij Pull Request

## 📄 Licencja

MIT License - szczegóły w pliku [LICENSE](../../LICENSE)

---

**WORM Universal Language** - One interface to rule them all! 🌟