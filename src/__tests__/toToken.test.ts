import { describe, expect, test } from "bun:test";
import { Tokenizer } from "../toToken";

describe("Tokenizer", () => {
  const tokenizer = new Tokenizer();

  test("should tokenize simple heading", () => {
    const tokens = tokenizer.tokenize("# Hello World");

    expect(tokens).toEqual([
      {
        type: "heading",
        content: "Hello World",
        level: 1,
        raw: "# Hello World",
      },
    ]);
  });

  test("should tokenize multiple headings", () => {
    const tokens = tokenizer.tokenize("# H1\n## H2\n### H3");

    expect(tokens).toEqual([
      {
        type: "heading",
        content: "H1",
        level: 1,
        raw: "# H1",
      },
      {
        type: "heading",
        content: "H2",
        level: 2,
        raw: "## H2",
      },
      {
        type: "heading",
        content: "H3",
        level: 3,
        raw: "### H3",
      },
    ]);
  });

  test("should tokenize paragraph", () => {
    const tokens = tokenizer.tokenize("This is a paragraph.");

    expect(tokens).toEqual([
      {
        type: "paragraph",
        content: "This is a paragraph.",
        raw: "This is a paragraph.",
      },
    ]);
  });

  test("should tokenize code block", () => {
    const tokens = tokenizer.tokenize("```\nconst x = 1;\n```");

    expect(tokens).toEqual([
      {
        type: "code_fence",
        content: "",
        level: 3,
        raw: "```",
      },
      {
        type: "paragraph",
        content: "const x = 1;",
        raw: "const x = 1;",
      },
      {
        type: "code_fence",
        content: "",
        level: 3,
        raw: "```",
      },
    ]);
  });

  test("should tokenize list", () => {
    const tokens = tokenizer.tokenize("- Item 1\n- Item 2");

    expect(tokens).toEqual([
      {
        type: "list_item",
        content: "Item 1",
        level: 0,
        ordered: false,
        raw: "- Item 1",
      },
      {
        type: "list_item",
        content: "Item 2",
        level: 0,
        ordered: false,
        raw: "- Item 2",
      },
    ]);
  });
});
