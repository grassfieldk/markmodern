# markmodern

A markup language based on Markdown, designed for note-taking and article creation.
File extension: `.mm`


## Features

### Markdown Support

- Headings
- Lists
  - Unordered lists
  - Ordered lists
  - Task lists with checkboxes
- Code blocks
- Block quotes
- Horizontal rules
- Tables

### Inline Elements

- Bold
- Italic
- Bold + Italic
- Strikethrough
- Inline code
- Hyperlinks

### Extended Syntax

- Footnotes/Annotations
- Definition lists
- Comments
- Escape sequences


## Usage

### Command Line

```bash
# Default (HTML)
npm run start -- <input.md>

# Output as token stream
npm run start -- <input.md> -t

# Output as AST
npm run start -- <input.md> -a

# Output as HTML
npm run start -- <input.md> -h
```


## Architecture

The parser uses a 3-stage pipeline:

1. **Tokenization** (`Tokenizer`) - Converts Markdown text into a token stream
2. **AST Generation** (`ASTGenerator`) - Builds an Abstract Syntax Tree with inline element parsing
3. **Serialization** (`HTMLSerializer`) - Converts AST to HTML output


## License

MIT © 2026 GrassfieldK


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
