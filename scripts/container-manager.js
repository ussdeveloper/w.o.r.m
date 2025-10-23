/**
 * WORM Container Manager CLI
 * Narzędzie do zarządzania kontenerami
 */

// Użyj simple container jeśli nie ma archiver
let WormContainer;
try {
    WormContainer = require('../core/container/container');
} catch (error) {
    WormContainer = require('../core/container/simple-container');
}

const fs = require('fs');
const path = require('path');

class ContainerManager {
    constructor() {
        this.container = new WormContainer();
    }

    /**
     * Dodaje plik lub katalog do kontenera
     */
    async add(sourcePath, targetPath = null) {
        try {
            const fullPath = path.resolve(sourcePath);
            
            if (!fs.existsSync(fullPath)) {
                throw new Error(`Path not found: ${sourcePath}`);
            }

            if (fs.statSync(fullPath).isDirectory()) {
                await this.container.addDirectory(fullPath, targetPath || path.basename(fullPath));
            } else {
                await this.container.addFile(fullPath, targetPath);
            }

            await this.container.save();
            console.log('✅ Added to container successfully');
            
        } catch (error) {
            console.error('❌ Error adding to container:', error.message);
            process.exit(1);
        }
    }

    /**
     * Lista plików w kontenerze
     */
    async list(prefix = '') {
        try {
            const files = await this.container.list(prefix);
            const stats = await this.container.stats();
            
            console.log(`📦 Container contents (${stats.fileCount} files, ${stats.totalSizeFormatted}):`);
            console.log('');
            
            if (files.length === 0) {
                console.log('   (empty)');
            } else {
                for (const file of files.sort()) {
                    const content = await this.container.read(file);
                    const size = this.formatBytes(content.length);
                    console.log(`   ${file} (${size})`);
                }
            }
            
        } catch (error) {
            console.error('❌ Error listing container:', error.message);
            process.exit(1);
        }
    }

    /**
     * Ekstraktuje plik z kontenera
     */
    async extract(filePath, outputPath = null) {
        try {
            await this.container.extract(filePath, outputPath);
            console.log('✅ Extracted successfully');
            
        } catch (error) {
            console.error('❌ Error extracting:', error.message);
            process.exit(1);
        }
    }

    /**
     * Ekstraktuje wszystkie pliki
     */
    async extractAll(outputDir = './extracted') {
        try {
            await this.container.extractAll(outputDir);
            console.log('✅ All files extracted successfully');
            
        } catch (error) {
            console.error('❌ Error extracting all:', error.message);
            process.exit(1);
        }
    }

    /**
     * Usuwa plik z kontenera
     */
    async remove(filePath) {
        try {
            const removed = await this.container.remove(filePath);
            
            if (removed) {
                await this.container.save();
                console.log('✅ Removed from container successfully');
            } else {
                console.log('⚠️  File not found in container');
            }
            
        } catch (error) {
            console.error('❌ Error removing from container:', error.message);
            process.exit(1);
        }
    }

    /**
     * Sprawdza czy plik istnieje
     */
    async exists(filePath) {
        try {
            const exists = await this.container.exists(filePath);
            console.log(`File ${filePath}: ${exists ? 'EXISTS' : 'NOT FOUND'}`);
            
        } catch (error) {
            console.error('❌ Error checking file:', error.message);
            process.exit(1);
        }
    }

    /**
     * Wyświetla zawartość pliku
     */
    async cat(filePath) {
        try {
            const content = await this.container.readText(filePath);
            console.log(content);
            
        } catch (error) {
            console.error('❌ Error reading file:', error.message);
            process.exit(1);
        }
    }

    /**
     * Wyświetla statystyki kontenera
     */
    async stats() {
        try {
            const stats = await this.container.stats();
            
            console.log('📊 Container Statistics:');
            console.log(`   Files: ${stats.fileCount}`);
            console.log(`   Total Size: ${stats.totalSizeFormatted}`);
            console.log(`   Embedded: ${stats.isEmbedded ? 'Yes' : 'No'}`);
            
        } catch (error) {
            console.error('❌ Error getting stats:', error.message);
            process.exit(1);
        }
    }

    /**
     * Czyści kontener
     */
    async clear() {
        try {
            await this.container.clear();
            await this.container.save();
            console.log('✅ Container cleared successfully');
            
        } catch (error) {
            console.error('❌ Error clearing container:', error.message);
            process.exit(1);
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

    /**
     * Wyświetla pomoc
     */
    showHelp() {
        console.log(`
WORM Container Manager

Usage: node container-manager.js <command> [args]

Commands:
  add <path> [target]     Add file or directory to container
  list [prefix]           List files in container
  extract <file> [output] Extract file from container
  extract-all [dir]       Extract all files from container
  remove <file>           Remove file from container
  exists <file>           Check if file exists in container
  cat <file>              Display file contents
  stats                   Show container statistics
  clear                   Clear all files from container
  help                    Show this help

Examples:
  node container-manager.js add mydata.json
  node container-manager.js add libs/ libraries
  node container-manager.js list
  node container-manager.js extract mydata.json ./output.json
  node container-manager.js cat config.json
`);
    }
}

// CLI Interface
async function main() {
    const manager = new ContainerManager();
    const command = process.argv[2];
    const args = process.argv.slice(3);

    if (!command || command === 'help') {
        manager.showHelp();
        return;
    }

    try {
        switch (command) {
            case 'add':
                if (args.length < 1) {
                    console.error('❌ Usage: add <path> [target]');
                    process.exit(1);
                }
                await manager.add(args[0], args[1]);
                break;

            case 'list':
                await manager.list(args[0]);
                break;

            case 'extract':
                if (args.length < 1) {
                    console.error('❌ Usage: extract <file> [output]');
                    process.exit(1);
                }
                await manager.extract(args[0], args[1]);
                break;

            case 'extract-all':
                await manager.extractAll(args[0]);
                break;

            case 'remove':
                if (args.length < 1) {
                    console.error('❌ Usage: remove <file>');
                    process.exit(1);
                }
                await manager.remove(args[0]);
                break;

            case 'exists':
                if (args.length < 1) {
                    console.error('❌ Usage: exists <file>');
                    process.exit(1);
                }
                await manager.exists(args[0]);
                break;

            case 'cat':
                if (args.length < 1) {
                    console.error('❌ Usage: cat <file>');
                    process.exit(1);
                }
                await manager.cat(args[0]);
                break;

            case 'stats':
                await manager.stats();
                break;

            case 'clear':
                await manager.clear();
                break;

            default:
                console.error(`❌ Unknown command: ${command}`);
                manager.showHelp();
                process.exit(1);
        }
    } catch (error) {
        console.error('❌ Fatal error:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = ContainerManager;