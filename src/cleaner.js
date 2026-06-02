const cheerio = require('cheerio');

/**
 * Selectors for elements to remove completely
 */
const REMOVE_SELECTORS = [
  'script',
  'style',
  'noscript',
  'nav',
  'header',
  'footer',
  'iframe',
  '[class*="cookie"]',
  '[class*="ad"]',
  '[class*="advertisement"]',
  '[id*="cookie"]',
  '[id*="ad"]',
  '[id*="advertisement"]',
  '[role="navigation"]',
  '[role="banner"]',
  '[role="contentinfo"]',
  '[role="complementary"]'
];

/**
 * Regex for invisible Unicode characters
 */
const INVISIBLE_CHARS_REGEX = /[\u200B-\u200D\uFEFF\u061C\u180E]/g;

/**
 * Clean up messy HTML before conversion
 */
function cleanHtml(html, options = {}) {
  const { stripImages = false, preserveLinks = false, verbose = false } = options;

  try {
    const $ = cheerio.load(html, { decodeEntities: true });

    // Remove unwanted elements completely
    removeUnwantedElements($);

    // Clean up attributes and content
    cleanupElements($, { stripImages, preserveLinks });

    // Remove invisible characters
    removeInvisibleCharacters($);

    // Collapse whitespace
    collapseWhitespace($);

    return $.html();
  } catch (error) {
    if (verbose) {
      console.error('Cheerio parsing failed, using fallback:', error.message);
    }
    // Fallback to regex-based cleaning if cheerio fails
    return fallbackCleanHtml(html, options);
  }
}

/**
 * Remove script, style, nav, header, footer, and ad/cookie elements
 */
function removeUnwantedElements($) {
  REMOVE_SELECTORS.forEach((selector) => {
    try {
      $(selector).remove();
    } catch (e) {
      // Skip invalid selectors
    }
  });
}

/**
 * Clean up elements and their attributes
 */
function cleanupElements($, options) {
  const { stripImages, preserveLinks } = options;

  // Remove empty links
  $('a:empty').remove();

  // Clean links
  if (!preserveLinks) {
    $('a').each((i, elem) => {
      const $elem = $(elem);
      const href = $elem.attr('href');
      if (!href || href.trim() === '') {
        $elem.replaceWith($elem.html());
      }
    });
  }

  // Handle images
  if (stripImages) {
    $('img').remove();
  } else {
    $('img').each((i, elem) => {
      const $elem = $(elem);
      const src = $elem.attr('src');

      // Replace data URIs with placeholder text
      if (src && src.startsWith('data:')) {
        const alt = $elem.attr('alt') || 'image';
        $elem.replaceWith(`![${alt}]`);
      }
    });
  }

  // Remove empty elements (but not self-closing tags)
  $('*:empty:not(img):not(br):not(hr):not(input)').remove();

  // Unwrap unnecessary spans
  $('span:not([class]):not([style])').each((i, elem) => {
    const $elem = $(elem);
    $elem.replaceWith($elem.html());
  });

  // Unwrap unnecessary divs
  $('div:not([class]):not([style])').each((i, elem) => {
    const $elem = $(elem);
    // Don't unwrap divs that contain block elements
    const hasBlockChildren = $elem.children('p, div, blockquote, pre, ul, ol, table, h1, h2, h3, h4, h5, h6').length > 0;
    if (!hasBlockChildren) {
      $elem.replaceWith($elem.html());
    }
  });

  // Clean multiple br tags
  $('br').each((i, elem) => {
    const $elem = $(elem);
    let next = $elem.next();
    let brCount = 1;

    while (next.length && next[0].name === 'br') {
      brCount += 1;
      next = next.next();
    }

    if (brCount > 2) {
      $elem.replaceWith('');
    }
  });

  // Clean up excessive whitespace in text nodes
  $('*').each((i, elem) => {
    if (elem.type === 'text') {
      elem.data = elem.data.replace(/\s+/g, ' ').trim();
    }
  });

  // Remove attributes that might contain noise
  $('*').each((i, elem) => {
    const $elem = $(elem);
    const attribs = elem.attribs;
    if (attribs) {
      Object.keys(attribs).forEach((key) => {
        // Keep only important attributes
        if (!['href', 'src', 'alt', 'title', 'class', 'id', 'style', 'name'].includes(key)) {
          $elem.removeAttr(key);
        }
      });
    }
  });
}

