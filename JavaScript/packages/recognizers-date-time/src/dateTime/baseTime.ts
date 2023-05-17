// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// @ts-nocheck
import { IExtractor, ExtractResult } from "@microsoft/recognizers-text";
import { Constants, TimeTypeConstants } from "./constants";
import { RegExpUtility, Match, StringUtility } from "@microsoft/recognizers-text-number";
import { Token, DateTimeFormatUtil, DateTimeResolutionResult, IDateTimeUtilityConfiguration, DateUtils, StringMap } from "./utilities";
import { IDateTimeParser, DateTimeParseResult } from "./parsers";
import { IDateTimeExtractor } from "./baseDateTime";

export interface ITimeExtractorConfiguration {
    timeRegexList: RegExp[]
    atRegex: RegExp
    ishRegex: RegExp
}

export class BaseTimeExtractor implements IDateTimeExtractor {
    private readonly extractorName = Constants.SYS_DATETIME_TIME; // "Time";
    private readonly config: ITimeExtractorConfiguration;

    constructor(config: ITimeExtractorConfiguration) {
        this.config = config;
    }

    extract(text: string, refDate: Date): ExtractResult[] {
        if (!refDate) {
            refDate = new Date();
        }
        const referenceDate = refDate;

        const tokens: Token[] = new Array<Token>()
            .concat(this.basicRegexMatch(text))
            .concat(this.atRegexMatch(text))
            .concat(this.specialsRegexMatch(text, referenceDate));

        const result = Token.mergeAllTokens(tokens, text, this.extractorName);
        return result;
    }

    basicRegexMatch(text: string): Token[] {

        const ret:Token[] = [];

        this.config.timeRegexList.forEach(regexp => {
            const matches = RegExpUtility.getMatches(regexp, text);
            matches.forEach(match => {

                // @TODO Workaround to avoid incorrect partial-only matches. Remove after time regex reviews across languages.
                const lth = match.groups("lth").value;

                if (!lth ||
                    (lth.length != match.length && !(match.length == lth.length + 1 && match.value.endsWith(" "))))
                {
                    ret.push(new Token(match.index, match.index + match.length));
                }
            });
        });

        return ret;
    }

    atRegexMatch(text: string): Token[] {
        const ret:Token[] = [];
        // handle "at 5", "at seven"
        const matches = RegExpUtility.getMatches(this.config.atRegex, text);
        matches.forEach(match => {
            if (match.index + match.length < text.length &&
                text.charAt(match.index + match.length) === '%') {
                return;
            }
            ret.push(new Token(match.index, match.index + match.length));
        });
        return ret;
    }

    specialsRegexMatch(text: string, refDate: Date): Token[] {
        const ret:Token[] = [];
        // handle "ish"
        if (this.config.ishRegex !== null) {
            const matches = RegExpUtility.getMatches(this.config.ishRegex, text);
            matches.forEach(match => {
                ret.push(new Token(match.index, match.index + match.length));
            });
        }
        return ret;
    }
}

export interface ITimeParserConfiguration {
    timeTokenPrefix: string;
    atRegex: RegExp
    timeRegexes: RegExp[];
    numbers: ReadonlyMap<string, number>;
    utilityConfiguration: IDateTimeUtilityConfiguration;
    adjustByPrefix(prefix: string, adjust: { hour: number, min: number, hasMin: boolean }):void;
    adjustBySuffix(suffix: string, adjust: { hour: number, min: number, hasMin: boolean, hasAm: boolean, hasPm: boolean }) :void;
}

export class BaseTimeParser implements IDateTimeParser {
    readonly ParserName = Constants.SYS_DATETIME_TIME; // "Time";
    readonly config: ITimeParserConfiguration;

    constructor(configuration: ITimeParserConfiguration|null) {
        this.config = configuration;
    }

