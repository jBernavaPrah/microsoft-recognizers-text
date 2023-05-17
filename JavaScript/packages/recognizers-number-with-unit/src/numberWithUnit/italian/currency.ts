// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { CultureInfo, Culture } from "@microsoft/recognizers-text-number";
import { Constants } from "../constants";
import { ItalianNumberWithUnitExtractorConfiguration, ItalianNumberWithUnitParserConfiguration } from "./base";
import { ItalianNumericWithUnit } from "../../resources/italianNumericWithUnit";

export class ItalianCurrencyExtractorConfiguration extends ItalianNumberWithUnitExtractorConfiguration {
    readonly suffixList: ReadonlyMap<string, string>;
    readonly prefixList: ReadonlyMap<string, string>;
    readonly ambiguousUnitList: readonly string[];
    readonly extractType: string;

    constructor(ci?: CultureInfo) {
        if (!ci) {
            ci = new CultureInfo(Culture.Italian);
        }

        super(ci);

        this.extractType = Constants.SYS_UNIT_CURRENCY;

        // Reference Source: https:// en.wikipedia.org/wiki/List_of_circulating_currencies
        this.suffixList = ItalianNumericWithUnit.CurrencySuffixList;
        this.prefixList = ItalianNumericWithUnit.CurrencyPrefixList;
        this.ambiguousUnitList = ItalianNumericWithUnit.AmbiguousCurrencyUnitList;
    }
}

export class ItalianCurrencyParserConfiguration extends ItalianNumberWithUnitParserConfiguration {
    constructor(ci?: CultureInfo) {
        if (!ci) {
            ci = new CultureInfo(Culture.Italian);
        }

        super(ci);

        this.BindDictionary(ItalianNumericWithUnit.CurrencySuffixList);
        this.BindDictionary(ItalianNumericWithUnit.CurrencyPrefixList);
    }
}
