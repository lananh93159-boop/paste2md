# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-06-02

### Added
- Initial release of paste2md
- HTML to Markdown conversion with Turndown + GFM
- Robust HTML cleaning with Cheerio
- CLI with clipboard support (macOS, Linux, Windows/WSL)
- Cross-platform support
- 80+ comprehensive test cases
- Full documentation and development guide
- GitHub Actions CI/CD pipeline
- ESLint and Jest configuration
- npm package publishing
- GitHub Pages documentation

### Features
- Remove noise elements (scripts, styles, ads, cookies)
- Preserve formatting (headings, bold, italic, code blocks, tables)
- Strip links and images options
- Verbose and quiet modes
- File input/output and stdin/stdout support
- Clipboard operations on all platforms

### Security
- XSS protection by removing script tags
- Safe HTML parsing with Cheerio
- Invisible character removal

[Unreleased]: https://github.com/lananh93159-boop/paste2md/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/lananh93159-boop/paste2md/releases/tag/v1.0.0