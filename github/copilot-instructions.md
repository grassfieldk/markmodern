# Copilot Instructions

## Technical Stack

- **Runtime**: Bun
- **Language**: TypeScript

## Coding Conventions

1. **Type Safety**

   - Add type annotations to all variables and functions
   - Always check RegExp match results for null/undefined
   - Use optional chaining (`?.`) for array access

2. **Code Quality**

   - Add explanatory comments to each method
   - Maintain class design (centered around `MarkdownParser` class)
   - Process in stages (tokenize → toAST → toHTML)

3. **Naming Conventions**
   - Method names: camelCase
   - Class names: PascalCase
   - Constants: UPPER_SNAKE_CASE

## Implementation Update Checklist

### When Implementing Syntax

- Add new syntax patterns to the `tokenize()` method
- Implement corresponding processing in `toAST()` and `toHTML()` methods
- Update `test.md` content to match the latest syntax

### After Coding Completion

- Confirm no problems are detected in the editor
- If problems are detected, fix them

### Testing

- Run command: `bun index.ts`
- Input file: `test.md`

## Currently Implemented Syntax

- Headings (`#` to `######`)
- Paragraphs
- Unordered lists (`-`, `*`)
- Ordered lists (`1.`, `2.`, etc.)
- Blockquotes (`>`)
- Code blocks (` ``` `)
- Horizontal rules (`---`, `***`, `___`)
- Inline elements: **bold**, _italic_, `` `code` ``, [links]
