# markmodern Test Document

## Inline Elements

**Bold**, *italic*, ***bold and italic***, ~~strikethrough~~, `code`
Ruby/Furigana: {漢字}(かんじ), {東京}(とうきょう)

## Links

Link: [Link](https://example.com)

## Images

Image:
![alt text](https://example.com/image.png)

Image with Title:
-![Screenshot of the interface](https://example.com/interface.png)

## Headings

# h1
## h2
### h3
#### h4
##### h5
###### h6

## Lists

### Unordered List

- Item 1
- Item 2
  - Nested 2-1
  - Nested 2-2
    - Nested 3-1
- Item 3

### Ordered List

1. First
2. Second
   1. Nested 2-1
   2. Nested 2-2
3. Third

## Checklist

- [x] Completed task
- [ ] Incomplete task
  - [x] Nested completed task

## Table

| Left | Center | Right |
| :--- | :----: | ----: |
| A1   |   B1   |    C1 |
| A2   |   B2   |    C2 |

## Code Block

```javascript
function hello() {
  console.log("world");
}
```

```python
def hello():
    print("world")
```

## Blockquote

> This is a quote
> Multiple lines
>
> > Nested quote

## Definition List

Markdown
: A markup language
: Plain text format

HTML
: A markup language
: Convert Markdown to this

## Footnote

This is text[^1].

[^1]: This is a footnote

## Horizontal Rule

---

## Comment

// This comment is not rendered

## Escape Sequences

\*Escaped asterisk\*

\\Backslash

## Admonitions

:::note info
Information note. Subtype is optional.
:::

:::note warn
This is a warning. Pay attention!

- Item 1
- Item 2
:::

:::note alert
Strong warning. Do not do this!
:::

:::note
Basic note without subtype.
:::

## Details Blocks

### Basic Details

===Simple Summary
Simple content here.
===

### Multiple Paragraphs

===Multiple Paragraphs in Details
This is the first paragraph.

This is the second paragraph with multiple lines.

This is the third paragraph.
===

### Details with List

===Details with List
- Item 1
- Item 2
  - Nested item
- Item 3

1. Ordered 1
2. Ordered 2
3. Ordered 3

- [x] Checked task
- [ ] Unchecked task
===

### Details with Inline Elements

===Inline Elements in Summary
This has **bold**, *italic*, ***bold italic***, ~~strikethrough~~, and `code`.
===

### Details with Code Block

===Code Block in Details
Here is some code:

```javascript
function example() {
  return "Hello";
}
```

More text after code.
===

### Details with Table

===Table in Details
| Name   | Age |
|--------|-----|
| Alice  | 30  |
| Bob    | 25  |

Additional content.
===

### Nested Details

===Outer Details
Content of outer details.

===Inner Details
Content of inner details.
===

Back to outer details.
===

### Details with Admonition

===Details with Admonition
:::note info
This is a note inside details.
:::

More text.
===

### Complex Summary

===Summary with **Bold** and `Code`
Content here.
===

===Summary with [Link](https://example.com)
Content here.
===

### Details with Footnote

===Details with Footnote
This references a note[^2].

[^2]: This is a note inside details.
===

