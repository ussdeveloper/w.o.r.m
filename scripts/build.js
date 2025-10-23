/**
 * WORM Build System
 * Kompiluje WORM do standalone binary z embedded kontenerami
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const archiver = require('archiver');

class WormBuilder {
    constructor() {
        this.rootDir = path.join(__dirname, '..');
        this.distDir = path.join(this.rootDir, 'dist');
        this.containerDir = path.join(this.rootDir, 'container');
        this.tempDir = path.join(this.rootDir, 'temp-build');
    }

    /**
     * Główna funkcja build
     */
    async build(options = {}) {
        const {
            target = 'current',
            withContainer = true,
            withLibraries = true,
            optimize = true
        } = options;

        console.log('🔨 Starting WORM build process...');
        
        try {
            // 1. Przygotuj środowisko
            await this.prepareBuildEnvironment();
            
            // 2. Przygotuj kontener
            if (withContainer) {
                await this.prepareContainer();
            }
            
            // 3. Przygotuj biblioteki
            if (withLibraries) {
                await this.prepareLibraries();
            }
            
            // 4. Modyfikuj kod dla binary
            await this.prepareBinaryCode();
            
            // 5. Kompiluj
            await this.compile(target);
            
            // 6. Post-processing
            if (optimize) {
                await this.optimize();
            }
            
            // 7. Czyść
            await this.cleanup();
            
            console.log('✅ Build completed successfully!');
            
        } catch (error) {
            console.error('❌ Build failed:', error.message);
            throw error;
        }
    }

    /**
     * Przygotowuje środowisko build
     */
    async prepareBuildEnvironment() {
        console.log('📁 Preparing build environment...');
        
        // Utwórz katalogi
        [this.distDir, this.tempDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });

        // Skopiuj źródła do temp
        this.copyDirectory(this.rootDir, this.tempDir, [
            'node_modules',
            'dist',
            'temp-build',
            '.git',
            '*.log'
        ]);
    }

    /**
     * Przygotowuje kontener z zasobami
     */
    async prepareContainer() {
        console.log('📦 Preparing embedded container...');
        
        const containerPath = path.join(this.tempDir, 'container.worm');
        
        // Utwórz archiwum kontenera
        await this.createContainerArchive(containerPath);
        
        // Wczytaj kontener jako base64
        const containerData = fs.readFileSync(containerPath);
        const containerBase64 = containerData.toString('base64');
        
        // Wstrzyknij do kodu
        const wormPath = path.join(this.tempDir, 'worm.js');
        let wormCode = fs.readFileSync(wormPath, 'utf8');
        
        // Dodaj embedded container data
        const embeddedCode = `
// Embedded container data (auto-generated)
global.__WORM_EMBEDDED_CONTAINER__ = '${containerBase64}';
`;
        
        wormCode = embeddedCode + wormCode;
        fs.writeFileSync(wormPath, wormCode);
        
        console.log(`📦 Container embedded (${this.formatBytes(containerData.length)})`);
    }

    /**
     * Tworzy archiwum kontenera
     */
    async createContainerArchive(outputPath) {
        return new Promise((resolve, reject) => {
            const output = fs.createWriteStream(outputPath);
            const archive = archiver('zip', { zlib: { level: 9 } });

            output.on('close', resolve);
            archive.on('error', reject);
            archive.pipe(output);

            // Dodaj przykładowe zasoby
            const resourcesToEmbed = [
                'examples/',
                'docs/',
                'core/config.js'
            ];

            resourcesToEmbed.forEach(resource => {
                const fullPath = path.join(this.rootDir, resource);
                if (fs.existsSync(fullPath)) {
                    if (fs.statSync(fullPath).isDirectory()) {
                        archive.directory(fullPath, resource);
                    } else {
                        archive.file(fullPath, { name: resource });
                    }
                }
            });

            archive.finalize();
        });
    }

    /**
     * Przygotowuje biblioteki do embedowania
     */
    async prepareLibraries() {
        console.log('📚 Preparing embedded libraries...');
        
        // Przygotuj portable Python
        await this.preparePythonPortable();
        
        // Przygotuj Go tools
        await this.prepareGoTools();
        
        // Przygotuj C++ tools
        await this.prepareCppTools();
    }

    /**
     * Przygotowuje portable Python
     */
    async preparePythonPortable() {
        const pythonDir = path.join(this.tempDir, 'embedded', 'python');
        
        if (!fs.existsSync(pythonDir)) {
            fs.mkdirSync(pythonDir, { recursive: true });
        }

        // Informacyjny plik o Python
        const pythonInfo = {
            version: '3.11',
            embedded: true,
            packages: ['numpy', 'pandas', 'scikit-learn'],
            note: 'Portable Python would be embedded here in production'
        };

        fs.writeFileSync(
            path.join(pythonDir, 'python-info.json'),
            JSON.stringify(pythonInfo, null, 2)
        );
    }

    /**
     * Przygotowuje Go tools
     */
    async prepareGoTools() {
        const goDir = path.join(this.tempDir, 'embedded', 'go');
        
        if (!fs.existsSync(goDir)) {
            fs.mkdirSync(goDir, { recursive: true });
        }

        // Informacyjny plik o Go
        const goInfo = {
            version: '1.21',
            embedded: true,
            note: 'Portable Go compiler would be embedded here in production'
        };

        fs.writeFileSync(
            path.join(goDir, 'go-info.json'),
            JSON.stringify(goInfo, null, 2)
        );
    }

    /**
     * Przygotowuje C++ tools
     */
    async prepareCppTools() {
        const cppDir = path.join(this.tempDir, 'embedded', 'cpp');
        
        if (!fs.existsSync(cppDir)) {
            fs.mkdirSync(cppDir, { recursive: true });
        }

        // Informacyjny plik o C++
        const cppInfo = {
            compiler: 'embedded-gcc',
            version: '11.0',
            embedded: true,
            note: 'Portable C++ compiler would be embedded here in production'
        };

        fs.writeFileSync(
            path.join(cppDir, 'cpp-info.json'),
            JSON.stringify(cppInfo, null, 2)
        );
    }

    /**
     * Modyfikuje kod dla binary execution
     */
    async prepareBinaryCode() {
        console.log('🔧 Preparing code for binary execution...');
        
        // Modyfikuj main entry point
        const wormPath = path.join(this.tempDir, 'worm.js');
        let wormCode = fs.readFileSync(wormPath, 'utf8');
        
        // Dodaj binary detection i embedded paths
        const binaryCode = `
// Binary execution detection and setup
const isBinary = process.pkg !== undefined;

if (isBinary) {
    // Override paths for binary execution
    const originalRequire = require;
    global.require = function(id) {
        if (id.startsWith('./') || id.startsWith('../')) {
            // Convert relative paths to absolute for binary
            const path = require('path');
            id = path.join(__dirname, id);
        }
        return originalRequire(id);
    };
    
    // Set embedded resource paths
    process.env.WORM_EMBEDDED = 'true';
    process.env.WORM_PYTHON_PATH = path.join(process.execPath, '../embedded/python');
    process.env.WORM_GO_PATH = path.join(process.execPath, '../embedded/go');
    process.env.WORM_CPP_PATH = path.join(process.execPath, '../embedded/cpp');
}
`;
        
        wormCode = binaryCode + wormCode;
        fs.writeFileSync(wormPath, wormCode);
    }

    /**
     * Kompiluje do binary
     */
    async compile(target) {
        console.log(`🔨 Compiling for ${target}...`);
        
        const pkgConfig = {
            current: '--output dist/worm',
            windows: '--target node18-win-x64 --output dist/worm-win.exe',
            linux: '--target node18-linux-x64 --output dist/worm-linux',
            macos: '--target node18-macos-x64 --output dist/worm-macos',
            all: ''
        };

        if (target === 'all') {
            // Kompiluj dla wszystkich platform
            for (const platform of ['windows', 'linux', 'macos']) {
                const cmd = `pkg ${path.join(this.tempDir, 'worm.js')} ${pkgConfig[platform]}`;
                console.log(`Compiling for ${platform}...`);
                execSync(cmd, { cwd: this.rootDir, stdio: 'inherit' });
            }
        } else {
            const cmd = `pkg ${path.join(this.tempDir, 'worm.js')} ${pkgConfig[target]}`;
            execSync(cmd, { cwd: this.rootDir, stdio: 'inherit' });
        }
    }

    /**
     * Optymalizuje wynikowe binaries
     */
    async optimize() {
        console.log('⚡ Optimizing binaries...');
        
        const binaries = fs.readdirSync(this.distDir)
            .filter(f => f.startsWith('worm'))
            .map(f => path.join(this.distDir, f));

        for (const binary of binaries) {
            const stats = fs.statSync(binary);
            console.log(`📊 ${path.basename(binary)}: ${this.formatBytes(stats.size)}`);
            
            // Tutaj można dodać kompresję UPX lub inne optymalizacje
            // execSync(`upx --best "${binary}"`, { stdio: 'inherit' });
        }
    }

    /**
     * Czyści pliki tymczasowe
     */
    async cleanup() {
        console.log('🧹 Cleaning up...');
        
        if (fs.existsSync(this.tempDir)) {
            this.removeDirectory(this.tempDir);
        }
    }

    /**
     * Kopiuje katalog z filtrowaniem
     */
    copyDirectory(src, dest, exclude = []) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }

        const items = fs.readdirSync(src);
        
        for (const item of items) {
            const srcPath = path.join(src, item);
            const destPath = path.join(dest, item);
            
            // Sprawdź wykluczenia
            if (exclude.some(pattern => {
                if (pattern.includes('*')) {
                    return item.match(pattern.replace('*', '.*'));
                }
                return item === pattern;
            })) {
                continue;
            }
            
            if (fs.statSync(srcPath).isDirectory()) {
                this.copyDirectory(srcPath, destPath, exclude);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }

    /**
     * Usuwa katalog rekurencyjnie
     */
    removeDirectory(dir) {
        if (fs.existsSync(dir)) {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    }

    /**
     * Formatuje bajty
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// CLI usage
if (require.main === module) {
    const builder = new WormBuilder();
    const target = process.argv[2] || 'current';
    const withContainer = !process.argv.includes('--no-container');
    const withLibraries = !process.argv.includes('--no-libraries');
    const optimize = !process.argv.includes('--no-optimize');

    builder.build({ target, withContainer, withLibraries, optimize })
        .catch(error => {
            console.error('Build failed:', error);
            process.exit(1);
        });
}

module.exports = WormBuilder;