// Markdown Parser

type Token = {
  type: string;
  content: string;
  level?: number;
  ordered?: boolean;
  raw: string;
  headers?: string[];
  rows?: string[][];
  alignments?: string[];
};

type ASTNode = {
  type: string;
  children?: ASTNode[];
  content?: string;
  level?: number;
  ordered?: boolean;
  headers?: string[];
  rows?: string[][];
  alignments?: string[];
};

class MarkdownParser {
  private tokens: Token[] = [];
  private position: number = 0;

  // Tokenize markdown text
  tokenize(markdown: string): Token[] {
    const lines = markdown.split("\n");
    this.tokens = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      if (!line.trim()) {
        this.tokens.push({ type: "blank", content: "", raw: line });
        i++;
        continue;
      }

      // Check for table
      if (line.includes("|") && !line.startsWith("```") && !line.startsWith(">") && !line.match(/^[\s]*[-*]\s/) && !line.match(/^[\s]*(\d+)\.\s/)) {
        const tableResult = this.parseTable(lines, i);
        if (tableResult) {
          this.tokens.push(tableResult.token);
          i = tableResult.newIndex;
          continue;
        }
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
        i++;
        continue;
      }

      // Code blocks: ```
      if (line.match(/^```/)) {
        this.tokens.push({
          type: "code_fence",
          content: line.replace(/^```/, "").trim(),
          raw: line,
        });
        i++;
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
        i++;
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
        i++;
        continue;
      }

      // Blockquotes: >
      if (line.match(/^>\s/)) {
        this.tokens.push({
          type: "blockquote",
          content: line.replace(/^>\s*/, ""),
          raw: line,
        });
        i++;
        continue;
      }

      // Horizontal rules: ---, ***, ___
      if (line.match(/^([-*_])\1{2,}$/)) {
        this.tokens.push({
          type: "horizontal_rule",
          content: "",
          raw: line,
        });
        i++;
        continue;
      }

      // Default to paragraph
      this.tokens.push({
        type: "paragraph",
        content: line,
        raw: line,
      });
      i++;
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
      } else if (token.type === "table") {
        ast.push({
          type: "table",
          headers: token.headers,
          rows: token.rows,
          alignments: token.alignments,
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
      case "table":
        return this.tableToHTML(node);
      case "hr":
        return "<hr />";
      default:
        return "";
    }
  }

  private tableToHTML(node: ASTNode): string {
    if (!node.headers || !node.rows || !node.alignments) return "";

    const headerHTML = node.headers
      .map((header, index) => {
        const align = node.alignments![index];
        const style = align !== "left" ? ` style="text-align: ${align}"` : "";
        return `<th${style}>${this.parseInline(header)}</th>`;
      })
      .join("");

    const rowsHTML = node.rows
      .map(row =>
        row.map((cell, index) => {
          const align = node.alignments![index];
          const style = align !== "left" ? ` style="text-align: ${align}"` : "";
          return `<td${style}>${this.parseInline(cell)}</td>`;
        }).join("")
      )
      .map(rowHTML => `<tr>${rowHTML}</tr>`)
      .join("");

    return `<table><thead><tr>${headerHTML}</tr></thead><tbody>${rowsHTML}</tbody></table>`;
  }

  private parseTable(lines: string[], startIndex: number): { token: Token; newIndex: number } | null {
    const headerLine = lines[startIndex];
    if (!headerLine.includes("|")) return null;

    // Check if next line is separator
    if (startIndex + 1 >= lines.length) return null;
    const separatorLine = lines[startIndex + 1];

    if (!this.isTableSeparator(separatorLine)) return null;

    // Parse headers
    const headers = this.parseTableRow(headerLine);
    const alignments = this.parseTableAlignments(separatorLine);

    // Parse rows
    const rows: string[][] = [];
    let currentIndex = startIndex + 2;

    while (currentIndex < lines.length) {
      const line = lines[currentIndex];
      if (!line.trim() || !line.includes("|")) break;

      const row = this.parseTableRow(line);
      if (row.length === 0) break;

      rows.push(row);
      currentIndex++;
    }

    return {
      token: {
        type: "table",
        content: "",
        raw: lines.slice(startIndex, currentIndex).join("\n"),
        headers,
        rows,
        alignments,
      },
      newIndex: currentIndex,
    };
  }

  private isTableSeparator(line: string): boolean {
    if (!line.includes("|")) return false;
    const cells = line.split("|").slice(1, -1);
    return cells.every(cell => cell.trim().match(/^:?-+:?$/));
  }

  private parseTableRow(line: string): string[] {
    return line.split("|")
      .slice(1, -1)
      .map(cell => cell.trim());
  }

  private parseTableAlignments(line: string): string[] {
    return line.split("|")
      .slice(1, -1)
      .map(cell => {
        const trimmed = cell.trim();
        if (trimmed.startsWith(":") && trimmed.endsWith(":")) return "center";
        if (trimmed.startsWith(":")) return "left";
        if (trimmed.endsWith(":")) return "right";
        return "left";
      });
  }
}

// Example usage
import { readFileSync } from "fs";

// Get input file from command line argument
const inputFile = process.argv[2];
if (!inputFile) {
  console.error("Usage: bun index.ts <markdown-file>");
  process.exit(1);
}

const markdown = readFileSync(inputFile, "utf-8");

const parser = new MarkdownParser();
parser.tokenize(markdown);
const ast = parser.toAST();
const html = parser.toHTML(ast);

console.log("=== HTML Output ===");
console.log(html);
console.log("\n=== AST Output ===");
console.log(JSON.stringify(ast, null, 2));
