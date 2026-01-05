import type { ASTNode, Token, Footnotes } from "./types.ts";

// AST Generator - Converts Token stream to AST
export class ASTGenerator {
  public footnotes: Footnotes = {};
  // Build nested list structure from tokens
  private buildListTree(
    tokens: Token[],
    startIndex: number,
    parentOrdered?: boolean,
  ): { node: ASTNode; nextIndex: number } {
    const listItems: ASTNode[] = [];
    let i = startIndex;
    const baseLevel = tokens[i]?.level ?? 0;
    const isOrdered = parentOrdered ?? tokens[i]?.ordered ?? false;

    while (i < tokens.length) {
      const token = tokens[i];
      if (!token || token.type !== "list_item") {
        break;
      }

      const currentLevel = token.level ?? 0;

      if (currentLevel === baseLevel) {
        const listItem: ASTNode = {
          type: "list_item",
          content: this.parseInline(token.content ?? ""),
          checked: token.checked,
          children: [],
        };

        i++;

        // Check for nested list (higher indentation level)
        if (i < tokens.length) {
          const nextToken = tokens[i];
          if (
            nextToken?.type === "list_item" &&
            (nextToken.level ?? 0) > currentLevel
          ) {
            const nestedResult = this.buildListTree(
              tokens,
              i,
              nextToken.ordered,
            );
            listItem.children = [nestedResult.node];
            i = nestedResult.nextIndex;
          }
        }

        listItems.push(listItem);
      } else if (currentLevel > baseLevel) {
        // This shouldn't happen in well-formed input, skip it
        i++;
      } else {
        // currentLevel < baseLevel, return to parent
        break;
      }
    }

    return {
      node: {
        type: isOrdered ? "ol" : "ul",
        children: listItems,
      },
      nextIndex: i,
    };
  }

  // Parse inline elements (bold, italic, code, links, strikethrough, footnotes)
  private parseInline(text: string): string {
    let result = text;

    // First, handle escape sequences: \X becomes a placeholder to preserve it
    const escapeMap = new Map<string, string>();
    let escapeIndex = 0;
    result = result.replace(/\\(.)/g, (match, char) => {
      const placeholder = `\u0001ESCAPE${escapeIndex}\u0002`;
      escapeMap.set(placeholder, char);
      escapeIndex++;
      return placeholder;
    });

    // Handle footnote references: [^id]
    result = result.replace(/\[\^([^\]]+)\]/g, (match, id) => {
      const placeholder = `\u0001FOOTNOTE${id}\u0002`;
      return placeholder;
    });

    // Bold + Italic: ***text*** or ___text___
    result = result.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
    result = result.replace(/___(.+?)___/g, "<strong><em>$1</em></strong>");

    // Bold: **text** or __text__
    result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    result = result.replace(/__(.+?)__/g, "<strong>$1</strong>");

    // Italic: *text* or _text_
    result = result.replace(/\*(.+?)\*/g, "<em>$1</em>");
    result = result.replace(/_(.+?)_/g, "<em>$1</em>");

    // Strikethrough: ~~text~~
    result = result.replace(/~~(.+?)~~/g, "<del>$1</del>");

    // Inline code: `text`
    result = result.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Links: [text](url)
    result = result.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');

    // Restore footnote references as proper links
    result = result.replace(/\u0001FOOTNOTE([^\u0002]+)\u0002/g, (match, id) => {
      if (this.footnotes[id]) {
        return `<sup><a href="#footnote-${id}" id="ref-${id}">[${id}]</a></sup>`;
      }
      return match;
    });

    // Finally, restore escaped characters
    escapeMap.forEach((char, placeholder) => {
      result = result.split(placeholder).join(char);
    });

    return result;
  }

  // Convert tokens to AST
  generate(tokens: Token[], footnotes: Footnotes = {}): ASTNode[] {
    const ast: ASTNode[] = [];
    let i = 0;
    let inCodeBlock = false;
    let codeContent = "";
    this.footnotes = footnotes;

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
        // Build nested list structure
        const listTree = this.buildListTree(tokens, i, token.ordered);
        ast.push(listTree.node);
        i = listTree.nextIndex;
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
