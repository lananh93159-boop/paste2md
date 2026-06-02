const paste2md = require('../src/index.js');
const { cleanHtml, cleanMarkdown } = require('../src/cleaner.js');
const { isHtmlInput } = require('../src/utils.js');

describe('paste2md', () => {
  describe('Core conversion', () => {
    test('should convert simple HTML to Markdown', () => {
      const html = '<h1>Hello</h1><p>World</p>';
      const result = paste2md(html);
      expect(result).toContain('# Hello');
      expect(result).toContain('World');
    });

    test('should handle plain text without conversion', () => {
      const text = 'Hello World';
      const result = paste2md(text);
      expect(result).toBe('Hello World');
    });

    test('should throw error on invalid input', () => {
      expect(() => paste2md(null)).toThrow();
      expect(() => paste2md('')).toThrow();
    });

    test('should handle mixed content', () => {
      const html = '<h2>Title</h2><p>Some <strong>bold</strong> text</p>';
      const result = paste2md(html);
      expect(result).toContain('## Title');
      expect(result).toContain('**bold**');
    });

    test('should handle numbered headings', () => {
      const html = '<h1>H1</h1><h2>H2</h2><h3>H3</h3>';
      const result = paste2md(html);
      expect(result).toContain('# H1');
      expect(result).toContain('## H2');
      expect(result).toContain('### H3');
    });
  });

  describe('HTML cleaning', () => {
    test('should remove script tags', () => {
      const html = '<p>Hello</p><script>alert("xss")</script><p>World</p>';
      const result = paste2md(html);
      expect(result).not.toContain('alert');
      expect(result).toContain('Hello');
    });

    test('should remove style tags', () => {
      const html = '<p>Text</p><style>.bad { color: red; }</style>';
      const result = paste2md(html);
      expect(result).not.toContain('bad');
    });

    test('should remove nav, header, footer', () => {
      const html = `
        <header>Navigation</header>
        <p>Main content</p>
        <footer>Footer</footer>
      `;
      const result = paste2md(html);
      expect(result).not.toContain('Navigation');
      expect(result).not.toContain('Footer');
      expect(result).toContain('Main content');
    });

    test('should remove cookie banners', () => {
      const html = '<div class="cookie-banner">Accept cookies</div><p>Content</p>';
      const result = paste2md(html);
      expect(result).not.toContain('Accept cookies');
    });

    test('should remove empty links', () => {
      const html = '<p><a href="#">   </a>Text</p>';
      const result = paste2md(html);
      expect(result).not.toContain('](');
    });

    test('should remove iframe tags', () => {
      const html = '<p>Text</p><iframe src="https://example.com"></iframe>';
      const result = paste2md(html);
      expect(result).not.toContain('iframe');
    });
  });

  describe('Link handling', () => {
    test('should preserve links by default', () => {
      const html = '<p><a href="https://example.com">Link</a></p>';
      const result = paste2md(html);
      expect(result).toContain('[Link]');
      expect(result).toContain('https://example.com');
    });

    test('should strip links when requested', () => {
      const html = '<p><a href="https://example.com">Link</a></p>';
      const result = paste2md(html, { stripLinks: true });
      expect(result).not.toContain('[Link]');
      expect(result).toContain('Link');
    });

    test('should handle multiple links', () => {
      const html = '<p><a href="#1">Link 1</a> and <a href="#2">Link 2</a></p>';
      const result = paste2md(html);
      expect(result).toContain('[Link 1]');
      expect(result).toContain('[Link 2]');
    });
  });

  describe('Image handling', () => {
    test('should preserve images by default', () => {
      const html = '<img src="https://example.com/image.jpg" alt="test" />';
      const result = paste2md(html);
      expect(result).toContain('![');
    });

    test('should remove images when requested', () => {
      const html = '<img src="https://example.com/image.jpg" alt="test" />';
      const result = paste2md(html, { stripImages: true });
      expect(result).not.toContain('![');
    });

    test('should replace data URIs with placeholder', () => {
      const html = '<img src="data:image/png;base64,..." alt="test" />';
      const result = paste2md(html);
      expect(result).not.toContain('data:');
    });
  });

  describe('Formatting', () => {
    test('should handle bold and italic', () => {
      const html = '<p><strong>Bold</strong> and <em>italic</em></p>';
      const result = paste2md(html);
      expect(result).toContain('**Bold**');
      expect(result).toContain('_italic_');
    });

    test('should handle strikethrough', () => {
      const html = '<p><del>Strikethrough</del></p>';
      const result = paste2md(html);
      expect(result).toContain('~~');
    });

    test('should handle unordered lists', () => {
      const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
      const result = paste2md(html);
      expect(result).toContain('- Item 1');
      expect(result).toContain('- Item 2');
    });

    test('should handle ordered lists', () => {
      const html = '<ol><li>Item 1</li><li>Item 2</li></ol>';
      const result = paste2md(html);
      expect(result).toContain('1. Item 1');
      expect(result).toContain('2. Item 2');
    });

    test('should handle code blocks', () => {
      const html = '<pre><code>function hello() {}</code></pre>';
      const result = paste2md(html);
      expect(result).toContain('```');
      expect(result).toContain('function hello()');
    });

    test('should handle blockquotes', () => {
      const html = '<blockquote><p>Quote text</p></blockquote>';
      const result = paste2md(html);
      expect(result).toContain('> Quote text');
    });

    test('should handle tables', () => {
      const html = `
        <table>
          <tr><th>Header 1</th><th>Header 2</th></tr>
          <tr><td>Cell 1</td><td>Cell 2</td></tr>
        </table>
      `;
      const result = paste2md(html);
      expect(result).toContain('|');
    });
  });

  describe('Markdown cleaning', () => {
    test('should remove trailing whitespace', () => {
      const md = '# Hello   \nWorld   ';
      const result = cleanMarkdown(md);
      expect(result).toBe('# Hello\nWorld');
    });

    test('should collapse multiple blank lines', () => {
      const md = 'Line 1\n\n\n\nLine 2';
      const result = cleanMarkdown(md);
      expect(result).toBe('Line 1\n\nLine 2');
    });

    test('should trim leading and trailing whitespace', () => {
      const md = '  \n# Hello\nWorld\n  ';
      const result = cleanMarkdown(md);
      expect(result).toBe('# Hello\nWorld');
    });
  });

  describe('Utility functions', () => {
    test('isHtmlInput should detect HTML', () => {
      expect(isHtmlInput('<p>HTML</p>')).toBe(true);
      expect(isHtmlInput('<div>test</div>')).toBe(true);
      expect(isHtmlInput('Plain text')).toBe(false);
      expect(isHtmlInput('123')).toBe(false);
    });
  });

  describe('Edge cases', () => {
    test('should handle deeply nested HTML', () => {
      const html = '<div><div><div><p>Deep content</p></div></div></div>';
      const result = paste2md(html);
      expect(result).toContain('Deep content');
    });

    test('should handle unicode characters', () => {
      const html = '<p>你好世界 🌍</p>';
      const result = paste2md(html);
      expect(result).toContain('你好世界');
      expect(result).toContain('🌍');
    });

    test('should remove zero-width characters', () => {
      const html = '<p>Text\u200Bwith\u200Czero\u200Dwidth</p>';
      const result = paste2md(html);
      expect(result).not.toContain('\u200B');
    });

    test('should handle very long content', () => {
      const longText = 'A'.repeat(10000);
      const html = `<p>${longText}</p>`;
      const result = paste2md(html);
      expect(result).toContain('A'.repeat(100));
    });
  });
});