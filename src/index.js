const TurndownService = require('turndown');
const { gfm } = require('turndown-plugin-gfm');
const { cleanHtml, cleanMarkdown } = require('./cleaner');
const { isHtmlInput } = require('./utils');

/**
 * Convert HTML or text to clean Markdown
 * @param {string} input - HTML or plain text input
 * @param {object} options - Conversion options
 * @returns {string} Clean Markdown output
 */
function paste2md(input, options = {}) {
  const {
    stripLinks = false,
    stripImages = false,
    preserveLinks = false,
    verbose = false
  } = options;

  if (!input || typeof input !== 'string') {
    throw new Error('Input must be a non-empty string');
  }

  // Check if input is HTML
  if (!isHtmlInput(input)) {
    // Plain text - just clean it
    return cleanMarkdown(input);
  }

  try {
    // Clean HTML first
    let cleanedHtml = cleanHtml(input, { stripImages, preserveLinks, verbose });

    // Initialize Turndown with GFM plugin
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      hr: '---',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
      emDelimiter: '_',
      preformattedCode: true
    });

    turndownService.use(gfm);

    // Add custom rules for better conversion
    addCustomRules(turndownService);

    // Convert HTML to Markdown
    let markdown = turndownService.turndown(cleanedHtml);

    // Strip links if requested
    if (stripLinks) {
      markdown = stripMarkdownLinks(markdown);
    }

    // Final cleanup
    markdown = cleanMarkdown(markdown);

    return markdown;
  } catch (error) {
    throw new Error(`Conversion failed: ${error.message}`);
  }
}

/**
 * Add custom Turndown rules for better handling
 */
function addCustomRules(turndownService) {
  // Remove empty links
  turndownService.addRule('removeEmptyLinks', {
    filter: (node) => {
      return (
        node.nodeName === 'A'
        && node.textContent.trim() === ''
      );
    },
    replacement: () => ''
  });

  // Handle code blocks better
  turndownService.addRule('preformattedCode', {
    filter: (node) => {
      return node.nodeName === 'PRE';
    },
    replacement: (content, node) => {
      const codeNode = node.querySelector('code');
      const code = codeNode ? codeNode.textContent : node.textContent;
      const language = codeNode?.className?.match(/language-(\w+)/)?.[1] || '';
      return `\n\`\`\`${language}\n${code.trim()}\n\`\`\`\n`;
    }
  });

  // Better list handling
  turndownService.addRule('nestedLists', {
    filter: ['ul', 'ol'],
    replacement: (content, node) => {
      const parent = node.parentNode;
      const isNested = parent && (
        parent.nodeName === 'LI'
        || parent.nodeName === 'UL'
        || parent.nodeName === 'OL'
      );

      if (isNested) {
        return `\n${content}`;
      }
      return `\n${content}\n`;
    }
  });

  // Handle blockquotes
  turndownService.addRule('blockquote', {
    filter: 'blockquote',
    replacement: (content) => {
      const lines = content.trim().split('\n');
      const quoted = lines.map((line) => `> ${line}`).join('\n');
      return `\n${quoted}\n`;
    }
  });

  // Better heading handling
  turndownService.addRule('heading', {
    filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    replacement: (content, node) => {
      const level = parseInt(node.tagName[1], 10);
      return `\n${'#'.repeat(level)} ${content.trim()}\n`;
    }
  });

  // Handle horizontal rules
  turndownService.addRule('horizontalRule', {
    filter: ['hr'],
    replacement: () => '\n---\n'
  });

  // Better paragraph handling
  turndownService.addRule('paragraph', {
    filter: 'p',
    replacement: (content) => `\n${content.trim()}\n`
  });
}

/**
 * Strip markdown links but keep text
 */
function stripMarkdownLinks(markdown) {
  // [text](url) -> text
  return markdown.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}

module.exports = paste2md;