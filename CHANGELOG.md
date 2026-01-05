# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-01-05

### Added

- Initial release of markmodern
- **Core Markdown support**: headings, paragraphs, lists, code blocks, blockquotes, horizontal rules
- **Unordered and ordered lists** with full nesting support
- **Task lists** with checkboxes (- [ ] / - [x])
- **Tables** with alignment support (left, center, right)
- **Inline elements**: bold, italic, bold+italic, strikethrough, inline code, links
- **Extended syntax**:
  - Footnotes/annotations ([^1])
  - Definition lists (term followed by : definition)
  - Comments (// at line start)
  - Escape sequences (\*, \#, etc.)
- **Three-stage pipeline architecture**: Tokenization → AST → HTML
- **CLI** with output format options (-t for token, -a for AST, -h for HTML)
- **Build system** with TypeScript compilation
- **Biome linting and formatting**
- Comprehensive documentation (English and Japanese)
- MIT License

### Technical Details

- Built with TypeScript
- Uses Bun as runtime
- Zero dependencies in production
- ESM modules support

---

[0.1.0]: https://github.com/grassfield/markmodern/releases/tag/v0.1.0
