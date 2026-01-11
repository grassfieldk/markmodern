[English](README.md)

# Markmodern

メモや記事作成向けに設計された Markdown ベースのマークアップ言語
拡張子: `.mdn`


## 機能

### Markdown サポート

- 見出し（`#` 〜 `######`）
- リスト
  - 箇条書きリスト（ネスト対応）
  - 番号リスト（ネスト対応）
  - チェックリスト
- コードブロック（3+ backticks、ネスト対応）
- 引用ブロック
- 水平線
- テーブル（配置対応）

### インライン要素

- 太字（`**text**`）
- 斜体（`*text*`）
- 太字+斜体（`***text***`）
- 取り消し線（`~~text~~`）
- インラインコード（`` `text` ``）
- ハイパーリンク（`[text](url)`）
- 画像（`![alt](url)`）
- キャプション付き画像（`-![caption](url)`）

### 拡張構文

- **脚注** - `[^1]` と定義
- **定義リスト** - `term : definition`
- **詳細ブロック** - `===summary ... ===`
- **注釈ブロック** - `:::note [type] ... :::`
  - タイプ: `info`（青）、`warn`（オレンジ）、`alert`（赤）
- **ルビ/ふりがな** - `{漢字}(かんじ)`
- **コメント** - `// comment`
- **エスケープシーケンス** - `\*`、`\#` など


## 使用方法

### コマンドライン

```bash
# HTML をコンソールに出力
npm run start -- <input.mdn>

# HTML をファイルに出力（CSS 埋め込み）
npm run start -- <input.mdn> -f

# トークンストリームとして出力
npm run start -- <input.mdn> -t

# AST として出力
npm run start -- <input.mdn> -a

# HTML フラグメントとして出力
npm run start -- <input.mdn> -h
```


## アーキテクチャ

パーサーは 3 段階のパイプラインを使用します

1. **トークン化** (`Tokenizer`) - Markmodern テキストをトークンストリームに変換
2. **AST 生成** (`ASTGenerator`) - インライン要素の解析を伴う抽象構文木を構築
3. **シリアライズ** (`HTMLSerializer`) - AST を HTML 出力に変換

### 主な設計の特徴

- 複雑なネスト構造のための再帰的ブロック処理
- 可変長の fence 対応コードブロック解析（3+ backticks）
- インデント対応のネスト可能なリスト
- HTML 出力への CSS 埋め込み


## ライセンス

MIT © 2026 GrassfieldK


## 貢献

貢献を歓迎します！ぜひ Pull Request を送ってください。
