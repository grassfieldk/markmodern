# Markmodern

メモや記事作成向けに設計された Markdown ベースのマークアップ言語
拡張子: `.mm`


## 機能

### Markdown サポート

- 見出し
- リスト
  - 箇条書きリスト
  - 番号リスト
  - チェックリスト
- コードブロック
- 引用ブロック
- 水平線
- テーブル

### インライン要素

- 太字
- 斜体
- 太字+斜体
- 取り消し線
- インラインコード
- ハイパーリンク

### 拡張構文

- 脚注/注釈
- 定義リスト
- コメント
- エスケープシーケンス


## 使用方法

### コマンドライン

```bash
# デフォルト（HTML）
npm run start -- <input.md>

# トークンストリームとして出力
npm run start -- <input.md> -t

# AST として出力
npm run start -- <input.md> -a

# HTML として出力
npm run start -- <input.md> -h
```


## アーキテクチャ

パーサーは 3 段階のパイプラインを使用します

1. **トークン化** (`Tokenizer`) - Markdown テキストをトークンストリームに変換
2. **AST 生成** (`ASTGenerator`) - インライン要素の解析を伴う抽象構文木を構築
3. **シリアライズ** (`HTMLSerializer`) - AST を HTML 出力に変換


## ライセンス

MIT © 2026 GrassfieldK


## 貢献

貢献を歓迎します！ぜひ Pull Request を送ってください。
