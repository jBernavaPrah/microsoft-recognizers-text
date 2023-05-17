// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// @ts-nocheck
import { IParser, ParseResult, ExtractResult, RegExpUtility, Match, StringUtility } from "@microsoft/recognizers-text";
import { BaseNumberParser, BaseNumberExtractor } from "@microsoft/recognizers-text-number";
import { IDateTimeUtilityConfiguration, DateTimeFormatUtil, DateTimeResolutionResult, DateUtils, DayOfWeek, MatchingUtil, AgoLaterUtil } from "./utilities";
import { BaseDateTime } from "../resources/baseDateTime";
import { Constants, TimeTypeConstants } from "./constants";
import { BaseDateExtractor, BaseDateParser } from "./baseDate";
import { BaseTimeExtractor, BaseTimeParser } from "./baseTime";
import { BaseDatePeriodExtractor, BaseDatePeriodParser } from "./baseDatePeriod";
import { BaseTimePeriodExtractor, BaseTimePeriodParser } from "./baseTimePeriod";
import { IDateTimeExtractor, BaseDateTimeExtractor, BaseDateTimeParser } from "./baseDateTime";
import { BaseDateTimePeriodExtractor, BaseDateTimePeriodParser } from "./baseDateTimePeriod";
import { BaseSetExtractor, BaseSetParser } from "./baseSet";
import { BaseDurationExtractor, BaseDurationParser } from "./baseDuration";
import { BaseHolidayExtractor, BaseHolidayParser } from "./baseHoliday";

export class DateTimeParseResult extends ParseResult {
    // TimexStr is only used in extractors related with date and time
    // It will output the TIMEX representation of a time string.
    timexStr!: string
}

export interface IDateTimeParser extends IParser {
    parse(extResult: ExtractResult, referenceDate?: Date): DateTimeParseResult | null;
}

export interface ICommonDateTimeParserConfiguration {
    cardinalExtractor: BaseNumberExtractor;
    integerExtractor: BaseNumberExtractor;
    ordinalExtractor: BaseNumberExtractor;
    numberParser: BaseNumberParser;
    dateExtractor: IDateTimeExtractor;
    timeExtractor: IDateTimeExtractor;
    dateTimeExtractor: IDateTimeExtractor;
    durationExtractor: IDateTimeExtractor;
    datePeriodExtractor: IDateTimeExtractor;
    timePeriodExtractor: IDateTimeExtractor;
    dateTimePeriodExtractor: IDateTimeExtractor;
    dateParser: BaseDateParser;
    timeParser: BaseTimeParser;
    dateTimeParser: BaseDateTimeParser;
    durationParser: BaseDurationParser;
    datePeriodParser: BaseDatePeriodParser;
    timePeriodParser: BaseTimePeriodParser;
    dateTimePeriodParser: BaseDateTimePeriodParser;
    monthOfYear: ReadonlyMap<string, number>;
    numbers: ReadonlyMap<string, number>;
    unitValueMap: ReadonlyMap<string, number>;
    seasonMap: ReadonlyMap<string, string>;
    unitMap: ReadonlyMap<string, string>;
    cardinalMap: ReadonlyMap<string, number>;
    dayOfMonth: ReadonlyMap<string, number>;
    dayOfWeek: ReadonlyMap<string, number>;
    doubleNumbers: ReadonlyMap<string, number>;
    utilityConfiguration: IDateTimeUtilityConfiguration;
}

export abstract class BaseDateParserConfiguration implements Partial<ICommonDateTimeParserConfiguration> {
    cardinalExtractor: BaseNumberExtractor|undefined;
    integerExtractor: BaseNumberExtractor|undefined;
    ordinalExtractor: BaseNumberExtractor|undefined;
    numberParser: BaseNumberParser|undefined;
    dateExtractor: IDateTimeExtractor|undefined;
    timeExtractor: IDateTimeExtractor|undefined;
    dateTimeExtractor: IDateTimeExtractor|undefined;
    durationExtractor: IDateTimeExtractor|undefined;
    datePeriodExtractor: IDateTimeExtractor|undefined;
    timePeriodExtractor: IDateTimeExtractor|undefined;
    dateTimePeriodExtractor: IDateTimeExtractor|undefined;
    dateParser: BaseDateParser|undefined;
    timeParser: BaseTimeParser|undefined;
    dateTimeParser: BaseDateTimeParser|undefined;
    durationParser: BaseDurationParser|undefined;
    datePeriodParser: BaseDatePeriodParser|undefined;
    timePeriodParser: BaseTimePeriodParser|undefined;
    dateTimePeriodParser: BaseDateTimePeriodParser|undefined;
    monthOfYear: ReadonlyMap<string, number>|undefined;
    numbers: ReadonlyMap<string, number>|undefined;
    unitValueMap: ReadonlyMap<string, number>|undefined;
    seasonMap: ReadonlyMap<string, string>|undefined;
    unitMap: ReadonlyMap<string, string>|undefined;
    cardinalMap: ReadonlyMap<string, number>|undefined;
    dayOfMonth: ReadonlyMap<string, number>|undefined;
    dayOfWeek: ReadonlyMap<string, number>|undefined;
    doubleNumbers: ReadonlyMap<string, number>|undefined;
    utilityConfiguration: IDateTimeUtilityConfiguration|undefined;

    constructor() {
        this.dayOfMonth = BaseDateTime.DayOfMonthDictionary;
    }
}
