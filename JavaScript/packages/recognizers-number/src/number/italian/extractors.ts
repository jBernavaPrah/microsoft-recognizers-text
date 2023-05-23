// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { BaseNumberExtractor, BasePercentageExtractor, RegExpRegExp, RegExpValue } from '../extractors';
import { Constants } from '../constants';
import { LongFormatType, NumberMode } from '../models';
import { ItalianNumeric } from '../../resources/italianNumeric';
import { BaseNumbers } from '../../resources/baseNumbers';
import { RegExpUtility } from '@microsoft/recognizers-text';

export class ItalianNumberExtractor extends BaseNumberExtractor {
    protected extractType: string = Constants.SYS_NUM;
    protected negativeNumberTermsRegex: RegExp;

    constructor(mode: NumberMode = NumberMode.Default) {
        super();

        this.negativeNumberTermsRegex = RegExpUtility.getSafeRegExp(ItalianNumeric.NegativeNumberTermsRegex + "$", "is");

        const regexes = new Array<RegExpValue>();

        // Add Cardinal
        let cardExtract: ItalianCardinalExtractor | null = null;
        switch (mode) {
            case NumberMode.PureNumber:
                cardExtract = new ItalianCardinalExtractor(ItalianNumeric.PlaceHolderPureNumber);
                break;
            case NumberMode.Currency:
                regexes.push({ regExp: RegExpUtility.getSafeRegExp(BaseNumbers.CurrencyRegex, "gs"), value: "IntegerNum" });
                break;
            case NumberMode.Default:
                break;
        }

        if (cardExtract === null) {
            cardExtract = new ItalianCardinalExtractor();
        }

        cardExtract.regexes.forEach(r => regexes.push(r));

        // Add Fraction
        const fracExtract = new ItalianFractionExtractor(mode);
        fracExtract.regexes.forEach(r => regexes.push(r));

        this.regexes = regexes;

        // Add filter
        const ambiguityFiltersDict = new Array<RegExpRegExp>();

        if (mode != NumberMode.Unit) {
            for (const [ key, value ] of ItalianNumeric.AmbiguityFiltersDict){
                ambiguityFiltersDict.push({ regExpKey: RegExpUtility.getSafeRegExp(key, "gs"), regExpValue: RegExpUtility.getSafeRegExp(value, "gs")})
            }

        }

        this.ambiguityFiltersDict = ambiguityFiltersDict;
    }
}

export class ItalianCardinalExtractor extends BaseNumberExtractor {
    protected extractType: string = Constants.SYS_NUM_CARDINAL;

    constructor(placeholder: string = ItalianNumeric.PlaceHolderDefault) {
        super();
        const regexes = new Array<RegExpValue>();

        // Add Integer Regexes
        const intExtract = new ItalianIntegerExtractor(placeholder);
        intExtract.regexes.forEach(r => regexes.push(r));

        // Add Double Regexes
        const doubleExtract = new ItalianDoubleExtractor(placeholder);
        doubleExtract.regexes.forEach(r => regexes.push(r));

        this.regexes = regexes;
    }
}

export class ItalianIntegerExtractor extends BaseNumberExtractor {
    protected extractType: string = Constants.SYS_NUM_INTEGER;

    constructor(placeholder: string = ItalianNumeric.PlaceHolderDefault) {
        super();

        this.regexes = new Array<RegExpValue>(
            {
                regExp: RegExpUtility.getSafeRegExp(ItalianNumeric.NumbersWithPlaceHolder(placeholder), "gi"),
                value: "IntegerNum"
            },
            {
                regExp: RegExpUtility.getSafeRegExp(ItalianNumeric.NumbersWithSuffix, "gs"),
                value: "IntegerNum"
            },
            {
                regExp: this.generateLongFormatNumberRegexes(LongFormatType.integerNumComma, placeholder),
                value: "IntegerNum"
            },
            {
                regExp: this.generateLongFormatNumberRegexes(LongFormatType.integerNumBlank, placeholder),
                value: "IntegerNum"
            },
            {
                regExp: this.generateLongFormatNumberRegexes(LongFormatType.integerNumNoBreakSpace, placeholder),
                value: "IntegerNum"
            },
            {
                regExp: RegExpUtility.getSafeRegExp(ItalianNumeric.RoundNumberIntegerRegexWithLocks, "gis"),
                value: "IntegerNum"
            },
            {
                regExp: RegExpUtility.getSafeRegExp(ItalianNumeric.NumbersWithDozenSuffix, "gis"),
                value: "IntegerNum"
            },
            {
                regExp: RegExpUtility.getSafeRegExp(ItalianNumeric.AllIntRegexWithLocks, "gis"),
                value: "IntegerIta"
            },
            {
                regExp: RegExpUtility.getSafeRegExp(ItalianNumeric.AllIntRegexWithDozenSuffixLocks, "gis"),
                value: "IntegerIta"
            }
        );
    }
}

