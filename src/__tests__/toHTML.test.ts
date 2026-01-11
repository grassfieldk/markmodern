import { describe, expect, test } from "bun:test";
import { HTMLSerializer } from "../toHTML";
import type { ASTNode } from "../types";

describe("HTMLSerializer", () => {
  const serializer = new HTMLSerializer();

  test("should serialize heading", () => {
    const ast: ASTNode[] = [
      {
        type: "heading",
        content: "Hello World",
        level: 1,
      },
    ];

    const html = serializer.serialize(ast);
    expect(html).toBe("<h1>Hello World</h1>");
  });

  test("should serialize paragraph", () => {
    const ast: ASTNode[] = [
      {
        type: "paragraph",
        content: "This is a paragraph.",
      },
    ];

    const html = serializer.serialize(ast);
    expect(html).toBe("<p>This is a paragraph.</p>");
  });

  test("should serialize bold text", () => {
    const ast: ASTNode[] = [
      {
        type: "paragraph",
        content: "<strong>bold</strong> text",
      },
    ];

    const html = serializer.serialize(ast);
    expect(html).toBe("<p><strong>bold</strong> text</p>");
  });

  test("should serialize italic text", () => {
    const ast: ASTNode[] = [
      {
        type: "paragraph",
        content: "<em>italic</em> text",
      },
    ];

    const html = serializer.serialize(ast);
    expect(html).toBe("<p><em>italic</em> text</p>");
  });

  test("should serialize code span", () => {
    const ast: ASTNode[] = [
      {
        type: "paragraph",
        content: "<code>code</code> span",
      },
    ];

    const html = serializer.serialize(ast);
    expect(html).toBe("<p><code>code</code> span</p>");
  });

  test("should serialize code block", () => {
    const ast: ASTNode[] = [
      {
        type: "code",
        content: "const x = 1;",
      },
    ];

    const html = serializer.serialize(ast);
    expect(html).toBe("<pre><code>const x = 1;</code></pre>");
  });

  test("should serialize list", () => {
    const ast: ASTNode[] = [
      {
        type: "ul",
        children: [
          {
            type: "list_item",
            content: "Item 1",
          },
          {
            type: "list_item",
            content: "Item 2",
          },
        ],
      },
    ];

    const html = serializer.serialize(ast);
    expect(html).toBe("<ul><li>Item 1</li><li>Item 2</li></ul>");
  });

  test("should serialize document with title", () => {
    const ast: ASTNode[] = [
      {
        type: "heading",
        content: "Test Document",
        level: 1,
      },
    ];

    const html = serializer.serializeDocument(
      ast,
      {},
      { title: "Test Document" },
    );
    expect(html).toContain("<title>Test Document</title>");
    expect(html).toContain("<h1>Test Document</h1>");
  });
});
