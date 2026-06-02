# paste2md

> Convert messy pasted HTML or web text into clean Markdown — right from your terminal.

```bash
pbpaste | paste2md
```

No browser extensions. No accounts. No cloud. Just clean output.

---

## Why

Copying text from websites is a mess. You get invisible Unicode junk, `<span>` soup, nav bars, cookie banners, and weird whitespace. `paste2md` strips all of that and gives you clean [GitHub-Flavoured Markdown](https://github.github.com/gfm/).

## Features

- ✅ **Zero dependencies on system utilities** (except clipboard tools)
- ✅ **Robust HTML parsing** with Cheerio
- ✅ **Removes noise** - scripts, styles, navs, ads, cookie banners
- ✅ **Preserves formatting** - headings, bold, italic, code blocks, tables
- ✅ **Cross-platform** - macOS, Linux, Windows/WSL
- ✅ **Flexible options** - strip links, remove images, etc.
- ✅ **Fast and reliable** - handles large documents
- ✅ **Well tested** - 80+ test cases

## Install

```bash
npm install -g paste2md
```

Or run without installing:

```bash
npx paste2md
```

## Usage

### From clipboard (macOS)

```bash
pbpaste | paste2md
```

### From clipboard (Linux)

```bash
xclip -o | paste2md
# or
xsel --clipboard --output | paste2md
```

### From clipboard (Windows / WSL)

```bash
powershell.exe Get-Clipboard | paste2md
```

### From a file

```bash
paste2md -i page.html -o page.md
```

### Use the built-in clipboard flag

```bash
paste2md -c           # read from clipboard, print to stdout
paste2md -c --copy    # read from clipboard, write result back to clipboard
```

## Options

```
  -i, --input         Input file path (default: stdin)
  -o, --output        Output file path (default: stdout)
  -c, --clipboard     Read from system clipboard
      --copy          Write result to clipboard
      --strip-links   Remove hyperlinks, keep link text only
      --strip-images  Remove all image tags
  -q, --quiet         Suppress info messages
  -v, --verbose       Show detailed information
  -h, --help          Show help
      --version       Show version
```

## Examples

```bash
# Blog post → clean markdown
pbpaste | paste2md > post.md

# Strip all links (great for docs you'll edit heavily)
pbpaste | paste2md --strip-links

# Convert a saved HTML file
paste2md -i article.html -o article.md

# Read clipboard, copy clean markdown back to clipboard
paste2md -c --copy

# Pipe into a note-taking CLI
pbpaste | paste2md | obsidian-note create "My Note"

# Verbose mode for debugging
pbpaste | paste2md --verbose
```

## What it cleans up

| Input noise | What happens |
|---|---|
| `<nav>`, `<header>`, `<footer>` | Removed entirely |
| `<script>`, `<style>`, `<noscript>` | Removed entirely |
| `<iframe>` | Removed entirely |
| `<span>` with no class/style | Unwrapped (content kept) |
| Multiple `<br>` in a row | Collapsed to paragraph break |
| 3+ blank lines | Collapsed to 2 |
| Zero-width spaces, BOM, invisible Unicode | Stripped |
| Trailing whitespace on each line | Trimmed |
| `data:` image URIs | Replaced with `![alt]` placeholder |
| Empty `<a>` tags | Removed |
| Cookie banners (`.cookie-banner`, `.ad`) | Removed |
| Ad containers | Removed |

## Supported output features (GFM)

- ATX headings (`#`, `##`, ...)
- **Bold**, _italic_, ~~strikethrough~~
- Fenced code blocks with language hint
- Tables
- Task lists
- Ordered and unordered lists
- Blockquotes
- Links and images (with alt text)
- Horizontal rules

## Running tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
```

## How it works

`paste2md` uses [Turndown](https://github.com/mixmark-io/turndown) with the [GFM plugin](https://github.com/mixmark-io/turndown-plugin-gfm) for HTML → Markdown conversion. On top of that it adds custom rules to strip noise elements, clean up whitespace, and handle edge cases that Turndown doesn't cover out of the box.

For robust HTML parsing, we use [Cheerio](https://cheerio.js.org/) to properly identify and remove unwanted elements before conversion.

Plain text input (no HTML tags detected) is cleaned and returned as-is.

## Development

See [DEVELOPMENT.md](./DEVELOPMENT.md) for setup, testing, and contribution guidelines.

## License

MIT