/**
 * Remove invisible Unicode characters and BOM
 */
function removeInvisibleCharacters($) {
  $('*').each((i, elem) => {
    if (elem.type === 'text') {
      elem.data = elem.data.replace(INVISIBLE_CHARS_REGEX, '');
    }
  });

  // Also remove from attributes
  $('[href]').each((i, elem) => {
    const $elem = $(elem);
    const href = $elem.attr('href');
    if (href) {
      $elem.attr('href', href.replace(INVISIBLE_CHARS_REGEX, ''));
    }
  });
}

/**
 * Collapse excessive whitespace
 */
function collapseWhitespace($) {
  // Remove leading/trailing whitespace from block elements
  const blockElements = [
    'p', 'div', 'blockquote', 'pre', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'td', 'th', 'dd', 'dt'
  ];

  blockElements.forEach((tag) => {
    $(tag).each((i, elem) => {
      const $elem = $(elem);
      const html = $elem.html();
      if (html) {
        $elem.html(html.trim());
      }
    });
  });
}

/**
 * Fallback HTML cleaning using regex
 */
function fallbackCleanHtml(html, options) {
  const { stripImages = false } = options;
  let cleaned = html;

  // Remove script, style, noscript tags and their content
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  cleaned = cleaned.replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '');
  cleaned = cleaned.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

  // Remove nav, header, footer tags
  cleaned = cleaned.replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '');
  cleaned = cleaned.replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '');
  cleaned = cleaned.replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '');

  // Remove common ad and cookie banner elements
  cleaned = cleaned.replace(/<[^>]*(?:class|id)="[^"]*(?:cookie-banner|ad|advertisement)[^"]*"[^>]*>.*?<\/[^>]+>/gi, '');

  // Remove image data URIs
  if (stripImages) {
    cleaned = cleaned.replace(/<img[^>]*>/gi, '');
  } else {
    cleaned = cleaned.replace(/src="data:[^"]*"/gi, 'alt="image"');
  }

  // Remove empty anchor tags
  cleaned = cleaned.replace(/<a[^>]*>\s*<\/a>/gi, '');

  // Collapse multiple br tags
  cleaned = cleaned.replace(/(<br\s*\/?>[\s]*){3,}/gi, '</p><p>');

  // Remove zero-width spaces and invisible Unicode
  cleaned = cleaned.replace(INVISIBLE_CHARS_REGEX, '');

  return cleaned;
}

/**
 * Clean up Markdown after conversion
 */
function cleanMarkdown(markdown) {
  let cleaned = markdown;

  // Remove leading/trailing whitespace
  cleaned = cleaned.trim();

  // Trim trailing whitespace on each line
  cleaned = cleaned
    .split('\n')
    .map((line) => line.replace(/\s+$/, ''))
    .join('\n');

  // Collapse 3+ blank lines to 2
  cleaned = cleaned.replace(/\n\n\n+/g, '\n\n');

  // Fix common markdown issues
  // Remove spaces before list markers
  cleaned = cleaned.replace(/^\s+[-*+]\s/gm, (match) => {
    const indent = Math.floor(match.match(/^\s*/)[0].length / 2);
    return '  '.repeat(indent) + match.trim();
  });

  // Ensure code blocks have proper spacing
  cleaned = cleaned.replace(/([^\n])\n```/g, '$1\n\n```');
  cleaned = cleaned.replace(/```\n([^\n])/g, '```\n\n$1');

  // Fix heading spacing
  cleaned = cleaned.replace(/([^\n])\n(#{1,6}\s)/g, '$1\n\n$2');
  cleaned = cleaned.replace(/(#{1,6}\s[^\n]*)\n([^\n#])/g, '$1\n\n$2');

  // Remove excessive list indentation
  cleaned = cleaned.replace(/^(\s{8,})/gm, (match) => {
    return '  '.repeat(Math.min(4, Math.floor(match.length / 2)));
  });

  // Fix table spacing
  cleaned = cleaned.replace(/([^\n])\n\|/g, '$1\n\n|');
  cleaned = cleaned.replace(/\|\n([^\n|])/g, '|\n\n$1');

  // Remove multiple consecutive empty lines in lists
  cleaned = cleaned.replace(/([-*+]\s[^\n]*)\n\n+(?=[-*+]\s)/g, '$1\n');

  return cleaned;
}

module.exports = {
  cleanHtml,
  cleanMarkdown
};