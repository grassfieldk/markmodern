import type { ASTNode, Footnotes } from "./types.ts";

// HTML Serializer - Converts AST to HTML
export class HTMLSerializer {
  private footnotes: Footnotes = {};

  serialize(ast: ASTNode[], footnotes: Footnotes = {}): string {
    this.footnotes = footnotes;
    let html = ast.map((node) => this.nodeToHTML(node)).join("\n");

    // Append footnotes section if there are any
    if (Object.keys(this.footnotes).length > 0) {
      html += "\n<div class=\"footnotes\"><ol>";
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
        const align = node.alignments?.[index];
        const style =
          align && align !== "left" ? ` style="text-align: ${align}"` : "";
        return `<th${style}>${header}</th>`;
      })
      .join("");

    const rowsHTML = node.rows
      .map((row) =>
        row
          .map((cell, index) => {
            const align = node.alignments?.[index];
            const style =
              align && align !== "left" ? ` style="text-align: ${align}"` : "";
            return `<td${style}>${cell}</td>`;
          })
          .join(""),
      )
      .map((rowHTML) => `<tr>${rowHTML}</tr>`)
      .join("");

    return `<table><thead><tr>${headerHTML}</tr></thead><tbody>${rowsHTML}</tbody></table>`;
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
      html += this.nodeToHTML(nestedList);
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
