// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { CultureInfo, Culture } from '@microsoft/recognizers-text-number';
import { Constants } from '../constants';
import { ItalianNumberWithUnitExtractorConfiguration, ItalianNumberWithUnitParserConfiguration } from './base';
import { ItalianNumericWithUnit } from '../../resources/italianNumericWithUnit';

export class ItalianAgeExtractorConfiguration extends ItalianNumberWithUnitExtractorConfiguration {
    readonly suffixList: ReadonlyMap<string, string>;
    readonly prefixList: ReadonlyMap<string, string>;
    readonly ambiguousUnitList: readonly string[];
    readonly extractType: string;

    constructor(ci?: CultureInfo) {
        if (!ci) {
            ci = new CultureInfo(Culture.Italian);
        }

        super(ci);

        this.extractType = Constants.SYS_UNIT_AGE;

        this.suffixList = ItalianNumericWithUnit.AgeSuffixList;
        this.prefixList = new Map<string, string>();
        this.ambiguousUnitList = [];
    }
}

export class ItalianAgeParserConfiguration extends ItalianNumberWithUnitParserConfiguration {
    constructor(ci?: CultureInfo) {
        if (!ci) {
            ci = new CultureInfo(Culture.Italian);
        }

        super(ci);

        this.BindDictionary(ItalianNumericWithUnit.AgeSuffixList);
    }
}