export class ItalianDoubleExtractor extends BaseNumberExtractor {
    protected extractType: string = Constants.SYS_NUM_DOUBLE;

    constructor(placeholder: string = ItalianNumeric.PlaceHolderDefault) {
        super();

        this.regexes = new Array<RegExpValue>(
            {
                regExp: RegExpUtility.getSafeRegExp(ItalianNumeric.DoubleDecimalPointRegex(placeholder), "gis"),
                value: "DoubleNum"
            },
            {
                regExp: RegExpUtility.getSafeRegExp(ItalianNumeric.DoubleWithoutIntegralRegex(placeholder), "gis"),
                value: "DoubleNum"
            },
            {
                regExp: this.generateLongFormatNumberRegexes(LongFormatType.doubleNumCommaDot, placeholder),
                value: "DoubleNum"
            },
            {
                regExp: this.generateLongFormatNumberRegexes(LongFormatType.doubleNumNoBreakSpaceDot, placeholder),
                value: "DoubleNum"
            },
            {
                regExp: RegExpUtility.getSafeRegExp(ItalianNumeric.DoubleWithMultiplierRegex, "gs"),
                value: "DoubleNum"
            },
            {
                regExp: RegExpUtility.getSafeRegExp(ItalianNumeric.DoubleWithRoundNumber, "gis"),
                value: "DoubleNum"
            },
            {
                regExp: RegExpUtility.getSafeRegExp(ItalianNumeric.DoubleAllFloatRegex, "gis"),
                value: "DoubleIta"
            },
            {
                regExp: RegExpUtility.getSafeRegExp(ItalianNumeric.DoubleExponentialNotationRegex, "gis"),
                value: "DoublePow"
            },
            {
                regExp: RegExpUtility.getSafeRegExp(ItalianNumeric.DoubleCaretExponentialNotationRegex, "gis"),
                value: "DoublePow"
            }
        );
    }
}

export class ItalianFractionExtractor extends BaseNumberExtractor {

    protected extractType: string = Constants.SYS_NUM_FRACTION;

    constructor(mode: NumberMode = NumberMode.Default) {
        super();

        const regexes = new Array<RegExpValue>(
            {
                regExp: RegExpUtility.getSafeRegExp(ItalianNumeric.FractionNotationWithSpacesRegex, "gis"),
                value: "FracNum"
            },
            {
                regExp: RegExpUtility.getSafeRegExp(ItalianNumeric.FractionNotationRegex, "gis"),
                value: "FracNum"
            },
            {
                regExp: RegExpUtility.getSafeRegExp(ItalianNumeric.FractionNounRegex, "gis"),
                value: "FracIta"
            },
            {
                regExp: RegExpUtility.getSafeRegExp(ItalianNumeric.FractionNounWithArticleRegex, "gis"),
                value: "FracIta"
            }
        );

        // Not add FractionPrepositionRegex when the mode is Unit to avoid wrong recognize cases like "$1000 over 3"
        if (mode != NumberMode.Unit) {
            regexes.push({
                regExp: RegExpUtility.getSafeRegExp(ItalianNumeric.FractionPrepositionRegex, "gis"),
                value: "FracIta"
                });
        };

        this.regexes = regexes;
    }
}

export class ItalianOrdinalExtractor extends BaseNumberExtractor {
    protected extractType: string = Constants.SYS_NUM_ORDINAL;

    constructor() {
        super();
        this.regexes = new Array<RegExpValue>(
            {
                regExp: RegExpUtility.getSafeRegExp(ItalianNumeric.OrdinalSuffixRegex, "gis"),
                value: "OrdinalNum"
            },
            {
                regExp: RegExpUtility.getSafeRegExp(ItalianNumeric.OrdinalNumericRegex, "gis"),
                value: "OrdinalNum"
            },
            {
                regExp: RegExpUtility.getSafeRegExp(ItalianNumeric.OrdinalItalianRegex, "gis"),
                value: "OrdIta"
            },
            {
                regExp: RegExpUtility.getSafeRegExp(ItalianNumeric.OrdinalRoundNumberRegex, "gis"),
                value: "OrdIta"
            }
        );
    }
}

export class ItalianPercentageExtractor extends BasePercentageExtractor {
    constructor() {
        super(new ItalianNumberExtractor());
    }

    protected initRegexes(): RegExp[] {
        const regexStrs = [
            ItalianNumeric.NumberWithSuffixPercentage,
            ItalianNumeric.NumberWithPrefixPercentage
        ];

        return this.buildRegexes(regexStrs);
    }
}
