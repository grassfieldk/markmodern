import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ASTNode, Footnotes } from "./types";

// HTML Document options
export interface DocumentOptions {
  title?: string;
  cssFile?: string;
  embedCss?: boolean;
  lang?: string;
}

// HTML Serializer - Converts AST to HTML
export class HTMLSerializer {
  private footnotes: Footnotes = {};

  // Serialize to complete HTML document
  serializeDocument(
    ast: ASTNode[],
    footnotes: Footnotes = {},
    options: DocumentOptions = {},
  ): string {
    const {
      title = "Markmodern Document",
      cssFile = "style.css",
      embedCss = false,
      lang = "ja",
    } = options;

    const bodyContent = this.serialize(ast, footnotes);

    let headContent = `  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHTML(title)}</title>`;

    if (embedCss) {
      try {
        const cssPath = resolve(process.cwd(), cssFile);
        const cssContent = readFileSync(cssPath, "utf-8");
        headContent += `
  <style>
${cssContent}
  </style>`;
      } catch (_err) {
        // If CSS file not found, fall back to link
        headContent += `
  <link rel="stylesheet" href="${cssFile}">`;
      }
    } else {
      headContent += `
  <link rel="stylesheet" href="${cssFile}">`;
    }

    return `<!DOCTYPE html>
<html lang="${lang}">
<head>
${headContent}
</head>
<body>
${bodyContent}
</body>
</html>`;
  }

  // Serialize to HTML fragment (for console output)
  serialize(ast: ASTNode[], footnotes: Footnotes = {}): string {
    this.footnotes = footnotes;
    let html = ast.map((node) => this.nodeToHTML(node)).join("\n");

    // Append footnotes section if there are any
    if (Object.keys(this.footnotes).length > 0) {
      html += '\n<div class="footnotes"><ol>';
      Object.entries(this.footnotes).forEach(([id, content]) => {
        html += `<li id="footnote-${id}">${content} <a href="#ref-${id}">↩</a></li>`;
      });
      html += "</ol></div>";
    }

    return html;
  }

  private nodeToHTML(node: ASTNode): string {
    switch (node.type) {
      case "heading":
        return `<h${node.level}>${node.content}</h${node.level}>`;
      case "paragraph":
        return `<p>${node.content}</p>`;
      case "ul":
        return `<ul>${node.children?.map((item) => this.renderListItem(item)).join("")}</ul>`;
      case "ol":
        return `<ol>${node.children?.map((item) => this.renderListItem(item)).join("")}</ol>`;
      case "dl":
        return `<dl>${node.children?.map((item) => this.nodeToHTML(item)).join("")}</dl>`;
      case "dt":
        return `<dt>${node.content}</dt>`;
      case "dd":
        return `<dd>${node.content}</dd>`;
      case "blockquote":
        return `<blockquote>${node.content}</blockquote>`;
      case "image_captioned":
        return `<figure><img src="${node.id}" alt="${node.content}" /><figcaption>${node.content}</figcaption></figure>`;
      case "admonition":
        return this.admonitionToHTML(node);
      case "details":
        return this.detailsToHTML(node);
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

  private admonitionToHTML(node: ASTNode): string {
    const admonType = node.id ?? "note";
    const admonSubtype = node.headers?.[0] ?? "";
    const content =
      node.children?.map((child) => this.nodeToHTML(child)).join("\n") ?? "";
    const classes = `admonition admonition-${admonType}${admonSubtype ? ` admonition-${admonSubtype}` : ""}`;
    return `<aside class="${classes}">\n${content}\n</aside>`;
  }

  private detailsToHTML(node: ASTNode): string {
    const summary = node.content ?? "";
    const content =
      node.children?.map((child) => this.nodeToHTML(child)).join("\n") ?? "";
    return `<details>\n<summary>${summary}</summary>\n${content}\n</details>`;
  }

  private tableToHTML(node: ASTNode): string {
    if (!node.headers || !node.rows || !node.alignments) return "";

    const headerHTML = this.renderTableHeaders(node.headers, node.alignments);
    const rowsHTML = this.renderTableRows(node.rows, node.alignments);

    return `<table><thead><tr>${headerHTML}</tr></thead><tbody>${rowsHTML}</tbody></table>`;
  }

  private renderTableHeaders(headers: string[], alignments: string[]): string {
    return headers
      .map((header, index) => {
        const align = alignments[index];
        const style =
          align && align !== "left" ? ` style="text-align: ${align}"` : "";
        return `<th${style}>${header}</th>`;
      })
      .join("");
  }

  private renderTableRows(rows: string[][], alignments: string[]): string {
    return rows
      .map((row) => {
        const cells = row
          .map((cell, index) => {
            const align = alignments[index];
            const style =
              align && align !== "left" ? ` style="text-align: ${align}"` : "";
            return `<td${style}>${cell}</td>`;
          })
          .join("");
        return `<tr>${cells}</tr>`;
      })
      .join("");
  }

  private renderListItem(item: ASTNode): string {
    let html = "<li>";

    // Add checkbox if present
    if (item.checked !== undefined) {
      const checkbox = item.checked ? "☑" : "☐";
      html += `${checkbox} `;
    }

    // Add content
    html += item.content ?? "";

    // Add nested list if present
    if (item.children && item.children.length > 0) {
      const nestedList = item.children[0];
      if (nestedList) {
        html += this.nodeToHTML(nestedList);
      }
    }

    html += "</li>";
    return html;
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
