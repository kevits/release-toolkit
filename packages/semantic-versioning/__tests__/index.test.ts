import { Version, parseVersion } from "../src/index"

describe("Check version strings", () => {
    describe("Valid version strings", () => {
        const versions: { [key: string]: Version } = {
            "1.0.0": new Version(1, 0, 0),
            "10.20.30": new Version(10, 20, 30),
            "1.0.1-alpha": new Version(1, 0, 1, "alpha"),
            "1.1.0+build.1": new Version(1, 1, 0, undefined, "build.1"),
            "1.1.1-alpha+build.1": new Version(1, 1, 1, "alpha", "build.1"),
            "2.0.0-rc.1+build.123": new Version(2, 0, 0, "rc.1", "build.123"),
            "1.2.3-SNAPSHOT-123": new Version(1, 2, 3, "SNAPSHOT-123", undefined),
            "1.2.3---RC.12.9.1--.12+meta": new Version(1, 2, 3, "--RC.12.9.1--.12", "meta"),
            "1.0.0-0A.is.legal": new Version(1, 0, 0, "0A.is.legal"),
            "1.0.0-alpha-a.b-c-somethinglong+build.1-aef.1-its-okay": new Version(1, 0, 0, "alpha-a.b-c-somethinglong", "build.1-aef.1-its-okay"), // prettier-ignore
        }
        Object.entries(versions).forEach(([versionStr, version]) => {
            test(versionStr, () => {
                const actual: Version | null = parseVersion(versionStr)
                expect(actual).not.toBeNull()
                expect(actual?.isEqualTo(version)).toBeTruthy()
            })
        })
    })

    describe("Invalid version strings", () => {
        const invalid: Array<string> = [
            "1",
            "1.2",
            "1.2.3-0123",
            "1.2.3-0123.0123",
            "1.1.2+.123",
            "+invalid",
            "-invalid",
            "-invalid+invalid",
            "-invalid.01",
            "alpha",
            "alpha.beta",
            "alpha.beta.1",
            "alpha.1",
            "alpha+beta",
            "alpha_beta",
            "alpha.",
            "alpha..",
            "beta",
            "1.0.0-alpha_beta",
            "-alpha.",
            "1.0.0-alpha..",
            "1.0.0-alpha..1",
            "1.0.0-alpha...1",
            "1.0.0-alpha....1",
            "1.0.0-alpha.....1",
            "1.0.0-alpha......1",
            "1.0.0-alpha.......1",
            "01.1.1",
            "1.01.1",
            "1.1.01",
            "1.2",
            "1.2.3.DEV",
            "1.2-SNAPSHOT",
            "1.2.31.2.3----RC-SNAPSHOT.12.09.1--..12+788",
            "1.2-RC-SNAPSHOT",
            "-1.0.3-gamma+b7718",
            "+justmeta",
            "9.8.7+meta+meta",
            "9.8.7-whatever+meta+meta",
            "99999.99999.99999----RC-SNAPSHOT.12.09.1--------..12",
        ]
        invalid.forEach((versionStr: string) => {
            test(versionStr, () => {
                expect(parseVersion(versionStr)).toBeNull()
            })
        })
    })
})

describe("Check semantic version comparison", () => {
    const bigger: Array<Array<Version>> = [
        [new Version(3, 0, 0), new Version(2, 0, 0)],
        [new Version(3, 0, 0), new Version(2, 1, 0)],
        [new Version(3, 1, 0), new Version(2, 1, 1)],
        [new Version(3, 0, 0), new Version(3, 0, 0, "alpha")],
    ]
    bigger.forEach((v: Version[]) => {
        test(`${v[0].toString()} > ${v[1].toString()}`, () => {
            expect(v[0].isBiggerThan(v[1])).toBeTruthy()
        })
    })

    const smaller: Array<Array<Version>> = [
        [new Version(1, 0, 0), new Version(2, 0, 0)],
        [new Version(2, 0, 0), new Version(2, 1, 0)],
        [new Version(2, 1, 0), new Version(2, 1, 1)],
        [new Version(1, 0, 0, "alpha"), new Version(1, 0, 0)],
        [new Version(1, 0, 0, "alpha"), new Version(1, 0, 0, "alpha.1")],
        [new Version(1, 0, 0, "alpha.1"), new Version(1, 0, 0, "alpha.beta")],
        [new Version(1, 0, 0, "alpha.beta"), new Version(1, 0, 0, "beta")],
        [new Version(1, 0, 0, "beta"), new Version(1, 0, 0, "beta.2")],
        [new Version(1, 0, 0, "beta.2"), new Version(1, 0, 0, "beta.11")],
        [new Version(1, 0, 0, "beta.11"), new Version(1, 0, 0, "rc.1")],
        [new Version(1, 0, 0, "rc.1"), new Version(1, 0, 0)],
    ]
    smaller.forEach((v: Version[]) => {
        test(`${v[0].toString()} < ${v[1].toString()}`, () => {
            expect(v[0].isSmallerThan(v[1])).toBeTruthy()
        })
    })

    const equal: Array<Array<Version>> = [
        [new Version(4, 0, 0), new Version(4, 0, 0)],
        [new Version(4, 1, 0), new Version(4, 1, 0)],
        [new Version(4, 1, 1), new Version(4, 1, 1)],
        [new Version(4, 0, 0, "alpha"), new Version(4, 0, 0, "alpha")],
    ]
    equal.forEach((v: Version[]) => {
        test(`${v[0].toString()} == ${v[1].toString()}`, () => {
            expect(v[0].isEqualTo(v[1])).toBeTruthy()
        })
    })
})

