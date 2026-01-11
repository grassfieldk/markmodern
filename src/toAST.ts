import type { ASTNode, Footnotes, Token } from "./types";

// AST Generator - Converts Token stream to AST
export class ASTGenerator {
  public footnotes: Footnotes = {};

  // Process block content recursively (for admonition, details, etc.)
  private processBlockContent(content: string): ASTNode[] {
    const tokenizer = new (require("./toToken").Tokenizer)();
    const innerTokens = tokenizer.tokenize(content);
    const generator = new ASTGenerator();
    return generator.generate(innerTokens, this.footnotes);
  }

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

  // Parse inline elements (bold, italic, code, links, strikethrough, footnotes, ruby)
  private parseInline(text: string): string {
    let result = text;

    // First, handle escape sequences: \X becomes a placeholder to preserve it
    const escapeMap = new Map<string, string>();
    let escapeIndex = 0;
    result = result.replace(/\\(.)/g, (_match, char) => {
      const placeholder = `\uFFF0ESCAPE${escapeIndex}\uFFF1`;
      escapeMap.set(placeholder, char);
      escapeIndex++;
      return placeholder;
    });

    // Handle footnote references: [^id]
    result = result.replace(/\[\^([^\]]+)\]/g, (_match, id) => {
      const placeholder = `\uFFF0FOOTNOTE${id}\uFFF1`;
      return placeholder;
    });

    // Ruby/Furigana: {kanji}(kana)
    result = result.replace(
      /\{([^}]+)\}\(([^)]+)\)/g,
      "<ruby>$1<rt>$2</rt></ruby>",
    );

    // Bold + Italic: ***text*** or ___text___
    result = result.replace(
      /\*\*\*(.+?)\*\*\*/g,
      "<strong><em>$1</em></strong>",
    );
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

    // Images: ![alt](url)
    result = result.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      '<img src="$2" alt="$1" />',
    );

    // Links: [text](url)
    result = result.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');

    // Restore footnote references as proper links
    result = result.replace(
      /\uFFF0FOOTNOTE([^\uFFF1]+)\uFFF1/g,
      (match, id) => {
        if (this.footnotes[id]) {
          return `<sup><a href="#footnote-${id}" id="ref-${id}">[${id}]</a></sup>`;
        }
        return match;
      },
    );

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
    let codeFenceLength = 0; // Track opening fence length
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
          codeFenceLength = token.level || 3; // Store opening fence length
        } else {
          // Close only if fence is same or longer length
          const closingLength = token.level || 3;
          if (closingLength >= codeFenceLength) {
            inCodeBlock = false;
            ast.push({
              type: "code",
              content: codeContent.trim(),
            });
          } else {
            // Treat as code content
            codeContent += `${token.raw}\n`;
          }
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

      if (token.type === "image_captioned") {
        ast.push({
          type: "image_captioned",
          content: token.content, // alt text / title
          id: token.id, // url
        });
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
      } else if (token.type === "admonition") {
        // Process admonition block content recursively
        const admonType = token.id ?? "note";
        const admonKind = token.headers?.[0] ?? "info";
        const innerAST = this.processBlockContent(token.content ?? "");

        ast.push({
          type: "admonition",
          id: admonType,
          headers: [admonKind],
          children: innerAST,
        });
      } else if (token.type === "details") {
        // Process details block content recursively
        const summary = this.parseInline(token.id ?? "");
        const innerAST = this.processBlockContent(token.content ?? "");

        ast.push({
          type: "details",
          content: summary,
          children: innerAST,
        });
      } else if (token.type === "horizontal_rule") {
        ast.push({
          type: "hr",
        });
      } else if (token.type === "definition") {
        // Skip, will be grouped with preceding paragraph as definition list
      } else if (token.type === "paragraph") {
        // Check if next token(s) are definitions
        const definitions: string[] = [];
        const term = this.parseInline(token.content ?? "");
        let j = i + 1;
        let hasDefinition = false;

        while (j < tokens.length) {
          const nextToken = tokens[j];
          if (nextToken?.type === "definition") {
            definitions.push(this.parseInline(nextToken.content ?? ""));
            hasDefinition = true;
            j++;
          } else if (nextToken?.type === "blank") {
            j++;
            break;
          } else {
            break;
          }
        }

        if (hasDefinition) {
          // Create definition list node with all definitions for this term
          const dlChildren: ASTNode[] = [{ type: "dt", content: term }];
          definitions.forEach((def) => {
            dlChildren.push({ type: "dd", content: def });
          });
          ast.push({
            type: "dl",
            children: dlChildren,
          });
          i = j - 1;
        } else {
          // Regular paragraph
          ast.push({
            type: "paragraph",
            content: term,
          });
        }
      }

      i++;
    }

    return ast;
  }
}
