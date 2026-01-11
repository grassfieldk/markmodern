import { describe, expect, test } from "bun:test";
import { ASTGenerator } from "../toAST";
import { Tokenizer } from "../toToken";

describe("ASTGenerator", () => {
  const tokenizer = new Tokenizer();
  const astGenerator = new ASTGenerator();

  test("should build AST for simple heading", () => {
    const tokens = tokenizer.tokenize("# Hello World");
    const ast = astGenerator.generate(tokens);

    expect(ast).toEqual([
      {
        type: "heading",
        content: "Hello World",
        level: 1,
      },
    ]);
  });

  test("should build AST for paragraph", () => {
    const tokens = tokenizer.tokenize("This is a paragraph.");
    const ast = astGenerator.generate(tokens);

    expect(ast).toEqual([
      {
        type: "paragraph",
        content: "This is a paragraph.",
      },
    ]);
  });

  test("should build AST for bold text", () => {
    const tokens = tokenizer.tokenize("**bold** text");
    const ast = astGenerator.generate(tokens);

    expect(ast).toEqual([
      {
        type: "paragraph",
        content: "<strong>bold</strong> text",
      },
    ]);
  });

  test("should build AST for italic text", () => {
    const tokens = tokenizer.tokenize("*italic* text");
    const ast = astGenerator.generate(tokens);

    expect(ast).toEqual([
      {
        type: "paragraph",
        content: "<em>italic</em> text",
      },
    ]);
  });

  test("should build AST for code span", () => {
    const tokens = tokenizer.tokenize("`code` span");
    const ast = astGenerator.generate(tokens);

    expect(ast).toEqual([
      {
        type: "paragraph",
        content: "<code>code</code> span",
      },
    ]);
  });

  test("should build AST for code block", () => {
    const tokens = tokenizer.tokenize("```\nconst x = 1;\n```");
    const ast = astGenerator.generate(tokens);

    expect(ast).toEqual([
      {
        type: "code",
        content: "const x = 1;",
      },
    ]);
  });

  test("should handle escaped characters", () => {
    const tokens = tokenizer.tokenize("\\*not italic\\*");
    const ast = astGenerator.generate(tokens);

    expect(ast).toEqual([
      {
        type: "paragraph",
        content: "*not italic*",
      },
    ]);
  });
});
