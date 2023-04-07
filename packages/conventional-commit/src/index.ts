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

/**
 * Parse a full commit with header, body and footer and
 * save those strings into a Commit type.
 * @param commit the whole commit
 * @returns a Commit type object
 */
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

/**
 * Parse the header of a commit.
 * @param header commit header
 * @returns a CommitHeader type object
 */
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

/**
 * Parse the footer of a commit.
 * @param footer the footer of a commit
 * @returns an array of CommitFooter type objects
 */
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

/**
 * Extracts the body of an full commit.
 * @param fullCommit the whole commit string
 * @returns the extracted body as string
 */
export function getBodyFromCommit(fullCommit: string): string {
    const commit: Commit | null = parseFullCommit(fullCommit)
    if (commit == null || commit.body == undefined) {
        return ""
    }
    return commit.body.trim()
}

/**
 * Converts a header string to a JSON string
 * that follow the schema of the CommitHeader type.
 * @param header commit header
 * @returns JSON as string
 */
export function parseHeaderToJson(header: string): string {
    const parsedHeader: CommitHeader | null = parseHeader(header)
    return JSON.stringify(parsedHeader)
}

/**
 * Converts a footer string to a JSON string
 * that follows the schema of the CommitFooter type.
 * @param footer commit footers
 * @returns JSON array as string
 */
export function parseFooterToJson(footer: string): string {
    const parsedFooter: Array<CommitFooter> = parseFooter(footer)
    return JSON.stringify(parsedFooter)
}

/**
 * Validates if the header follows the conventional commit specifications.
 * @param headerToValidate commit header
 * @returns wether it is a valid header or not
 */
export function validateHeader(headerToValidate: string): boolean {
    return headerExp.test(headerToValidate)
}
