export class Version {
    private _major: number
    private _minor: number
    private _patch: number
    private _preRelease?: string
    private _buildMetadata?: string

    public constructor(major: number, minor: number, patch: number, preRelease?: string, buildMetadata?: string) {
        if (major < 0 || minor < 0 || patch < 0) {
            throw new Error("Major, minor or patch can not be negativ")
        }
        this._major = major
        this._minor = minor
        this._patch = patch
        this._preRelease = preRelease
        this._buildMetadata = buildMetadata
    }

    public increaseMajor(): Version {
        return new Version(this.major + 1, 0, 0)
    }

    public increaseMinor(): Version {
        return new Version(this.major, this.minor + 1, 0)
    }

    public increasePatch(): Version {
        return new Version(this.major, this.minor, this.patch + 1)
    }

    public setPreRelease(value: string, keepBuildData: boolean = false): Version {
        const buildData: string | undefined = keepBuildData ? this._buildMetadata : undefined
        return new Version(this.major, this.minor, this.patch, value, buildData)
    }

    public setBuildMetadata(value: string, keepPreReleaseData: boolean = false): Version {
        const preReleaseData: string | undefined = keepPreReleaseData ? this._preRelease : undefined
        return new Version(this.major, this.minor, this.patch, preReleaseData, value)
    }

    public isBiggerThan(version: Version): boolean {
        return this.compareTo(version) == 1
    }

    public isSmallerThan(version: Version): boolean {
        return this.compareTo(version) == -1
    }

    public isEqualTo(version: Version): boolean {
        return this.compareTo(version) == 0
    }

    public compareTo(version: Version): number {
        if (this.major > version.major) {
            return 1
        } else if (this.major < version.major) {
            return -1
        } else {
            if (this.minor > version.minor) {
                return 1
            } else if (this.minor < version.minor) {
                return -1
            } else {
                if (this.patch > version.patch) {
                    return 1
                } else if (this.patch < version.patch) {
                    return -1
                } else {
                    if (this.preRelease == undefined && version.preRelease != undefined) {
                        return 1
                    } else if (this.preRelease != undefined && version.preRelease == undefined) {
                        return -1
                    } else if (this.preRelease != undefined && version.preRelease != undefined) {
                        const pr: string[] = this.preRelease.split(".")
                        const vpr: string[] = version.preRelease.split(".")
                        const biggestLength: number = pr.length >= vpr.length ? pr.length : vpr.length

                        // loop through each element
                        for (let i = 0; i <= biggestLength; i++) {
                            // check if next element exists
                            if (pr[i] != undefined && vpr[i] == undefined) {
                                return 1
                            } else if (pr[i] == undefined && vpr[i] != undefined) {
                                return -1
                            }

                            // check type
                            const isPrNumber: boolean = !isNaN(Number(pr[i]))
                            const isVprNumber: boolean = !isNaN(Number(vpr[i]))
                            if (!isPrNumber && isVprNumber) {
                                return 1
                            } else if (isPrNumber && !isVprNumber) {
                                return -1
                            } else if (isPrNumber && isVprNumber) {
                                // both numeric
                                if (Number(pr[i]) > Number(vpr[i])) {
                                    return 1
                                } else if (Number(pr[i]) < Number(vpr[i])) {
                                    return -1
                                }
                            } else {
                                // both non-numeric
                                if (pr[i] > vpr[i]) {
                                    return 1
                                } else if (pr[i] < vpr[i]) {
                                    return -1
                                }
                            }
                        }
                    }
                }
            }
        }
        return 0
    }

    public toJson(): string {
        return ""
    }

    public toString(): string {
        let version: string = `${this.major}.${this.minor}.${this.patch}`
        if (this.preRelease != undefined) {
            version += `-${this.preRelease}`
        }
        if (this.buildMetadata != undefined) {
            version += `+${this.buildMetadata}`
        }
        return version
    }

    public get major(): number {
        return this._major
    }
    public get minor(): number {
        return this._minor
    }
    public get patch(): number {
        return this._patch
    }
    public get preRelease(): string | undefined {
        return this._preRelease
    }
    public get buildMetadata(): string | undefined {
        return this._buildMetadata
    }
}

const versionExp: RegExp = /^(?<major>0|[1-9]\d*)\.(?<minor>0|[1-9]\d*)\.(?<patch>0|[1-9]\d*)(?:-(?<prerelease>(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+(?<buildmetadata>[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/ // prettier-ignore

// Using the regex expression from the official website
// and adjusted the expression to make it work for JavaScript
export function parseVersion(version: string): Version | null {
    const match: RegExpMatchArray | null = version.trim().match(versionExp)
    if (match == null || match.groups == undefined) {
        return null
    }

    return new Version(
        Number(match.groups["major"]),
        Number(match.groups["minor"]),
        Number(match.groups["patch"]),
        match.groups["prerelease"],
        match.groups["buildmetadata"]
    )
}