    public parse(er: ExtractResult, referenceTime?: Date): DateTimeParseResult {
        if (!referenceTime) {
            referenceTime = new Date();
        }
        let value = null;
        if (er.type === this.ParserName) {
            const innerResult = this.internalParse(er.text, referenceTime);
            if (innerResult.success) {
                innerResult.futureResolution = {};
                innerResult.futureResolution[TimeTypeConstants.TIME] = DateTimeFormatUtil.formatTime(innerResult.futureValue);
                innerResult.pastResolution = {};
                innerResult.pastResolution[TimeTypeConstants.TIME] = DateTimeFormatUtil.formatTime(innerResult.pastValue);
                value = innerResult;
            }
        }

        const ret = new DateTimeParseResult(er);
        ret.value = value,
            ret.timexStr = value === null ? "" : value.timex,
            ret.resolutionStr = "";

        return ret;
    }

    internalParse(text: string, referenceTime: Date): DateTimeResolutionResult {
        const innerResult = this.parseBasicRegexMatch(text, referenceTime);
        return innerResult;
    }

    // parse basic patterns in TimeRegexList
    private parseBasicRegexMatch(text: string, referenceTime: Date): DateTimeResolutionResult {
        const trimmedText = text.trim().toLowerCase();
        let offset = 0;

        let matches = RegExpUtility.getMatches(this.config.atRegex, trimmedText);
        if (matches.length === 0) {
            matches = RegExpUtility.getMatches(this.config.atRegex, this.config.timeTokenPrefix + trimmedText);
            offset = this.config.timeTokenPrefix.length;
        }

        if (matches.length > 0 && matches[0].index === offset && matches[0].length === trimmedText.length) {
            return this.match2Time(matches[0], referenceTime);
        }

        // parse hour pattern, like "twenty one", "16"
        // create a extract result which content the pass-in text
        let hour = this.config.numbers.get(text) || Number(text);
        if (hour) {
            if (hour >= 0 && hour <= 24) {
                const ret = new DateTimeResolutionResult();

                if (hour === 24) {
                    hour = 0;
                }

                if (hour <= 12 && hour !== 0) {
                    ret.comment = "ampm";
                }

                ret.timex = "T" + DateTimeFormatUtil.toString(hour, 2);
                ret.futureValue = ret.pastValue =
                    DateUtils.safeCreateFromMinValue(referenceTime.getFullYear(), referenceTime.getMonth(), referenceTime.getDate(), hour, 0, 0);
                ret.success = true;
                return ret;
            }
        }

        for (const regex of this.config.timeRegexes) {
            offset = 0;
            matches = RegExpUtility.getMatches(regex, trimmedText);

            if (matches.length && matches[0].index === offset && matches[0].length === trimmedText.length) {
                return this.match2Time(matches[0], referenceTime);
            }
        }

        return new DateTimeResolutionResult();
    }

