import type { ASTNode, Token } from "./types.ts";

// AST Generator - Converts Token stream to AST
export class ASTGenerator {
  // Parse inline elements (bold, italic, code, links)
  private parseInline(text: string): string {
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
  generate(tokens: Token[]): ASTNode[] {
    const ast: ASTNode[] = [];
    let i = 0;
    let inCodeBlock = false;
    let codeContent = "";

    while (i < tokens.length) {
      const token = tokens[i];
      if (!token) {
        i++;
        continue;
      }

      if (token.type === "code_fence") {
        if (!inCodeBlock) {
          inCodeBlock = true;
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
        codeContent += `${token.raw}\n`;
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
          content: this.parseInline(token.content ?? ""),
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

        while (i < tokens.length) {
          const item = tokens[i];
          if (!item || item.type !== "list_item") {
            break;
          }
          if (item.ordered === ordered && (item.level ?? 0) === baseLevel) {
            listItems.push({
              type: "list_item",
              content: this.parseInline(item.content ?? ""),
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
          content: this.parseInline(token.content ?? ""),
        });
      } else if (token.type === "horizontal_rule") {
        ast.push({
          type: "hr",
        });
      } else if (token.type === "paragraph") {
        ast.push({
          type: "paragraph",
          content: this.parseInline(token.content ?? ""),
        });
      }

      i++;
    }

    return ast;
  }
}
