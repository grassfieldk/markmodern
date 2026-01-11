[日本語](README.ja.md)

# Markmodern

A markup language based on Markdown, designed for note-taking and article creation.
File extension: `.mdn`


## Features

### Markdown Support

- Headings (`#` to `######`)
- Lists
  - Unordered lists with nesting
  - Ordered lists with nesting
  - Task lists with checkboxes
- Code blocks (with 3+ backticks, supports nesting)
- Block quotes
- Horizontal rules
- Tables with alignment

### Inline Elements

- Bold (`**text**`)
- Italic (`*text*`)
- Bold + Italic (`***text***`)
- Strikethrough (`~~text~~`)
- Inline code (`` `text` ``)
- Hyperlinks (`[text](url)`)
- Images (`![alt](url)`)
- Captioned images (`-![caption](url)`)

### Extended Syntax

- **Footnotes** - `[^1]` with definitions
- **Definition lists** - `term : definition`
- **Details blocks** - `===summary ... ===`
- **Admonition blocks** - `:::note [type] ... :::`
  - Types: `info` (blue), `warn` (orange), `alert` (red)
- **Ruby text (Furigana)** - `{kanji}(reading)`
- **Comments** - `// comment`
- **Escape sequences** - `\*`, `\#`, etc.


## Usage

### Command Line

```bash
# Output HTML to console
npm run start -- <input.mdn>

# Output HTML to file with embedded CSS
npm run start -- <input.mdn> -f

# Output token stream
npm run start -- <input.mdn> -t

# Output AST
npm run start -- <input.mdn> -a

# Output HTML fragment
npm run start -- <input.mdn> -h
```


## Architecture

The parser uses a 3-stage pipeline:

1. **Tokenization** (`Tokenizer`) - Converts Markmodern text into a token stream
2. **AST Generation** (`ASTGenerator`) - Builds an Abstract Syntax Tree with inline element parsing
3. **Serialization** (`HTMLSerializer`) - Converts AST to HTML output

### Key Design Features

- Recursive block processing for complex nested structures
- Fence-aware code block parsing with variable lengths (3+ backticks)
- Support for nested lists with indentation
- CSS embedding in HTML output


## License

MIT © 2026 GrassfieldK


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
