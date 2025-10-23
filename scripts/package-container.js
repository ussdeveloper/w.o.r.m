/**
 * Package Container Script
 * Finalizuje build z kontenerami i optimalizacjami
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PackageContainer {
    constructor() {
        this.rootDir = path.join(__dirname, '..');
        this.distDir = path.join(this.rootDir, 'dist');
    }

    async package() {
        console.log('📦 Packaging containers with binaries...');

        const binaries = fs.readdirSync(this.distDir)
            .filter(f => f.startsWith('worm'))
            .map(f => path.join(this.distDir, f));

        for (const binary of binaries) {
            await this.packageBinary(binary);
        }

        console.log('✅ Container packaging completed!');
    }

    async packageBinary(binaryPath) {
        const binaryName = path.basename(binaryPath, path.extname(binaryPath));
        console.log(`📦 Packaging ${binaryName}...`);

        // Utwórz katalog dla packaged version
        const packageDir = path.join(this.distDir, `${binaryName}-packaged`);
        if (!fs.existsSync(packageDir)) {
            fs.mkdirSync(packageDir, { recursive: true });
        }

        // Skopiuj binary
        const newBinaryPath = path.join(packageDir, path.basename(binaryPath));
        fs.copyFileSync(binaryPath, newBinaryPath);

        // Dodaj embedded resources info
        const infoFile = path.join(packageDir, 'embedded-info.json');
        const info = {
            name: 'WORM Universal Language Interface',
            version: '1.0.0',
            platform: this.detectPlatform(binaryName),
            embedded: {
                container: true,
                python: true,
                cpp: true,
                go: true
            },
            usage: [
                `${path.basename(binaryPath)} examples`,
                `${path.basename(binaryPath)} interactive`,
                `${path.basename(binaryPath)} container list`
            ]
        };

        fs.writeFileSync(infoFile, JSON.stringify(info, null, 2));

        // Dodaj README
        const readmePath = path.join(packageDir, 'README.txt');
        const readme = `
WORM Universal Language Interface
================================

This is a standalone binary that includes:
- WORM runtime engine
- Embedded container with examples and docs
- Portable Python, C++, and Go execution
- No external dependencies required

Usage:
  ${path.basename(binaryPath)} help           - Show help
  ${path.basename(binaryPath)} examples       - Run examples
  ${path.basename(binaryPath)} interactive    - Start REPL
  ${path.basename(binaryPath)} container list - Show embedded files

For more information visit: https://github.com/worm-lang
        `.trim();

        fs.writeFileSync(readmePath, readme);

        console.log(`✅ ${binaryName} packaged in ${packageDir}`);
    }

    detectPlatform(binaryName) {
        if (binaryName.includes('win')) return 'windows';
        if (binaryName.includes('linux')) return 'linux';
        if (binaryName.includes('macos')) return 'macos';
        return process.platform;
    }
}

// CLI usage
if (require.main === module) {
    const packager = new PackageContainer();
    packager.package().catch(error => {
        console.error('Packaging failed:', error);
        process.exit(1);
    });
}

module.exports = PackageContainer;