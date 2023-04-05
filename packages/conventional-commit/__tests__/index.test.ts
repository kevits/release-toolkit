import { readFileSync } from "fs"
import { join } from "path"
import {
    Commit,
    CommitHeader,
    CommitFooter,
    parseFullCommit,
    parseHeader,
    parseFooter,
    parseHeaderToJson,
    validateHeader,
} from "../src/index"

describe("Check full commit parser", () => {
    test("Full commit", () => {
        const commit = readFileSync(join(__dirname, "__data__", "full-commit.txt"), "utf-8")
        const parsedCommit: Commit | null = parseFullCommit(commit)
        expect(parseFullCommit).not.toBeNull()
        expect(parsedCommit?.header).not.toBe("")
        expect(parsedCommit?.body).not.toBe("")
        expect(parsedCommit?.footer).not.toBe("")
    })
})

describe("Check commit header parser", () => {
    test("Valid header", () => {
        const parsedHeader: CommitHeader | null = parseHeader("feat(app)!: Lorem ipsum dolor sit amet")
        expect(parsedHeader).not.toBeNull()
        expect(parsedHeader?.type).toBe("feat")
        expect(parsedHeader?.scope).toBe("app")
        expect(parsedHeader?.breaking).toBeTruthy()
        expect(parsedHeader?.description).toBe("Lorem ipsum dolor sit amet")
    })
})

describe("Check commit footer parser", () => {
    test("Multiple footers in on string", () => {
        const footers = readFileSync(join(__dirname, "__data__", "multiple-footers.txt"), "utf-8")
        const parsedFooters: Array<CommitFooter> = parseFooter(footers)
        expect(parsedFooters).not.toBeNull()
        expect(parsedFooters.length).toBe(11)
    })
})

describe("Check JSON outputs", () => {
    test("Header JSON", () => {
        const headerJson: string = parseHeaderToJson("feat(app)!: Lorem ipsum dolor sit amet")
        const expected: string =
            '{"type":"feat","scope":"app","breaking":true,"description":"Lorem ipsum dolor sit amet"}'
        expect(headerJson).toStrictEqual(expected)
    })
})

describe("Test valid commit headers", () => {
    const validHeadersContents = readFileSync(join(__dirname, "__data__", "commit-headers-valid.txt"), "utf-8")
    validHeadersContents
        .trim()
        .split(/\r?\n/)
        .filter((line) => line.trim() !== "")
        .forEach((line) => {
            test(`Header: "${line}"`, () => {
                expect(validateHeader(line)).toBeTruthy()
            })
        })
})

describe("Test invalid commit headers", () => {
    const invalidHeadersContents = readFileSync(join(__dirname, "__data__", "commit-headers-invalid.txt"), "utf-8")
    invalidHeadersContents
        .trim()
        .split(/\r?\n/)
        .filter((line) => line.trim() !== "")
        .forEach((line) => {
            test(`Header: "${line}"`, () => {
                expect(validateHeader(line)).toBeFalsy()
            })
        })
})
