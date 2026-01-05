import { readFileSync } from "fs";
import { ASTGenerator } from "./src/toAST.ts";
import { HTMLSerializer } from "./src/toHTML.ts";
import { Tokenizer } from "./src/toToken.ts";

// Get input file and output format from command line arguments
const inputFile = process.argv[2];
const outputFormatArg = process.argv[3];

if (!inputFile) {
  console.error(
    "Usage: bun index.ts <markdown-file> [-t|--token|-a|--ast|-h|--html]",
  );
  process.exit(1);
}

// Determine output format (default: html)
let outputFormat = "html";
if (outputFormatArg === "-t" || outputFormatArg === "--token") {
  outputFormat = "token";
}
if (outputFormatArg === "-a" || outputFormatArg === "--ast") {
  outputFormat = "ast";
}
if (outputFormatArg === "-h" || outputFormatArg === "--html") {
  outputFormat = "html";
}
if (outputFormatArg !== undefined) {
  console.error(
    "Invalid format. Use: -t|--token, -a|--ast, or -h|--html (default)",
  );
  process.exit(1);
}

// Read markdown file
const markdown = readFileSync(inputFile, "utf-8");

// Process through pipeline
const tokenizer = new Tokenizer();
const tokens = tokenizer.tokenize(markdown);

if (outputFormat === "token") {
  console.log("=== Token Output ===");
  console.log(JSON.stringify(tokens, null, 2));
  process.exit(0);
}

const astGenerator = new ASTGenerator();
const ast = astGenerator.generate(tokens);

if (outputFormat === "ast") {
  console.log("=== AST Output ===");
  console.log(JSON.stringify(ast, null, 2));
  process.exit(0);
}

// Default: HTML output
const htmlSerializer = new HTMLSerializer();
const html = htmlSerializer.serialize(ast);

console.log("=== HTML Output ===");
console.log(html);