describe("Check version bumps", () => {
    describe("Bump patch", () => {
        const patch: Array<Array<Version>> = [
            [new Version(1, 0, 0), new Version(1, 0, 1)],
            [new Version(1, 0, 9), new Version(1, 0, 10)],
            [new Version(1, 0, 20, "alpha"), new Version(1, 0, 21)],
            [new Version(1, 1, 99, "alpha", "build.1"), new Version(1, 1, 100)],
        ]
        patch.forEach((v: Version[]) => {
            test(`${v[0].toString()} => ${v[1].toString()}`, () => {
                expect(v[0].increasePatch().isEqualTo(v[1])).toBeTruthy()
            })
        })
    })

    describe("Bump minor", () => {
        const minor: Array<Array<Version>> = [
            [new Version(1, 0, 0), new Version(1, 1, 0)],
            [new Version(1, 9, 9), new Version(1, 10, 0)],
            [new Version(1, 20, 20, "alpha"), new Version(1, 21, 0)],
            [new Version(1, 99, 99, "alpha", "build.1"), new Version(1, 100, 0)],
        ]
        minor.forEach((v: Version[]) => {
            test(`${v[0].toString()} => ${v[1].toString()}`, () => {
                expect(v[0].increaseMinor().isEqualTo(v[1])).toBeTruthy()
            })
        })
    })

    describe("Bump major", () => {
        const major: Array<Array<Version>> = [
            [new Version(1, 0, 0), new Version(2, 0, 0)],
            [new Version(9, 0, 9), new Version(10, 0, 0)],
            [new Version(20, 0, 20, "alpha"), new Version(21, 0, 0)],
            [new Version(99, 1, 99, "alpha", "build.1"), new Version(100, 0, 0)],
        ]
        major.forEach((v: Version[]) => {
            test(`${v[0].toString()} => ${v[1].toString()}`, () => {
                expect(v[0].increaseMajor().isEqualTo(v[1])).toBeTruthy()
            })
        })
    })

    describe("Set metadata", () => {
        test("1.0.0 => 1.0.0-alpha", () => {
            const expected: Version = new Version(1, 0, 0, "alpha")
            const actual: Version = new Version(1, 0, 0).setPreRelease("alpha")
            expect(actual.isEqualTo(expected)).toBeTruthy()
        })
        test("1.0.0 => 1.0.0+build.1", () => {
            const expected: Version = new Version(1, 0, 0, undefined, "build.1")
            const actual: Version = new Version(1, 0, 0).setBuildMetadata("build.1")
            expect(actual.isEqualTo(expected)).toBeTruthy()
        })
        test("1.0.0-alpha => 1.0.0-alpha+build.1", () => {
            const expected: Version = new Version(1, 0, 0, "alpha", "build.1")
            const actual: Version = new Version(1, 0, 0, "alpha", undefined).setBuildMetadata("build.1", true)
            expect(actual.isEqualTo(expected)).toBeTruthy()
        })
        test("1.0.0+build.1 => 1.0.0-alpha+build.1", () => {
            const expected: Version = new Version(1, 0, 0, "alpha", "build.1")
            const actual: Version = new Version(1, 0, 0, undefined, "build.1").setPreRelease("alpha", true)
            expect(actual.isEqualTo(expected)).toBeTruthy()
        })
    })
})

describe("Check version class", () => {
    test("Negative values are not allowed", () => {
        expect(() => new Version(-1, 0, 0)).toThrow(Error)
        expect(() => new Version(0, -1, 0)).toThrow(Error)
        expect(() => new Version(0, 0, -1)).toThrow(Error)
    })

    test("Validate toString function", () => {
        const versionString: Version = new Version(2, 1, 4, "alpha.11.abc_def", "build.1-abc_foo")
        expect(versionString.toString()).toMatch("2.1.4-alpha.11.abc_def+build.1-abc_foo")
    })
})