    private match2Time(match: Match, referenceTime: Date): DateTimeResolutionResult {
        const ret = new DateTimeResolutionResult();
        let hour = 0;
        let min = 0;
        let second = 0;
        const day = referenceTime.getDate();
        const month = referenceTime.getMonth();
        const year = referenceTime.getFullYear();
        let hasMin = false;
        let hasSec = false;
        let hasAm = false;
        let hasPm = false;
        let hasMid = false;

        const engTimeStr = match.groups('engtime').value;
        if (!StringUtility.isNullOrWhitespace(engTimeStr)) {
            // get hour
            const hourStr = match.groups('hournum').value.toLowerCase();
            hour = this.config.numbers.get(hourStr)!;

            // get minute
            const minStr = match.groups('minnum').value;
            const tensStr = match.groups('tens').value;

            if (!StringUtility.isNullOrWhitespace(minStr)) {
                min = this.config.numbers.get(minStr)!;
                if (tensStr) {
                    min += this.config.numbers.get(tensStr)!;
                }
                hasMin = true;
            }
        }
        else if (!StringUtility.isNullOrWhitespace(match.groups('mid').value)) {
            hasMid = true;
            if (!StringUtility.isNullOrWhitespace(match.groups('midnight').value)) {
                hour = 0;
                min = 0;
                second = 0;
            }
            else if (!StringUtility.isNullOrWhitespace(match.groups('midmorning').value)) {
                hour = 10;
                min = 0;
                second = 0;
            }
            else if (!StringUtility.isNullOrWhitespace(match.groups('midafternoon').value)) {
                hour = 14;
                min = 0;
                second = 0;
            }
            else if (!StringUtility.isNullOrWhitespace(match.groups('midday').value)) {
                hour = 12;
                min = 0;
                second = 0;
            }
        }
        else {
            // get hour
            let hourStr = match.groups('hour').value;
            if (StringUtility.isNullOrWhitespace(hourStr)) {
                hourStr = match.groups('hournum').value.toLowerCase();
                hour = this.config.numbers.get(hourStr)!;
                if (!hour) {
                    return ret;
                }
            }
            else {
                hour = Number.parseInt(hourStr, 10);
                if (!hour) {
                    hour = this.config.numbers.get(hourStr)!;
                    if (!hour) {
                        return ret;
                    }
                }
            }

            // get minute
            let minStr = match.groups('min').value.toLowerCase();
            if (StringUtility.isNullOrWhitespace(minStr)) {
                minStr = match.groups('minnum').value;
                if (!StringUtility.isNullOrWhitespace(minStr)) {
                    min = this.config.numbers.get(minStr)!;
                    hasMin = true;
                }

                const tensStr = match.groups('tens').value;
                if (!StringUtility.isNullOrWhitespace(tensStr)) {
                    min += this.config.numbers.get(tensStr)!;
                    hasMin = true;
                }
            }
            else {
                min = Number.parseInt(minStr, 10);
                hasMin = true;
            }

            // get second
            const secStr = match.groups('sec').value.toLowerCase();
            if (!StringUtility.isNullOrWhitespace(secStr)) {
                second = Number.parseInt(secStr, 10);
                hasSec = true;
            }
        }

        // adjust by desc string
        const descStr = match.groups('desc').value.toLowerCase();
        if (RegExpUtility.getMatches(this.config.utilityConfiguration.amDescRegex, descStr).length > 0
            || RegExpUtility.getMatches(this.config.utilityConfiguration.amPmDescRegex, descStr).length > 0
            || !StringUtility.isNullOrEmpty(match.groups('iam').value)) {

            if (hour >= 12) {
                hour -= 12;
            }

            if (RegExpUtility.getMatches(this.config.utilityConfiguration.amPmDescRegex, descStr).length === 0) {
                hasAm = true;
            }
        }
        else if (RegExpUtility.getMatches(this.config.utilityConfiguration.pmDescRegex, descStr).length > 0
            || !StringUtility.isNullOrEmpty(match.groups('ipm').value)) {

            if (hour < 12) {
                hour += 12;
            }

            hasPm = true;
        }

        // adjust min by prefix
        const timePrefix = match.groups('prefix').value.toLowerCase();
        if (!StringUtility.isNullOrWhitespace(timePrefix)) {
            const adjust = { hour: hour, min: min, hasMin: hasMin };
            this.config.adjustByPrefix(timePrefix, adjust);
            hour = adjust.hour; min = adjust.min; hasMin = adjust.hasMin;
        }

        // adjust hour by suffix
        const timeSuffix = match.groups('suffix').value.toLowerCase();
        if (!StringUtility.isNullOrWhitespace(timeSuffix)) {
            const adjust = { hour: hour, min: min, hasMin: hasMin, hasAm: hasAm, hasPm: hasPm };
            this.config.adjustBySuffix(timeSuffix, adjust);
            hour = adjust.hour; min = adjust.min; hasMin = adjust.hasMin; hasAm = adjust.hasAm; hasPm = adjust.hasPm;
        }

        if (hour === 24) {
            hour = 0;
        }

        ret.timex = "T" + DateTimeFormatUtil.toString(hour, 2);
        if (hasMin) {
            ret.timex += ":" + DateTimeFormatUtil.toString(min, 2);
        }

        if (hasSec) {
            ret.timex += ":" + DateTimeFormatUtil.toString(second, 2);
        }

        if (hour <= 12 && !hasPm && !hasAm && !hasMid) {
            ret.comment = "ampm";
        }

        ret.futureValue = ret.pastValue = new Date(year, month, day, hour, min, second);
        ret.success = true;

        return ret;
    }
}
