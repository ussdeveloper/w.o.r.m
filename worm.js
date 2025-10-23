#!/usr/bin/env node

/**
 * WORM - Universal Language Interface
 * Punkt startowy aplikacji
 */

const { WORM } = require('./core/worm');
const config = require('./core/config');
const { runExamples } = require('./examples/basic-usage');
const { machineLearningPipeline, textProcessingPipeline } = require('./examples/advanced-pipeline');

// Aplikuj konfigurację
Object.assign(WORM.config, config.global);

// CLI Interface
function showHelp() {
    console.log(`
WORM - Universal Language Interface

Usage: node worm.js [command] [options]

Commands:
  help              Show this help message
  examples          Run basic examples
  ml-pipeline       Run machine learning pipeline example
  text-pipeline     Run text processing pipeline example
  interactive       Start interactive REPL mode
  test              Run unit tests
  version           Show version
  container         Container management commands
  build             Build binary (development)

Options:
  --debug           Enable debug mode
  --timeout <ms>    Set operation timeout
  --session <name>  Set session name (default: 'main')

Examples:
  node worm.js examples
  node worm.js ml-pipeline --debug
  node worm.js interactive --session mywork
  node worm.js container add mydata.json
  node worm.js container list
  node worm.js build current
`);
}

function showVersion() {
    const pkg = require('./package.json');
    console.log(`WORM v${pkg.version}`);
}

async function runInteractive(sessionName = 'main') {
    console.log('=== WORM Interactive Mode ===');
    console.log('Type "help" for commands, "exit" to quit\n');
    
    const session = WORM.createSession(sessionName);
    const readline = require('readline');
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: 'WORM> '
    });

    rl.prompt();

    rl.on('line', async (line) => {
        const input = line.trim();
        
        if (input === 'exit') {
            rl.close();
            return;
        }
        
        if (input === 'help') {
            console.log(`
Interactive Commands:
  help                    Show this help
  exit                    Exit interactive mode
  session.set(key, val)   Store value in session
  session.get(key)        Get value from session
  session.history         Show operation history
  container.list()        List container files
  container.read('file')  Read file from container
  container.stats()       Show container statistics
  js.array([1,2,3]).sum() JavaScript array operations
  js.math.sqrt(16)        JavaScript math operations
  cpp.math.sqrt(25)       C++ math operations
  
Examples:
  js.array([1,2,3,4,5]).filter(x => x > 3).sum()
  session.set('data', [10,20,30])
  js.array(session.get('data')).mean()
  container.list()
  container.read('examples/basic-usage.js')
`);
            rl.prompt();
            return;
        }
        
        if (input === '') {
            rl.prompt();
            return;
        }

        try {
            // Podstawowa ewaluacja poleceń
            let result;
            
            if (input.startsWith('session.')) {
                // Operacje sesji
                if (input.includes('.set(')) {
                    const match = input.match(/session\.set\(['"]([^'"]+)['"],\s*(.+)\)/);
                    if (match) {
                        const [, key, value] = match;
                        const evalValue = eval(value);
                        session.set(key, evalValue);
                        result = `Stored: ${key} = ${JSON.stringify(evalValue)}`;
                    }
                } else if (input.includes('.get(')) {
                    const match = input.match(/session\.get\(['"]([^'"]+)['"]\)/);
                    if (match) {
                        const [, key] = match;
                        result = session.get(key);
                    }
                } else if (input === 'session.history') {
                    result = session.history.map(entry => 
                        `${entry.timestamp.toISOString()} - ${entry.operation} -> ${entry.result}`
                    ).join('\n');
                }
            } else if (input.startsWith('container.')) {
                // Container API
                if (input === 'container.list()') {
                    const files = await session.container.list();
                    result = files.length > 0 ? files.join('\n') : '(no files)';
                } else if (input === 'container.stats()') {
                    result = await session.container.stats();
                } else if (input.match(/container\.read\(['"]([^'"]+)['"]\)/)) {
                    const match = input.match(/container\.read\(['"]([^'"]+)['"]\)/);
                    if (match) {
                        try {
                            result = await session.container.readText(match[1]);
                        } catch (error) {
                            result = `Error: ${error.message}`;
                        }
                    }
                }
            } else if (input.startsWith('js.')) {
                // JavaScript API
                result = eval(`session.${input}`);
            } else if (input.startsWith('cpp.')) {
                // C++ API
                result = eval(`session.${input}`);
            } else if (input.startsWith('python.')) {
                // Python API
                result = await eval(`session.${input}`);
            } else if (input.startsWith('go.')) {
                // Go API
                result = await eval(`session.${input}`);
            } else {
                // Direct JavaScript evaluation
                result = eval(input);
            }
            
            console.log('Result:', result);
            
        } catch (error) {
            console.error('Error:', error.message);
        }
        
        rl.prompt();
    });

    rl.on('close', () => {
        console.log('\nClosing WORM session...');
        WORM.closeSession(sessionName);
        process.exit(0);
    });
}

