/**
 * WORM Simple Container System  
 * Lightweight embedded filesystem without external dependencies
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

class WormSimpleContainer {
    constructor(containerPath = null) {
        this.containerPath = containerPath || this.getDefaultContainerPath();
        this.memoryFs = new Map(); // In-memory filesystem
        this.isLoaded = false;
        this.isEmbedded = this.checkIfEmbedded();
    }

    /**
     * Sprawdza czy aplikacja działa jako binary
     */
    checkIfEmbedded() {
        return process.pkg !== undefined;
    }

    /**
     * Pobiera domyślną ścieżkę kontenera
     */
    getDefaultContainerPath() {
        if (this.isEmbedded) {
            return path.join(process.execPath, '../container.worm');
        } else {
            return path.join(__dirname, '../../container/container.worm');
        }
    }

    /**
     * Ładuje kontener do pamięci
     */
    async load() {
        if (this.isLoaded) return;

        try {
            if (this.isEmbedded) {
                await this.loadEmbeddedContainer();
            } else {
                await this.loadContainerFile();
            }
            this.isLoaded = true;
        } catch (error) {
            console.warn('Container not found, creating empty container');
            this.isLoaded = true;
        }
    }

    /**
     * Ładuje kontener z wbudowanego zasobu
     */
    async loadEmbeddedContainer() {
        const embeddedData = this.getEmbeddedContainerData();
        if (embeddedData) {
            await this.parseContainerData(embeddedData);
        }
    }

    /**
     * Ładuje kontener z pliku
     */
    async loadContainerFile() {
        if (fs.existsSync(this.containerPath)) {
            const data = fs.readFileSync(this.containerPath);
            await this.parseContainerData(data);
        }
    }

    /**
     * Parsuje dane kontenera (simple format)
     */
    async parseContainerData(data) {
        try {
            // Dekompresja
            const decompressed = zlib.gunzipSync(data);
            const container = JSON.parse(decompressed.toString());
            
            // Załaduj pliki do pamięci
            for (const [filePath, encodedContent] of Object.entries(container.files || {})) {
                const content = Buffer.from(encodedContent, 'base64');
                this.memoryFs.set(filePath, content);
            }
        } catch (error) {
            console.warn('Error parsing container data:', error.message);
        }
    }

    /**
     * Pobiera embedded container data
     */
    getEmbeddedContainerData() {
        if (global.__WORM_EMBEDDED_CONTAINER__) {
            return Buffer.from(global.__WORM_EMBEDDED_CONTAINER__, 'base64');
        }
        return null;
    }

    /**
     * Dodaje plik do kontenera
     */
    async addFile(filePath, targetPath = null) {
        await this.load();
        
        const actualPath = targetPath || path.basename(filePath);
        
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath);
            this.memoryFs.set(actualPath, content);
            console.log(`Added ${filePath} as ${actualPath} to container`);
        } else {
            throw new Error(`File not found: ${filePath}`);
        }
    }

    /**
     * Dodaje katalog do kontenera
     */
    async addDirectory(dirPath, targetDir = '') {
        await this.load();

        const addRecursive = (currentPath, currentTarget) => {
            const items = fs.readdirSync(currentPath);
            
            for (const item of items) {
                const itemPath = path.join(currentPath, item);
                const targetPath = path.join(currentTarget, item).replace(/\\/g, '/');
                
                if (fs.statSync(itemPath).isDirectory()) {
                    addRecursive(itemPath, targetPath);
                } else {
                    const content = fs.readFileSync(itemPath);
                    this.memoryFs.set(targetPath, content);
                }
            }
        };

        addRecursive(dirPath, targetDir);
        console.log(`Added directory ${dirPath} to container`);
    }

    /**
     * Czyta plik z kontenera
     */
    async read(filePath) {
        await this.load();
        
        const content = this.memoryFs.get(filePath);
        if (!content) {
            throw new Error(`File not found in container: ${filePath}`);
        }
        return content;
    }

    /**
     * Czyta plik jako tekst
     */
    async readText(filePath, encoding = 'utf8') {
        const buffer = await this.read(filePath);
        return buffer.toString(encoding);
    }

    /**
     * Czyta plik jako JSON
     */
    async readJSON(filePath) {
        const text = await this.readText(filePath);
        return JSON.parse(text);
    }

    /**
     * Zapisuje plik do kontenera
     */
    async write(filePath, content) {
        await this.load();
        
        const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content);
        this.memoryFs.set(filePath, buffer);
    }

    /**
     * Zapisuje tekst do kontenera
     */
    async writeText(filePath, text, encoding = 'utf8') {
        await this.write(filePath, Buffer.from(text, encoding));
    }

    /**
     * Zapisuje JSON do kontenera
     */
    async writeJSON(filePath, obj, indent = 2) {
        const text = JSON.stringify(obj, null, indent);
        await this.writeText(filePath, text);
    }

    /**
     * Sprawdza czy plik istnieje w kontenerze
     */
    async exists(filePath) {
        await this.load();
        return this.memoryFs.has(filePath);
    }

    /**
     * Lista plików w kontenerze
     */
    async list(prefix = '') {
        await this.load();
        
        const files = Array.from(this.memoryFs.keys());
        return prefix ? files.filter(f => f.startsWith(prefix)) : files;
    }

    /**
     * Usuwa plik z kontenera
     */
    async remove(filePath) {
        await this.load();
        
        if (this.memoryFs.has(filePath)) {
            this.memoryFs.delete(filePath);
            return true;
        }
        return false;
    }

    /**
     * Ekstraktuje plik z kontenera do systemu plików
     */
    async extract(filePath, outputPath = null) {
        const content = await this.read(filePath);
        const targetPath = outputPath || filePath;
        
        const dir = path.dirname(targetPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(targetPath, content);
        console.log(`Extracted ${filePath} to ${targetPath}`);
    }

    /**
     * Ekstraktuje wszystkie pliki z kontenera
     */
    async extractAll(outputDir = './extracted') {
        await this.load();
        
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        for (const [filePath, content] of this.memoryFs) {
            const targetPath = path.join(outputDir, filePath);
            const dir = path.dirname(targetPath);
            
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            fs.writeFileSync(targetPath, content);
        }
        
        console.log(`Extracted all files to ${outputDir}`);
    }

    /**
     * Zapisuje kontener do pliku (simple format)
     */
    async save(outputPath = null) {
        await this.load();
        
        const targetPath = outputPath || this.containerPath;
        const dir = path.dirname(targetPath);
        
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Stwórz container object
        const container = {
            version: '1.0',
            created: new Date().toISOString(),
            files: {}
        };

        // Dodaj wszystkie pliki jako base64
        for (const [filePath, content] of this.memoryFs) {
            container.files[filePath] = content.toString('base64');
        }

        // Kompresuj i zapisz
        const json = JSON.stringify(container);
        const compressed = zlib.gzipSync(Buffer.from(json));
        
        fs.writeFileSync(targetPath, compressed);
        
        console.log(`Container saved to ${targetPath} (${this.formatBytes(compressed.length)})`);
    }

    /**
     * Zwraca statystyki kontenera
     */
    async stats() {
        await this.load();
        
        let totalSize = 0;
        const fileCount = this.memoryFs.size;
        
        for (const [, content] of this.memoryFs) {
            totalSize += content.length;
        }

        return {
            fileCount,
            totalSize,
            totalSizeFormatted: this.formatBytes(totalSize),
            isEmbedded: this.isEmbedded
        };
    }

    /**
     * Formatuje bajty do czytelnej formy
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Czyści kontener
     */
    async clear() {
        this.memoryFs.clear();
    }
}

module.exports = WormSimpleContainer;