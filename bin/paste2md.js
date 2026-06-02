#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const paste2md = require('../src/index.js');
const { formatError, formatSuccess, formatInfo, getClipboardCommand, validateOptions } = require('../src/utils.js');
const pkg = require('../package.json');

const args = process.argv.slice(2);

let inputFile = null;
let outputFile = null;
let readClipboard = false;
let writeClipboard = false;
let stripLinks = false;
let stripImages = false;
let quiet = false;
let verbose = false;

// Parse arguments
for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];

  if (arg === '-i' || arg === '--input') {
    inputFile = args[i + 1];
    i += 1;
  } else if (arg === '-o' || arg === '--output') {
    outputFile = args[i + 1];
    i += 1;
  } else if (arg === '-c' || arg === '--clipboard') {
    readClipboard = true;
  } else if (arg === '--copy') {
    writeClipboard = true;
  } else if (arg === '--strip-links') {
    stripLinks = true;
  } else if (arg === '--strip-images') {
    stripImages = true;
  } else if (arg === '-q' || arg === '--quiet') {
    quiet = true;
  } else if (arg === '-v' || arg === '--verbose') {
    verbose = true;
  } else if (arg === '-h' || arg === '--help') {
    showHelp();
    process.exit(0);
  } else if (arg === '--version') {
    console.log(`paste2md v${pkg.version}`);
    process.exit(0);
  }
}

function showHelp() {
  console.log(`
paste2md v${pkg.version} - Convert messy HTML to clean Markdown

USAGE:
  pbpaste | paste2md                    Read from clipboard, output to stdout
  paste2md -i file.html -o file.md      Convert HTML file to Markdown file
  paste2md -c                           Read from clipboard, output to stdout
  paste2md -c --copy                    Read from clipboard, write back to clipboard

OPTIONS:
  -i, --input         Input file path (default: stdin)
  -o, --output        Output file path (default: stdout)
  -c, --clipboard     Read from system clipboard
      --copy          Write result to system clipboard
      --strip-links   Remove hyperlinks, keep link text only
      --strip-images  Remove all image tags
  -q, --quiet         Suppress info messages
  -v, --verbose       Show detailed information
  -h, --help          Show help message
      --version       Show version

EXAMPLES:
  # Blog post to markdown
  pbpaste | paste2md > post.md

  # Strip all links
  pbpaste | paste2md --strip-links

  # Convert HTML file
  paste2md -i article.html -o article.md

  # Clipboard to clipboard
  paste2md -c --copy

  # Verbose mode for debugging
  pbpaste | paste2md --verbose

LEARN MORE:
  https://github.com/lananh93159-boop/paste2md
  `);
}

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (chunk) => {
      data += chunk;
    });

    process.stdin.on('end', () => {
      resolve(data);
    });

    process.stdin.on('error', reject);
  });
}

function getClipboard() {
  const platform = process.platform;
  const cmds = getClipboardCommand(platform);

  if (!cmds) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  try {
    if (Array.isArray(cmds.read)) {
      // Try multiple commands (for Linux)
      for (const cmd of cmds.read) {
        try {
          return execSync(cmd, { encoding: 'utf8' });
        } catch (e) {
          // Continue to next command
        }
      }
      throw new Error('No clipboard utility found. Install xclip or xsel.');
    }
    return execSync(cmds.read, { encoding: 'utf8' });
  } catch (error) {
    throw new Error(`Failed to read clipboard: ${error.message}`);
  }
}

function setClipboard(content) {
  const platform = process.platform;
  const cmds = getClipboardCommand(platform);

  if (!cmds) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  try {
    if (Array.isArray(cmds.write)) {
      // Try multiple commands (for Linux)
      for (const cmd of cmds.write) {
        try {
          execSync(cmd, { input: content, encoding: 'utf8' });
          return;
        } catch (e) {
          // Continue to next command
        }
      }
      throw new Error('No clipboard utility found. Install xclip or xsel.');
    }
    execSync(cmds.write, { input: content, encoding: 'utf8' });
  } catch (error) {
    throw new Error(`Failed to write to clipboard: ${error.message}`);
  }
}

async function main() {
  try {
    let input = '';

    if (verbose && !quiet) {
      console.error(formatInfo('Starting conversion...'));
    }

    // Read input
    if (readClipboard) {
      if (verbose && !quiet) {
        console.error(formatInfo('Reading from clipboard'));
      }
      input = getClipboard();
    } else if (inputFile) {
      if (!fs.existsSync(inputFile)) {
        throw new Error(`Input file not found: ${inputFile}`);
      }
      if (verbose && !quiet) {
        console.error(formatInfo(`Reading from file: ${inputFile}`));
      }
      input = fs.readFileSync(inputFile, 'utf8');
    } else {
      // Read from stdin
      if (verbose && !quiet) {
        console.error(formatInfo('Reading from stdin'));
      }
      input = await readStdin();
    }

    if (!input.trim()) {
      throw new Error('No input provided');
    }

    if (verbose && !quiet) {
      console.error(formatInfo(`Input size: ${Buffer.byteLength(input, 'utf8')} bytes`));
    }

    // Convert
    const output = paste2md(input, {
      stripLinks,
      stripImages,
      verbose
    });

    if (verbose && !quiet) {
      console.error(formatInfo(`Output size: ${Buffer.byteLength(output, 'utf8')} bytes`));
    }

    // Write output
    if (writeClipboard) {
      if (verbose && !quiet) {
        console.error(formatInfo('Writing to clipboard'));
      }
      setClipboard(output);
      if (!quiet) {
        console.error(formatSuccess('Copied to clipboard'));
      }
    } else if (outputFile) {
      if (verbose && !quiet) {
        console.error(formatInfo(`Writing to file: ${outputFile}`));
      }
      fs.writeFileSync(outputFile, output, 'utf8');
      if (!quiet) {
        const size = Buffer.byteLength(output, 'utf8');
        console.error(formatSuccess(`Wrote ${size} bytes to ${outputFile}`));
      }
    } else {
      process.stdout.write(output);
    }
  } catch (error) {
    console.error(formatError(error.message));
    process.exit(1);
  }
}

main();