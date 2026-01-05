// Token type - Intermediate representation after tokenization
export type Token = {
  type: string;
  content: string;
  level?: number;
  ordered?: boolean;
  raw: string;
  headers?: string[];
  rows?: string[][];
  alignments?: string[];
  checked?: boolean;
  id?: string; // For footnote reference id
};

// AST Node type - Abstract Syntax Tree representation
export type ASTNode = {
  type: string;
  children?: ASTNode[];
  content?: string;
  level?: number;
  ordered?: boolean;
  headers?: string[];
  rows?: string[][];
  alignments?: string[];
  checked?: boolean;
  id?: string; // For footnote reference id
};

// Footnote definition storage
export type Footnotes = Record<string, string>;

