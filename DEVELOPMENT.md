# Development Guide

## Setup

```bash
git clone https://github.com/lananh93159-boop/paste2md.git
cd paste2md
npm install
```

## Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

## Code Quality

```bash
npm run lint          # Check code style
npm run lint:fix      # Fix code style issues
```

## Testing Locally

```bash
npm link              # Link globally
paste2md -h           # Test the CLI
```

Or without linking:

```bash
node bin/paste2md.js -h
```

Test with real input:

```bash
echo '<p>Hello <strong>world</strong></p>' | node bin/paste2md.js
```

## Architecture

### Core Modules

- **src/index.js** - Main conversion logic using Turndown + custom rules
- **src/cleaner.js** - HTML and Markdown cleanup utilities using Cheerio
- **src/utils.js** - Helper functions for platform detection, validation, formatting
- **bin/paste2md.js** - CLI entry point and argument parsing

### Conversion Flow

1. **Input Detection** - Determine if input is HTML or plain text
2. **HTML Cleaning** - Remove noise elements (scripts, nav, ads, etc.)
3. **HTML to Markdown** - Use Turndown with GFM plugin
4. **Custom Rules** - Apply Turndown rules for better formatting
5. **Post-processing** - Fix formatting, collapse whitespace, etc.
6. **Output** - Write to file, clipboard, or stdout

## Adding Features

### New CLI Option

1. Add argument parsing in `bin/paste2md.js`
2. Add option to conversion function in `src/index.js`
3. Add tests in `test/index.test.js`
4. Update README.md with example usage

### New HTML Cleanup Rule

1. Add cleanup logic in `src/cleaner.js` (inside `cleanupElements` or `removeUnwantedElements`)
2. Add test cases for the new rule
3. Update REMOVE_SELECTORS or regex patterns as needed
4. Document the rule's purpose in comments

### New Turndown Rule

1. Add rule in `addCustomRules()` function in `src/index.js`
2. Add test cases to verify conversion
3. Document the rule's purpose and behavior
4. Update README with example if user-facing

## Common Issues

### Clipboard not working on Linux

Install one of these:

```bash
# Option 1: xclip
sudo apt-get install xclip

# Option 2: xsel
sudo apt-get install xsel
```

### HTML not parsing correctly

Check if HTML is being detected:

```bash
node -e "const { isHtmlInput } = require('./src/utils'); console.log(isHtmlInput(process.argv[1]))" "<p>test</p>"
```

Enable verbose mode:

```bash
cat input.html | paste2md --verbose
```

### Markdown output has formatting issues

Run with verbose mode to see conversion steps:

```bash
paste2md -i file.html -o output.md --verbose
```

Check if the HTML cleanup is too aggressive:

```bash
node -e "const { cleanHtml } = require('./src/cleaner'); console.log(cleanHtml(require('fs').readFileSync('input.html', 'utf8')))" > cleaned.html
```

## Performance Considerations

- **Large files** (>10MB): May be slow due to regex processing
- **Deep nesting**: HTML with 50+ levels of nesting might hit stack limits
- **Cheerio overhead**: Using Cheerio for all inputs (could optimize for plain text)

## Publishing to npm

Before publishing:

```bash
# Ensure tests pass
npm test

# Ensure code quality
npm run lint

# Update version
npm version patch  # or minor/major

# Publish
npm publish
```

## Future Enhancements

- [ ] Browser extension
- [ ] Web interface
- [ ] Support for more formats (LaTeX, AsciiDoc)
- [ ] Plugin system for custom transformations
- [ ] Configuration file support (.paste2mdrc)
- [ ] Watch mode for directory conversion
- [ ] Template/template-aware conversion

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Add tests for new features
4. Ensure `npm test` and `npm run lint` pass
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Code Style

We use ESLint with airbnb-base configuration. Run `npm run lint:fix` to automatically fix style issues.

## Testing Guidelines

- Write tests for every new feature
- Test edge cases (empty input, very large input, special characters)
- Test error conditions
- Aim for >80% code coverage
- Use descriptive test names
