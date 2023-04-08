# `@kevits/conventional-commit`

Useful functions for parsing and validating conventional commits.

# Functions

| Functions           | Type                                    |
| ------------------- | --------------------------------------- |
| `parseFullCommit`   | `(commit: string) => Commit`            |
| `parseHeader`       | `(header: string) => CommitHeader`      |
| `parseFooter`       | `(footer: string) => CommitFooter[]`    |
| `getBodyFromCommit` | `(fullCommit: string) => string`        |
| `parseHeaderToJson` | `(header: string) => string`            |
| `parseFooterToJson` | `(footer: string) => string`            |
| `validateHeader`    | `(headerToValidate: string) => boolean` |
