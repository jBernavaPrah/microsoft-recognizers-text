// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ParseResult } from '@microsoft/recognizers-text';
import { INumberParserConfiguration } from '../parsers';
import { CultureInfo, Culture } from '../../culture';
import { ItalianNumeric } from '../../resources/italianNumeric';
import { RegExpUtility } from '@microsoft/recognizers-text';

export class ItalianNumberParserConfiguration implements INumberParserConfiguration {

    readonly cardinalNumberMap: ReadonlyMap<string, number>;
    readonly ordinalNumberMap: ReadonlyMap<string, number>;
    readonly roundNumberMap: ReadonlyMap<string, number>;
    readonly cultureInfo: CultureInfo;
    readonly digitalNumberRegex: RegExp;
    readonly fractionMarkerToken: string;
    readonly negativeNumberSignRegex: RegExp;
    readonly halfADozenRegex: RegExp;
    readonly halfADozenText: string;
    readonly langMarker: string;
    readonly nonDecimalSeparatorChar: string;
    readonly decimalSeparatorChar: string;
    readonly wordSeparatorToken: string;
    readonly writtenDecimalSeparatorTexts: readonly string[];
    readonly writtenGroupSeparatorTexts: readonly string[];
    readonly writtenIntegerSeparatorTexts: readonly string[];
    readonly writtenFractionSeparatorTexts: readonly string[];
    readonly roundMultiplierRegex: RegExp;

    constructor(ci?: CultureInfo) {
        if (!ci) {
            ci = new CultureInfo(Culture.Italian);
        }

        this.cultureInfo = ci;

        this.langMarker = ItalianNumeric.LangMarker;
        this.decimalSeparatorChar = ItalianNumeric.DecimalSeparatorChar;
        this.fractionMarkerToken = ItalianNumeric.FractionMarkerToken;
        this.nonDecimalSeparatorChar = ItalianNumeric.NonDecimalSeparatorChar;
        this.halfADozenText = ItalianNumeric.HalfADozenText;
        this.wordSeparatorToken = ItalianNumeric.WordSeparatorToken;

        this.roundMultiplierRegex = RegExpUtility.getSafeRegExp(ItalianNumeric.RoundMultiplierRegex, 'gis');

        this.writtenDecimalSeparatorTexts = ItalianNumeric.WrittenDecimalSeparatorTexts;
        this.writtenGroupSeparatorTexts = ItalianNumeric.WrittenGroupSeparatorTexts;
        this.writtenIntegerSeparatorTexts = ItalianNumeric.WrittenIntegerSeparatorTexts;
        this.writtenFractionSeparatorTexts = ItalianNumeric.WrittenFractionSeparatorTexts;

        this.cardinalNumberMap = ItalianNumeric.CardinalNumberMap;
        this.ordinalNumberMap = ItalianNumeric.OrdinalNumberMap;
        this.roundNumberMap = ItalianNumeric.RoundNumberMap;
        this.negativeNumberSignRegex = RegExpUtility.getSafeRegExp(ItalianNumeric.NegativeNumberSignRegex, 'is');
        this.halfADozenRegex = RegExpUtility.getSafeRegExp(ItalianNumeric.HalfADozenRegex, 'gis');
        this.digitalNumberRegex = RegExpUtility.getSafeRegExp(ItalianNumeric.DigitalNumberRegex, 'gis');
    }

    normalizeTokenSet(tokens: readonly string[], context: ParseResult): readonly string[] {
        const fracWords = new Array<string>();
        const tokenList = Array.from(tokens);
        const tokenLen = tokenList.length;
        for (let i = 0; i < tokenLen; i++) {
            if (tokenList[i].includes('-')) {
                const spiltedTokens = tokenList[i].split('-');
                if (spiltedTokens.length === 2 && this.ordinalNumberMap.has(spiltedTokens[1])) {
                    fracWords.push(spiltedTokens[0]);
                    fracWords.push(spiltedTokens[1]);
                }
                else {
                    fracWords.push(tokenList[i]);
                }
            }
            else if ((i < tokenLen - 2) && tokenList[i + 1] === '-') {
                if (this.ordinalNumberMap.has(tokenList[i + 2])) {
                    fracWords.push(tokenList[i]);
                    fracWords.push(tokenList[i + 2]);
                }
                else {
                    fracWords.push(tokenList[i] + tokenList[i + 1] + tokenList[i + 2]);
                }

                i += 2;
            }
            else {
                fracWords.push(tokenList[i]);
            }
        }
        return fracWords;
    }

    resolveCompositeNumber(numberStr: string): number {
        if (numberStr.includes('-')) {
            const numbers = numberStr.split('-');
            let ret = 0;
            numbers.forEach(num => {
                if (this.ordinalNumberMap.has(num)) {
                    ret += this.ordinalNumberMap.get(num) as number;
                }
                else if (this.cardinalNumberMap.has(num)) {
                    ret += this.cardinalNumberMap.get(num) as number;
                }
            });

            return ret;
        }

        if (this.ordinalNumberMap.has(numberStr)) {
            return this.ordinalNumberMap.get(numberStr) as number;
        }

        if (this.cardinalNumberMap.has(numberStr)) {
            return this.cardinalNumberMap.get(numberStr) as number;
        }

        return 0;
    }

}
