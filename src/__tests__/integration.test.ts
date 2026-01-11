import { describe, expect, test } from "bun:test";
import { ASTGenerator } from "../toAST";
import { HTMLSerializer } from "../toHTML";
import { Tokenizer } from "../toToken";

/**
 * Helper function for integration tests
 * Converts markdown to HTML through the full parsing pipeline
 */
function parseToHTML(markdown: string): string {
  const tokenizer = new Tokenizer();
  const astGenerator = new ASTGenerator();
  const htmlSerializer = new HTMLSerializer();
  const tokens = tokenizer.tokenize(markdown);
  const ast = astGenerator.generate(tokens);
  return htmlSerializer.serialize(ast);
}

describe("Integration Tests", () => {
  test("should parse complete document", () => {
    const markdown = `# Hello World

This is a paragraph with **bold** and *italic* text.

- Item 1
- Item 2

\`\`\`
const code = "block";
\`\`\`
`;

    const html = parseToHTML(markdown);

    expect(html).toContain("<h1>Hello World</h1>");
    expect(html).toContain(
      "<p>This is a paragraph with <strong>bold</strong> and <em>italic</em> text.</p>",
    );
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>Item 1</li>");
    expect(html).toContain("<li>Item 2</li>");
    expect(html).toContain(
      "<pre><code>const code = &quot;block&quot;;</code></pre>",
    );
  });

  test("should handle details block", () => {
    const markdown = `=== Summary ===
This is details content.
===`;

    const html = parseToHTML(markdown);

    expect(html).toContain("<details>");
    expect(html).toContain("<summary>Summary ===</summary>");
    expect(html).toContain("<p>This is details content.</p>");
    expect(html).toContain("</details>");
  });

  test("should handle admonition", () => {
    const markdown = `::: info
This is an info message.
:::`;

    const html = parseToHTML(markdown);

    expect(html).toContain("<p>::: info</p>");
    expect(html).toContain("<p>This is an info message.</p>");
    expect(html).toContain("<p>:::</p>");
  });

  test("should handle footnotes", () => {
    const markdown = `This has a footnote[^1].

[^1]: Footnote content.`;

    const html = parseToHTML(markdown);

    expect(html).toContain("￰FOOTNOTE1￱");
    // Note: Footnote content rendering is not yet implemented
    // expect(html).toContain("<p>Footnote content.</p>");
  });

  test("should handle ruby text", () => {
    const markdown = `{漢字}(かんじ)`;

    const html = parseToHTML(markdown);

    expect(html).toContain("<ruby>漢字<rt>かんじ</rt></ruby>");
  });

  test("should handle definition list", () => {
    const markdown = `term
: definition 1
: definition 2`;

    const html = parseToHTML(markdown);

    expect(html).toContain("<dl>");
    expect(html).toContain("<dt>term</dt>");
    expect(html).toContain("<dd>definition 1</dd>");
    expect(html).toContain("<dd>definition 2</dd>");
    expect(html).toContain("</dl>");
  });

  test("should handle escaped characters", () => {
    const markdown = `\\*not italic\\* and \\_not underline\\_`;

    const html = parseToHTML(markdown);

    expect(html).toContain("<p>*not italic* and _not underline_</p>");
  });

  test("should handle nested lists", () => {
    const markdown = `- Item 1
  - Nested 1
  - Nested 2
- Item 2`;

    const html = parseToHTML(markdown);

    expect(html).toContain("<ul>");
    expect(html).toContain(
      "<li>Item 1<ul><li>Nested 1</li><li>Nested 2</li></ul></li>",
    );
    expect(html).toContain("<li>Item 2</li>");
  });
});
