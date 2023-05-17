// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { CultureInfo, Culture } from '@microsoft/recognizers-text-number';
import { Constants } from '../constants';
import { ItalianNumberWithUnitExtractorConfiguration, ItalianNumberWithUnitParserConfiguration } from './base';
import { ItalianNumericWithUnit } from '../../resources/italianNumericWithUnit';

const dimensionSuffixList = new Map<string, string>([
    ...ItalianNumericWithUnit.InformationSuffixList,
    ...ItalianNumericWithUnit.AreaSuffixList,
    ...ItalianNumericWithUnit.LengthSuffixList,
    ...ItalianNumericWithUnit.SpeedSuffixList,
    ...ItalianNumericWithUnit.VolumeSuffixList,
    ...ItalianNumericWithUnit.WeightSuffixList,
]);


export class ItalianDimensionExtractorConfiguration extends ItalianNumberWithUnitExtractorConfiguration {

    readonly suffixList: ReadonlyMap<string, string>;
    readonly prefixList: ReadonlyMap<string, string>;
    readonly ambiguousUnitList: readonly string[];
    readonly extractType: string;

    constructor(ci?: CultureInfo) {
        if (!ci) {
            ci = new CultureInfo(Culture.Italian);
        }

        super(ci);

        this.extractType = Constants.SYS_UNIT_DIMENSION;

        this.suffixList = dimensionSuffixList;
        this.prefixList = new Map<string, string>();
        this.ambiguousUnitList = ItalianNumericWithUnit.AmbiguousDimensionUnitList.concat(
            ItalianNumericWithUnit.AmbiguousAngleUnitList.concat(
                ItalianNumericWithUnit.AmbiguousLengthUnitList.concat(
                    ItalianNumericWithUnit.AmbiguousWeightUnitList)));
    }
}

export class ItalianDimensionParserConfiguration extends ItalianNumberWithUnitParserConfiguration {
    constructor(ci?: CultureInfo) {
        if (!ci) {
            ci = new CultureInfo(Culture.Italian);
        }

        super(ci);

        this.BindDictionary(dimensionSuffixList);
    }
}
