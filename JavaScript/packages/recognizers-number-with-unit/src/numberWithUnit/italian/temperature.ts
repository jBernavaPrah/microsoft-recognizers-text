// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { CultureInfo, Culture, RegExpUtility } from "@microsoft/recognizers-text-number";
import { Constants } from "../constants";
import { ItalianNumberWithUnitExtractorConfiguration, ItalianNumberWithUnitParserConfiguration } from "./base";
import { ItalianNumericWithUnit } from "../../resources/italianNumericWithUnit";
import { BaseUnits } from "../../resources/baseUnits";

export class ItalianTemperatureExtractorConfiguration extends ItalianNumberWithUnitExtractorConfiguration {
    readonly suffixList: ReadonlyMap<string, string>;
    readonly prefixList: ReadonlyMap<string, string>;
    readonly ambiguousUnitList: readonly string[];
    readonly extractType: string;
    readonly ambiguousUnitNumberMultiplierRegex: RegExp;

    constructor(ci?: CultureInfo) {
        if (!ci) {
            ci = new CultureInfo(Culture.Italian);
        }

        super(ci);

        this.extractType = Constants.SYS_UNIT_TEMPERATURE;

        this.suffixList = ItalianNumericWithUnit.TemperatureSuffixList;
        this.prefixList = new Map<string, string>();
        this.ambiguousUnitList = new Array<string>();

        this.ambiguousUnitNumberMultiplierRegex = RegExpUtility.getSafeRegExp(BaseUnits.AmbiguousUnitNumberMultiplierRegex, "gs");
    }
}

export class ItalianTemperatureParserConfiguration extends ItalianNumberWithUnitParserConfiguration {
    constructor(ci?: CultureInfo) {
        if (!ci) {
            ci = new CultureInfo(Culture.Italian);
        }

        super(ci);

        this.BindDictionary(ItalianNumericWithUnit.TemperatureSuffixList);
    }
}
