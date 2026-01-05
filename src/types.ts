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
};
