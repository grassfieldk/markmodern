import { readFileSync, writeFileSync } from "node:fs";
import { ASTGenerator } from "./src/toAST";
import { HTMLSerializer } from "./src/toHTML";
import { Tokenizer } from "./src/toToken";

// Get input file and output format from command line arguments
const inputFile = process.argv[2];
const outputFormatArg = process.argv[3];
const outputFileArg = process.argv[4];

if (!inputFile) {
  console.error(
    "Usage: bun index.ts <markdown-file> [-t|--token|-a|--ast|-h|--html] [output-file]",
  );
  process.exit(1);
}

// Determine output format (default: html)
let outputFormat = "html";
let writeToFile = false;

if (outputFormatArg === "-t" || outputFormatArg === "--token") {
  outputFormat = "token";
} else if (outputFormatArg === "-a" || outputFormatArg === "--ast") {
  outputFormat = "ast";
} else if (outputFormatArg === "-h" || outputFormatArg === "--html") {
  outputFormat = "html";
} else if (outputFormatArg === "-f" || outputFormatArg === "--file") {
  outputFormat = "html";
  writeToFile = true;
} else if (outputFormatArg !== undefined) {
  console.error(
    "Invalid format. Use: -t|--token, -a|--ast, -h|--html, or -f|--file (html to file)",
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
const ast = astGenerator.generate(tokens, tokenizer.footnotes);

if (outputFormat === "ast") {
  console.log("=== AST Output ===");
  console.log(JSON.stringify(ast, null, 2));
  process.exit(0);
}

// Default: HTML output
const htmlSerializer = new HTMLSerializer();

if (writeToFile) {
  // Generate complete HTML document with embedded CSS from root
  const html = htmlSerializer.serializeDocument(ast, tokenizer.footnotes, {
    title: inputFile.replace(/\.(mm|md)$/, ""),
    cssFile: "style.css",
    embedCss: true,
  });

  // Determine output file name
  const outputFile = outputFileArg || inputFile.replace(/\.(mm|md)$/, ".html");
  writeFileSync(outputFile, html, "utf-8");
  console.log(`HTML file created: ${outputFile}`);
} else {
  // Console output (fragment only)
  const html = htmlSerializer.serialize(ast, tokenizer.footnotes);
  console.log("=== HTML Output ===");
  console.log(html);
}
