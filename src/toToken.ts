import type { Token, Footnotes } from "./types.ts";

// Tokenizer - Converts Markdown text to Token stream
export class Tokenizer {
  private tokens: Token[] = [];
  public footnotes: Footnotes = {};

  tokenize(markdown: string): Token[] {
    const lines = markdown.split("\n");
    this.tokens = [];
    this.footnotes = {};
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      if (!line) {
        i++;
        continue;
      }

      // Skip comments: lines starting with //
      if (line.trim().startsWith("//")) {
        i++;
        continue;
      }

      // Check for footnote definition: [^id]: content
      const footnoteMatch = line.match(/^\[\^([^\]]+)\]:\s+(.+)$/);
      if (footnoteMatch?.[1] && footnoteMatch[2]) {
        this.footnotes[footnoteMatch[1]] = footnoteMatch[2];
        i++;
        continue;
      }

      if (!line.trim()) {
        this.tokens.push({ type: "blank", content: "", raw: line });
        i++;
        continue;
      }

      // Check for table
      if (
        line.includes("|") &&
        !line.startsWith("```") &&
        !line.startsWith(">") &&
        !line.match(/^[\s]*[-*]\s/) &&
        !line.match(/^[\s]*(\d+)\.\s/)
      ) {
        const tableResult = this.parseTable(lines, i);
        if (tableResult) {
          this.tokens.push(tableResult.token);
          i = tableResult.newIndex;
          continue;
        }
      }

      // Headings: # ## ###
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch?.[1] && headingMatch[2]) {
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

      // Unordered lists: - or * or [ ] / [x]
      const unorderedMatch = line.match(
        /^[\s]*[-*]\s+(?:\[([ xX])\]\s+)?(.+)$/,
      );
      if (unorderedMatch?.[2]) {
        const indentMatch = line.match(/^(\s*)/);
        const indent = indentMatch?.[1]?.length ?? 0;
        const checked = unorderedMatch[1]
          ? unorderedMatch[1].toLowerCase() === "x"
          : undefined;
        this.tokens.push({
          type: "list_item",
          ordered: false,
          level: Math.floor(indent / 2),
          content: unorderedMatch[2],
          checked,
          raw: line,
        });
        i++;
        continue;
      }

      // Ordered lists: 1. 2. etc
      const orderedMatch = line.match(/^[\s]*(\d+)\.\s+(.+)$/);
      if (orderedMatch?.[2]) {
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

      // Definition list: :   definition (must follow a term)
      const defMatch = line.match(/^:\s+(.+)$/);
      if (defMatch?.[1]) {
        this.tokens.push({
          type: "definition",
          content: defMatch[1],
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

  private parseTable(
    lines: string[],
    startIndex: number,
  ): { token: Token; newIndex: number } | null {
    const headerLine = lines[startIndex];
    if (!headerLine || !headerLine.includes("|")) return null;

    // Check if next line is separator
    if (startIndex + 1 >= lines.length) return null;
    const separatorLine = lines[startIndex + 1];
    if (!separatorLine) return null;

    if (!this.isTableSeparator(separatorLine)) return null;

    // Parse headers
    const headers = this.parseTableRow(headerLine);
    const alignments = this.parseTableAlignments(separatorLine);

    // Parse rows
    const rows: string[][] = [];
    let currentIndex = startIndex + 2;

    while (currentIndex < lines.length) {
      const line = lines[currentIndex];
      if (!line || !line.trim() || !line.includes("|")) break;

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
    return cells.every((cell) => cell.trim().match(/^:?-+:?$/));
  }

  private parseTableRow(line: string): string[] {
    return line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
  }

  private parseTableAlignments(line: string): string[] {
    return line
      .split("|")
      .slice(1, -1)
      .map((cell) => {
        const trimmed = cell.trim();
        if (trimmed.startsWith(":") && trimmed.endsWith(":")) return "center";
        if (trimmed.startsWith(":")) return "left";
        if (trimmed.endsWith(":")) return "right";
        return "left";
      });
  }
}
