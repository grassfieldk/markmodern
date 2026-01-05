import type { ASTNode } from "./types.ts";

// HTML Serializer - Converts AST to HTML
export class HTMLSerializer {
  serialize(ast: ASTNode[]): string {
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
        return `<th${style}>${header}</th>`;
      })
      .join("");

    const rowsHTML = node.rows
      .map((row) =>
        row
          .map((cell, index) => {
            const align = node.alignments![index];
            const style =
              align !== "left" ? ` style="text-align: ${align}"` : "";
            return `<td${style}>${cell}</td>`;
          })
          .join(""),
      )
      .map((rowHTML) => `<tr>${rowHTML}</tr>`)
      .join("");

    return `<table><thead><tr>${headerHTML}</tr></thead><tbody>${rowsHTML}</tbody></table>`;
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
