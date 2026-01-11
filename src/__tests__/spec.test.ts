import { describe, expect, test } from "bun:test";
import { ASTGenerator } from "../toAST";
import { HTMLSerializer } from "../toHTML";
import { Tokenizer } from "../toToken";

/**
 * CommonMark-style specification test case
 * Each test verifies that specific markdown input produces expected HTML output
 */
interface TestCase {
  name: string;
  markdown: string;
  expected_html: string;
  description?: string;
}

const testCases: TestCase[] = [
  // Headings
  {
    name: "h1",
    markdown: "# Hello",
    expected_html: "<h1>Hello</h1>",
  },
  {
    name: "h2",
    markdown: "## Hello",
    expected_html: "<h2>Hello</h2>",
  },
  {
    name: "h3",
    markdown: "### Hello",
    expected_html: "<h3>Hello</h3>",
  },

  // Text formatting
  {
    name: "bold",
    markdown: "**bold**",
    expected_html: "<p><strong>bold</strong></p>",
  },
  {
    name: "italic",
    markdown: "*italic*",
    expected_html: "<p><em>italic</em></p>",
  },
  {
    name: "bold_italic",
    markdown: "***bold italic***",
    expected_html: "<p><strong><em>bold italic</em></strong></p>",
  },
  {
    name: "code_span",
    markdown: "`code`",
    expected_html: "<p><code>code</code></p>",
  },

  // Paragraphs
  {
    name: "simple_paragraph",
    markdown: "This is a paragraph.",
    expected_html: "<p>This is a paragraph.</p>",
  },

  // Code blocks
  {
    name: "code_block",
    markdown: "```\nconst x = 1;\n```",
    expected_html: "<pre><code>const x = 1;</code></pre>",
  },

  // Lists
  {
    name: "unordered_list",
    markdown: "- Item 1\n- Item 2",
    expected_html: "<ul><li>Item 1</li><li>Item 2</li></ul>",
  },
  {
    name: "ordered_list",
    markdown: "1. Item 1\n2. Item 2",
    expected_html: "<ol><li>Item 1</li><li>Item 2</li></ol>",
  },

  // Links
  {
    name: "link",
    markdown: "[text](url)",
    expected_html: '<p><a href="url">text</a></p>',
  },

  // Images
  {
    name: "image",
    markdown: "![alt](src)",
    expected_html: '<p><img src="src" alt="alt" /></p>',
  },

  // Blockquotes
  {
    name: "blockquote",
    markdown: "> Quote",
    expected_html: "<blockquote>Quote</blockquote>",
  },

  // Tables
  {
    name: "table",
    markdown: "| A | B |\n|---|---|\n| 1 | 2 |",
    expected_html:
      "<table><thead><tr><th>A</th><th>B</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table>",
  },

  // Escaped characters
  {
    name: "escaped_asterisk",
    markdown: "\\*not italic\\*",
    expected_html: "<p>*not italic*</p>",
  },
  {
    name: "escaped_underscore",
    markdown: "\\_not underline\\_",
    expected_html: "<p>_not underline_</p>",
  },

  // Extended syntax
  {
    name: "details_block",
    markdown: "=== Summary ===\nContent\n===",
    expected_html:
      "<details>\n<summary>Summary ===</summary>\n<p>Content</p>\n</details>",
  },
  {
    name: "admonition_info",
    markdown: "::: info\nMessage\n:::",
    expected_html: "<p>::: info</p>\n<p>Message</p>\n<p>:::</p>",
  },
  {
    name: "ruby_text",
    markdown: "{漢字}(かんじ)",
    expected_html: "<p><ruby>漢字<rt>かんじ</rt></ruby></p>",
  },
];

/**
 * Test all CommonMark specification cases
 * Each test case validates that markdown input produces the expected HTML output
 */
describe("Specification Tests", () => {
  const tokenizer = new Tokenizer();
  const astGenerator = new ASTGenerator();
  const htmlSerializer = new HTMLSerializer();

  /**
   * Parse markdown to HTML using the full pipeline
   */
  function parseToHTML(markdown: string): string {
    const tokens = tokenizer.tokenize(markdown);
    const ast = astGenerator.generate(tokens);
    return htmlSerializer.serialize(ast);
  }

  testCases.forEach((testCase) => {
    const displayName = `${testCase.name}: ${testCase.markdown.replace(/\n/g, "\\n")}`;
    test(displayName, () => {
      const html = parseToHTML(testCase.markdown);
      expect(html).toBe(testCase.expected_html);
    });
  });
});
