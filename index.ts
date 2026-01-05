// Markdown Parser

type Token = {
  type: string;
  content: string;
  level?: number;
  ordered?: boolean;
  raw: string;
};

type ASTNode = {
  type: string;
  children?: ASTNode[];
  content?: string;
  level?: number;
  ordered?: boolean;
};

class MarkdownParser {
  private tokens: Token[] = [];
  private position: number = 0;

  // Tokenize markdown text
  tokenize(markdown: string): Token[] {
    const lines = markdown.split("\n");
    this.tokens = [];

    for (const line of lines) {
      if (!line.trim()) {
        this.tokens.push({ type: "blank", content: "", raw: line });
        continue;
      }

      // Headings: # ## ###
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch && headingMatch[1] && headingMatch[2]) {
        this.tokens.push({
          type: "heading",
          level: headingMatch[1].length,
          content: headingMatch[2],
          raw: line,
        });
        continue;
      }

      // Code blocks: ```
      if (line.match(/^```/)) {
        this.tokens.push({
          type: "code_fence",
          content: line.replace(/^```/, "").trim(),
          raw: line,
        });
        continue;
      }

      // Unordered lists: - or *
      const unorderedMatch = line.match(/^[\s]*[-*]\s+(.+)$/);
      if (unorderedMatch && unorderedMatch[1]) {
        const indentMatch = line.match(/^(\s*)/);
        const indent = indentMatch?.[1]?.length ?? 0;
        this.tokens.push({
          type: "list_item",
          ordered: false,
          level: Math.floor(indent / 2),
          content: unorderedMatch[1],
          raw: line,
        });
        continue;
      }

      // Ordered lists: 1. 2. etc
      const orderedMatch = line.match(/^[\s]*(\d+)\.\s+(.+)$/);
      if (orderedMatch && orderedMatch[2]) {
        const indentMatch = line.match(/^(\s*)/);
        const indent = indentMatch?.[1]?.length ?? 0;
        this.tokens.push({
          type: "list_item",
          ordered: true,
          level: Math.floor(indent / 2),
          content: orderedMatch[2],
          raw: line,
        });
        continue;
      }

      // Blockquotes: >
      if (line.match(/^>\s/)) {
        this.tokens.push({
          type: "blockquote",
          content: line.replace(/^>\s*/, ""),
          raw: line,
        });
        continue;
      }

      // Horizontal rules: ---, ***, ___
      if (line.match(/^([-*_])\1{2,}$/)) {
        this.tokens.push({
          type: "horizontal_rule",
          content: "",
          raw: line,
        });
        continue;
      }

      // Default to paragraph
      this.tokens.push({
        type: "paragraph",
        content: line,
        raw: line,
      });
    }

    return this.tokens;
  }

  // Parse inline elements (bold, italic, code, links)
  parseInline(text: string): string {
    let result = text;

    // Bold: **text** or __text__
    result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    result = result.replace(/__(.+?)__/g, "<strong>$1</strong>");

    // Italic: *text* or _text_
    result = result.replace(/\*(.+?)\*/g, "<em>$1</em>");
    result = result.replace(/_(.+?)_/g, "<em>$1</em>");

    // Inline code: `text`
    result = result.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Links: [text](url)
    result = result.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');

    return result;
  }

  // Convert tokens to AST
  toAST(): ASTNode[] {
    const ast: ASTNode[] = [];
    let i = 0;
    let inCodeBlock = false;
    let codeContent = "";
    let codeLang = "";

    while (i < this.tokens.length) {
      const token = this.tokens[i];
      if (!token) {
        i++;
        continue;
      }

      if (token.type === "code_fence") {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLang = token.content;
          codeContent = "";
        } else {
          inCodeBlock = false;
          ast.push({
            type: "code",
            content: codeContent.trim(),
          });
        }
        i++;
        continue;
      }

      if (inCodeBlock) {
        codeContent += token.raw + "\n";
        i++;
        continue;
      }

      if (token.type === "blank") {
        i++;
        continue;
      }

      if (token.type === "heading") {
        ast.push({
          type: "heading",
          level: token.level,
          content: this.parseInline(token.content!),
        });
      } else if (token.type === "list_item") {
        // Group list items
        const listItems: ASTNode[] = [];
        const ordered = token.ordered;
        const baseLevel = token.level ?? 0;

        while (i < this.tokens.length) {
          const item = this.tokens[i];
          if (!item || item.type !== "list_item") {
            break;
          }
          if (item.ordered === ordered && (item.level ?? 0) === baseLevel) {
            listItems.push({
              type: "list_item",
              content: this.parseInline(item.content!),
            });
            i++;
          } else {
            break;
          }
        }

        ast.push({
          type: ordered ? "ol" : "ul",
          children: listItems,
        });
        continue;
      } else if (token.type === "blockquote") {
        ast.push({
          type: "blockquote",
          content: this.parseInline(token.content!),
        });
      } else if (token.type === "horizontal_rule") {
        ast.push({
          type: "hr",
        });
      } else if (token.type === "paragraph") {
        ast.push({
          type: "paragraph",
          content: this.parseInline(token.content!),
        });
      }

      i++;
    }

    return ast;
  }

  // Convert AST to HTML
  toHTML(ast: ASTNode[]): string {
    return ast.map((node) => this.nodeToHTML(node)).join("\n");
  }

  private nodeToHTML(node: ASTNode): string {
    switch (node.type) {
      case "heading":
        return `<h${node.level}>${node.content}</h${node.level}>`;
      case "paragraph":
        return `<p>${node.content}</p>`;
      case "ul":
        return `<ul>${node.children?.map((item) => `<li>${item.content}</li>`).join("")}</ul>`;
      case "ol":
        return `<ol>${node.children?.map((item) => `<li>${item.content}</li>`).join("")}</ol>`;
      case "blockquote":
        return `<blockquote>${node.content}</blockquote>`;
      case "code":
        return `<pre><code>${this.escapeHTML(node.content || "")}</code></pre>`;
      case "hr":
        return "<hr />";
      default:
        return "";
    }
  }

  private escapeHTML(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
}

// Example usage
const markdown = `
# Hello World

This is a **bold** text and this is *italic*.

## Features

- Parse headings
- Support lists
- Inline code: \`const x = 1\`
- [Links](https://example.com)

### Code Example

\`\`\`typescript
const greeting = "Hello, Markdown!";
console.log(greeting);
\`\`\`

> This is a blockquote

---

Regular paragraph with **bold**, *italic*, and \`inline code\`.
`;

const parser = new MarkdownParser();
parser.tokenize(markdown);
const ast = parser.toAST();
const html = parser.toHTML(ast);

console.log("=== HTML Output ===");
console.log(html);
console.log("\n=== AST Output ===");
console.log(JSON.stringify(ast, null, 2));
