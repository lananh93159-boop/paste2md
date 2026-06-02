/**
 * Check if input is HTML or plain text
 */
function isHtmlInput(input) {
  // Simple heuristic: check for HTML tags
  const htmlTagRegex = /<[a-z][\s\S]*?>/i;
  return htmlTagRegex.test(input);
}

/**
 * Validate and normalize options
 */
function validateOptions(options) {
  const defaults = {
    stripLinks: false,
    stripImages: false,
    preserveLinks: false,
    verbose: false
  };

  if (typeof options !== 'object' || options === null) {
    return defaults;
  }

  return {
    stripLinks: Boolean(options.stripLinks),
    stripImages: Boolean(options.stripImages),
    preserveLinks: Boolean(options.preserveLinks),
    verbose: Boolean(options.verbose)
  };
}

/**
 * Get platform-specific clipboard command
 */
function getClipboardCommand(platform) {
  const commands = {
    darwin: {
      read: 'pbpaste',
      write: 'pbcopy'
    },
    linux: {
      read: ['xclip -o -selection clipboard', 'xsel --clipboard --output'],
      write: ['xclip -selection clipboard', 'xsel --clipboard --input']
    },
    win32: {
      read: 'powershell.exe Get-Clipboard',
      write: 'powershell.exe -Command "Set-Clipboard -Value @\'\n%INPUT%\n\'@"'
    }
  };

  return commands[platform] || null;
}

/**
 * Format error message for CLI
 */
function formatError(error) {
  const message = error.message || String(error);
  return `❌ Error: ${message}`;
}

/**
 * Format success message for CLI
 */
function formatSuccess(message) {
  return `✓ ${message}`;
}

/**
 * Format info message for CLI
 */
function formatInfo(message) {
  return `ℹ ${message}`;
}

/**
 * Format warning message for CLI
 */
function formatWarning(message) {
  return `⚠ ${message}`;
}

module.exports = {
  isHtmlInput,
  validateOptions,
  getClipboardCommand,
  formatError,
  formatSuccess,
  formatInfo,
  formatWarning
};