async function runTests() {
    console.log('Running WORM tests...\n');
    
    try {
        // Sprawdź czy jest zainstalowany Jest
        require('jest');
        
        const { spawn } = require('child_process');
        const testProcess = spawn('npm', ['test'], { stdio: 'inherit' });
        
        testProcess.on('close', (code) => {
            if (code === 0) {
                console.log('\n✅ All tests passed!');
            } else {
                console.log('\n❌ Some tests failed.');
            }
            process.exit(code);
        });
        
    } catch (error) {
        console.log('Jest not found. Install with: npm install');
        process.exit(1);
    }
}

async function runContainerCommand(subcommand, args) {
    const ContainerManager = require('./scripts/container-manager');
    const manager = new ContainerManager();
    
    switch (subcommand) {
        case 'add':
            if (args.length < 1) {
                console.error('❌ Usage: container add <path> [target]');
                process.exit(1);
            }
            await manager.add(args[0], args[1]);
            break;
            
        case 'list':
            await manager.list(args[0]);
            break;
            
        case 'extract':
            if (args.length < 1) {
                console.error('❌ Usage: container extract <file> [output]');
                process.exit(1);
            }
            await manager.extract(args[0], args[1]);
            break;
            
        case 'stats':
            await manager.stats();
            break;
            
        case 'clear':
            await manager.clear();
            break;
            
        default:
            console.log(`
Container Commands:
  container add <path> [target]     Add file or directory to container
  container list [prefix]           List files in container  
  container extract <file> [output] Extract file from container
  container stats                   Show container statistics
  container clear                   Clear all files from container

Examples:
  worm container add mydata.json
  worm container list
  worm container extract config.json
            `);
            break;
    }
}

// Parse command line arguments
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    // Debug logging
    if (process.env.WORM_DEBUG) {
        console.log('Debug - args:', args);
        console.log('Debug - command:', command);
    }
    
    // Parse options
    const options = {};
    for (let i = 1; i < args.length; i++) {
        if (args[i] === '--debug') {
            options.debug = true;
            WORM.config.debug = true;
        } else if (args[i] === '--timeout') {
            options.timeout = parseInt(args[i + 1]);
            WORM.config.timeout = options.timeout;
            i++; // skip next arg
        } else if (args[i] === '--session') {
            options.session = args[i + 1];
            i++; // skip next arg
        }
    }

    if (options.debug) {
        console.log('Debug mode enabled');
    }

    try {
        switch (command) {
            case 'help':
            case '--help':
            case '-h':
                showHelp();
                break;
                
            case 'version':
            case '--version':
            case '-v':
                showVersion();
                break;
                
            case 'examples':
                await runExamples();
                break;
                
            case 'ml-pipeline':
                await machineLearningPipeline();
                break;
                
            case 'text-pipeline':
                await textProcessingPipeline();
                break;
                
            case 'interactive':
            case 'repl':
                await runInteractive(options.session || 'main');
                break;
                
            case 'test':
                await runTests();
                break;
                
            case 'container':
                if (args.length <= 1) {  // Brak subcommand
                    console.log(`
Container Commands:
  container add <path> [target]     Add file or directory to container
  container list [prefix]           List files in container
  container extract <file> [output] Extract file from container
  container stats                   Show container statistics
  container clear                   Clear all files from container

Examples:
  worm container add mydata.json
  worm container list
  worm container extract config.json
                    `);
                } else {
                    const subcommand = args[1];    // args[1] bo args[0] to 'container'
                    const containerArgs = args.slice(2);  // args od 2 w górę
                    await runContainerCommand(subcommand, containerArgs);
                }
                break;
                
            case 'build':
                const buildTarget = args[0] || 'current';
                console.log(`🔨 Building WORM for ${buildTarget}...`);
                const WormBuilder = require('./scripts/build');
                const builder = new WormBuilder();
                await builder.build({ target: buildTarget });
                break;
                
            default:
                if (!command) {
                    console.log('WORM - Universal Language Interface');
                    console.log('Use "node worm.js help" for usage information');
                } else {
                    console.log(`Unknown command: ${command}`);
                    console.log('Use "node worm.js help" for available commands');
                }
                break;
        }
    } catch (error) {
        console.error('Error:', error.message);
        if (options.debug) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down WORM...');
    WORM.shutdown();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    WORM.shutdown();
    process.exit(0);
});

// Run main function if this file is executed directly
if (require.main === module) {
    main().catch(error => {
        console.error('Fatal error:', error.message);
        process.exit(1);
    });
}

module.exports = { main, runInteractive, runTests };