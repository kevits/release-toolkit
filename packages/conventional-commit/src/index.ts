export type Commit = {
    header: string
    body?: string
    footer?: string
}

export type CommitHeader = {
    type: string
    scope: string
    breaking: boolean
    description: string
}

export type CommitFooter = {
    token: string
    message: string
}

const fullCommitExp: RegExp = /(?<header>.*)(?:\n{1,2})(?<body>(?<=\n{2})(?:[\w\W]*?(?=(?<=\n{2})[a-zA-Z][a-zA-Z-]*?(?:: | #)[\S][\w\W]*)|[\w\W]*(?!(?<=\n{2})[a-zA-Z][a-zA-Z-]*?(?:: | #)[\S][\w\W]*))(?:\n*))(?<footer>(?<=\n{2})[a-zA-Z][a-zA-Z-]*?(?:: | #)[\S][\w\W]*)?/ // prettier-ignore
const headerExp: RegExp = /(?<type>[\w-]+)(?:\((?<scope>[\w-]+)\))?(?<breaking>!)?: (?<description>(?!\s).+)$/
const footerExp: RegExp = /^(?<token>BREAKING CHANGE|[a-zA-Z][a-zA-Z-]+)(?:: | (?=#))(?<message>[\w\W]+?(?=^(?:BREAKING CHANGE|[a-zA-Z][a-zA-Z-]+)(?:: | (?=#)))|[\S][\w\W]*)/gm // prettier-ignore

export function parseFullCommit(commit: string): Commit | null {
    const match: RegExpMatchArray | null = commit.trim().match(fullCommitExp)
    if (match == null || match.groups == undefined) {
        return null
    }

    return {
        header: match.groups["header"],
        body: match.groups["body"],
        footer: match.groups["footer"],
    }
}

export function parseHeader(header: string): CommitHeader | null {
    const match: RegExpMatchArray | null = header.trim().match(headerExp)
    if (match == null || match.groups == undefined) {
        return null
    }

    return {
        type: match.groups["type"] ? match.groups["type"] : "",
        scope: match.groups["scope"] ? match.groups["scope"] : "",
        breaking: match.groups["breaking"] != undefined,
        description: match.groups["description"] ? match.groups["description"] : "",
    }
}

export function parseFooter(footer: string): Array<CommitFooter> {
    const matchIter: IterableIterator<RegExpMatchArray> = footer.trim().matchAll(footerExp)
    const footers: Array<CommitFooter> = []
    for (const match of matchIter) {
        if (match.groups == undefined) {
            return []
        }

        footers.push({
            token: match.groups["token"],
            message: match.groups["message"].trim(),
        })
    }

    return footers
}

export function getBodyFromCommit(fullCommit: string): string {
    const commit: Commit | null = parseFullCommit(fullCommit)
    if (commit == null || commit.body == undefined) {
        return ""
    }
    return commit.body.trim()
}

export function parseHeaderToJson(header: string): string {
    const parsedHeader: CommitHeader | null = parseHeader(header)
    return JSON.stringify(parsedHeader)
}

export function parseFooterToJson(footer: string): string {
    const parsedFooter: Array<CommitFooter> = parseFooter(footer)
    return JSON.stringify(parsedFooter)
}

export function validateHeader(headerToValidate: string): boolean {
    return headerExp.test(headerToValidate)
}
