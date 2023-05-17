// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { RegExpUtility, StringUtility, ExtractResult } from "@microsoft/recognizers-text";
import { BaseDateTimeExtractor, DateTimeExtra, TimeResult, TimeResolutionUtils } from "./baseDateTime";
import { BaseTimeParser } from "../baseTime";
import { Constants, TimeTypeConstants } from "../constants";
import {  DateTimeParseResult } from "../parsers";
import { DateTimeResolutionResult, DateTimeFormatUtil, DateUtils } from "../utilities";
import { ChineseDateTime } from "../../resources/chineseDateTime";

export enum TimeType {
    ChineseTime,
    LessTime,
    DigitTime
}

export class ChineseTimeExtractor extends BaseDateTimeExtractor<TimeType> {
    protected extractorName = Constants.SYS_DATETIME_TIME; // "Time";

    constructor() {
        super(new Map<RegExp, TimeType>([
            [RegExpUtility.getSafeRegExp(ChineseDateTime.TimeRegexes1), TimeType.ChineseTime],
            [RegExpUtility.getSafeRegExp(ChineseDateTime.TimeRegexes2), TimeType.DigitTime],
            [RegExpUtility.getSafeRegExp(ChineseDateTime.TimeRegexes3), TimeType.LessTime]
        ]));
    }
}

export class ChineseTimeParser extends BaseTimeParser {
    private readonly onlyDigitMatch: RegExp;
    private readonly numbersMap: ReadonlyMap<string, number>;
    private readonly lowBoundMap: ReadonlyMap<string, number>;
    private readonly functionMap: ReadonlyMap<TimeType, (extra: DateTimeExtra<TimeType>) => TimeResult>;
    private readonly innerExtractor: ChineseTimeExtractor;

    constructor() {
        super(null);
        this.functionMap = new Map<TimeType, (extra: DateTimeExtra<TimeType>) => TimeResult>([
            [TimeType.DigitTime, x => this.handleDigit(x)],
            [TimeType.ChineseTime, x => this.handleChinese(x)],
            [TimeType.LessTime, x => this.handleLess(x)]
        ]);
        this.onlyDigitMatch = RegExpUtility.getSafeRegExp('\\d+');
        this.numbersMap = ChineseDateTime.TimeNumberDictionary;
        this.lowBoundMap = ChineseDateTime.TimeLowBoundDesc;
        this.innerExtractor = new ChineseTimeExtractor();
    }

    public parse(er: ExtractResult, referenceTime?: Date): DateTimeParseResult  {
        if (!referenceTime) {
            referenceTime = new Date();
        }

        let extra: DateTimeExtra<TimeType> = er.data;
        if (!extra) {
            const innerResult = this.innerExtractor.extract(er.text, referenceTime).pop()!;
            extra = innerResult.data;
        }

        const timeResult = this.functionMap.get(extra.dataType)!(extra);
        const parseResult = this.packTimeResult(extra, timeResult, referenceTime);

        if (parseResult.success) {
            parseResult.futureResolution = {};
            parseResult.futureResolution[TimeTypeConstants.TIME] = DateTimeFormatUtil.formatTime(parseResult.futureValue);
            parseResult.pastResolution = {};
            parseResult.pastResolution[TimeTypeConstants.TIME] = DateTimeFormatUtil.formatTime(parseResult.pastValue);
        }

        const result = new DateTimeParseResult(er);
        result.value = parseResult;
        result.data = timeResult;
        result.resolutionStr = '';
        result.timexStr = parseResult.timex;

        return result;
    }

    private handleLess(extra: DateTimeExtra<TimeType>): TimeResult {
        const hour = this.matchToValue(extra.namedEntity('hour').value);
        const quarter = this.matchToValue(extra.namedEntity('quarter').value);
        const minute = !StringUtility.isNullOrEmpty(extra.namedEntity('half').value)
            ? 30
            : quarter !== -1 ? quarter * 15 : 0;
        const second = this.matchToValue(extra.namedEntity('sec').value);
        const less = this.matchToValue(extra.namedEntity('min').value);

        let all = hour * 60 + minute - less;
        if (all < 0) {
            all += 1440;
        }

        return new TimeResult(all / 60, all % 60, second);
    }

    private handleChinese(extra: DateTimeExtra<TimeType>): TimeResult {
        const hour = this.matchToValue(extra.namedEntity('hour').value);
        const quarter = this.matchToValue(extra.namedEntity('quarter').value);
        const minute = !StringUtility.isNullOrEmpty(extra.namedEntity('half').value)
            ? 30
            : quarter !== -1 ? quarter * 15
                : this.matchToValue(extra.namedEntity('min').value);
        const second = this.matchToValue(extra.namedEntity('sec').value);

        return new TimeResult(hour, minute, second);
    }

    private handleDigit(extra: DateTimeExtra<TimeType>): TimeResult {
        return new TimeResult(
            this.matchToValue(extra.namedEntity('hour').value),
            this.matchToValue(extra.namedEntity('min').value),
            this.matchToValue(extra.namedEntity('sec').value)
        );
    }

    private packTimeResult(extra: DateTimeExtra<TimeType>, timeResult: TimeResult, referenceTime: Date): DateTimeResolutionResult {
        const result = new DateTimeResolutionResult();
        const dayDescription = extra.namedEntity('daydesc').value;
        const noDescription = StringUtility.isNullOrEmpty(dayDescription);
        if (noDescription) {
            result.comment = 'ampm';
        }
        else {
            this.addDescription(timeResult, dayDescription);
        }

        let hour = timeResult.hour > 0 ? timeResult.hour : 0;
        const min = timeResult.minute > 0 ? timeResult.minute : 0;
        const sec = timeResult.second > 0 ? timeResult.second : 0;
        const day = referenceTime.getDate();
        const month = referenceTime.getMonth();
        const year = referenceTime.getFullYear();

        let timex = 'T';
        if (timeResult.hour >= 0) {
            timex = timex + DateTimeFormatUtil.toString(timeResult.hour, 2);
            if (timeResult.minute >= 0) {
                timex = timex + ':' + DateTimeFormatUtil.toString(timeResult.minute, 2);
                if (timeResult.second >= 0) {
                    timex = timex + ':' + DateTimeFormatUtil.toString(timeResult.second, 2);
                }
            }
        }
        if (hour === 24) {
            hour = 0;
        }

        result.futureValue = DateUtils.safeCreateFromMinValue(year, month, day, hour, min, sec);
        result.pastValue = DateUtils.safeCreateFromMinValue(year, month, day, hour, min, sec);
        result.timex = timex;
        result.success = true;

        return result;
    }

    private matchToValue(source: string): number {
        return TimeResolutionUtils.matchToValue(this.onlyDigitMatch, this.numbersMap, source);
    }

    private addDescription(timeResult: TimeResult, description: string) {
        TimeResolutionUtils.addDescription(this.lowBoundMap, timeResult, description);
    }
}
