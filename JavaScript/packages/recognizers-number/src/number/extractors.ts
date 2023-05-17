// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { IExtractor, ExtractResult } from '@microsoft/recognizers-text';
import { Constants } from './constants';
import { BaseNumbers } from '../resources/baseNumbers';
import { Match, RegExpUtility } from '@microsoft/recognizers-text';
import { LongFormatType } from './models';
import escapeRegExp  from 'lodash.escaperegexp';

export interface RegExpValue {
    regExp: RegExp;
    value: string;
}

export interface RegExpRegExp {
    regExpKey: RegExp;
    regExpValue: RegExp;
}

export abstract class BaseNumberExtractor implements IExtractor {

    regexes!: RegExpValue[];

    ambiguityFiltersDict!: RegExpRegExp[];

    protected extractType: string = '';

    protected negativeNumberTermsRegex: RegExp | null = null;

    extract(source: string): ExtractResult[] {
        if (!source || source.trim().length === 0) {
            return [];
        }

        let result = new Array<ExtractResult>();
        const matchSource = new Map<Match, string>();
        const matched = new Array<boolean>(source.length);
        for (let i = 0; i < source.length; i++) {
            matched[i] = false;
        }

        const collections = this.regexes
            .map(o => ({ matches: RegExpUtility.getMatches(o.regExp, source), value: o.value }))
            .filter(o => o.matches && o.matches.length);

        collections.forEach(collection => {
            collection.matches.forEach(m => {
                for (let j = 0; j < m.length; j++) {
                    matched[m.index + j] = true;
                }

                // Keep Source Data for extra information
                matchSource.set(m, collection.value);
            });
        });

        let last = -1;
        for (let i = 0; i < source.length; i++) {
            if (matched[i]) {
                if (i + 1 === source.length || !matched[i + 1]) {
                    let start = last + 1;
                    let length = i - last;
                    let substr = source.substring(start, start + length);
                    const srcMatch = Array.from(matchSource.keys()).find(m => m.index === start && m.length === length);

                    // Extract negative numbers
                    if (this.negativeNumberTermsRegex !== null) {
                        const match = source.substr(0, start).match(this.negativeNumberTermsRegex);
                        if (match) {
                            start = match.index!;
                            length = length + match[0].length;
                            substr = match[0] + substr;
                        }
                    }

                    if (srcMatch) {
                        result.push({
                            start: start,
                            length: length,
                            text: substr,
                            type: this.extractType,
                            data: matchSource.has(srcMatch) ? matchSource.get(srcMatch) : null,
                        } as ExtractResult);
                    }
                }
            }
            else {
                last = i;
            }
        }

        result = this.filterAmbiguity(result, source);
        return result;
    }

    private filterAmbiguity(extractResults: ExtractResult[], text: string):ExtractResult[] {
        if (this.ambiguityFiltersDict !== null && this.ambiguityFiltersDict !== undefined) {
            for (const regex of this.ambiguityFiltersDict) {
                for (const extractResult of extractResults) {
                    if (RegExpUtility.isMatch(regex.regExpKey, extractResult.text)) {
                        const matches = RegExpUtility.getMatches(regex.regExpValue, text);
                        if (matches && matches.length) {
                            extractResults = extractResults.filter(er => matches.find(m => m.index < er.start + er.length && m.index + m.length > er.start) === undefined);
                        }
                    }
                }
            }
        }

        return extractResults;
    }

    protected generateLongFormatNumberRegexes(type: LongFormatType, placeholder: string = BaseNumbers.PlaceHolderDefault): RegExp {

        const thousandsMark = escapeRegExp(type.thousandsMark);
        const decimalsMark = escapeRegExp(type.decimalsMark);

        const regexDefinition = type.decimalsMark === '\0'
            ? BaseNumbers.IntegerRegexDefinition(placeholder, thousandsMark)
            : BaseNumbers.DoubleRegexDefinition(placeholder, thousandsMark, decimalsMark);

        return RegExpUtility.getSafeRegExp(regexDefinition, 'gis');
    }
}

export abstract class BasePercentageExtractor implements IExtractor {
    regexes: RegExp[];

    protected static readonly numExtType: string = Constants.SYS_NUM;

    protected extractType: string = Constants.SYS_NUM_PERCENTAGE;

    private readonly numberExtractor: BaseNumberExtractor;

    constructor(numberExtractor: BaseNumberExtractor) {
        this.numberExtractor = numberExtractor;
        this.regexes = this.initRegexes();
    }

    protected abstract initRegexes(): RegExp[];

    extract(source: string): ExtractResult[] {
        const originSource = source;

        // preprocess the source sentence via extracting and replacing the numbers in it
        const preprocess = this.preprocessStrWithNumberExtracted(originSource);
        source = preprocess.source;
        const positionMap: Map<number, number>= preprocess.positionMap;
        const numExtResults: ExtractResult[]= preprocess.numExtResults;


        const allMatches = this.regexes.map(rx => RegExpUtility.getMatches(rx, source));

        const matched = new Array<boolean>(source.length);
        for (let i = 0; i < source.length; i++) {
            matched[i] = false;
        }

        for (let i = 0; i < allMatches.length; i++) {
            allMatches[i].forEach(match => {
                for (let j = 0; j < match.length; j++) {
                    matched[j + match.index] = true;
                }
            });
        }

        const result = new Array<ExtractResult>();
        let last = -1;
        // get index of each matched results
        for (let i = 0; i < source.length; i++) {
            if (matched[i]) {
                if (i + 1 === source.length || !matched[i + 1]) {
                    const start = last + 1;
                    const length = i - last;
                    const substr = source.substring(start, start + length);
                    const er: ExtractResult = {
                        start: start,
                        length: length,
                        text: substr,
                        type: this.extractType,
                    } as ExtractResult;
                    result.push(er);
                }
            }
            else {
                last = i;
            }
        }

        // post-processing, restoring the extracted numbers
        this.postProcessing(result, originSource, positionMap, numExtResults);

        return result;
    }

    // get the number extractor results and convert the extracted numbers to @sys.num, so that the regexes can work
    private preprocessStrWithNumberExtracted(str: string): {
        source: string,
        positionMap: Map<number, number>,
        numExtResults: ExtractResult[]
    } {
        const positionMap = new Map<number, number>();

        const numExtResults = this.numberExtractor.extract(str);
        const replaceText = BaseNumbers.NumberReplaceToken;

        const match = new Array<number>(str.length);
        const strParts = new Array<number[]>();
        let start: number;
        let end: number;
        for (let i = 0; i < str.length; i++) {
            match[i] = -1;
        }

        for (let i = 0; i < numExtResults.length; i++) {
            const extraction = numExtResults[i];
            start = extraction.start;
            end = extraction.length + start;
            for (let j = start; j < end; j++) {
                if (match[j] === -1) {
                    match[j] = i;
                }
            }
        }

        start = 0;
        for (let i = 1; i < str.length; i++) {
            if (match[i] !== match[i - 1]) {
                strParts.push([start, i - 1]);
                start = i;
            }
        }
        strParts.push([start, str.length - 1]);

        let ret = '';
        let index = 0;
        strParts.forEach(strPart => {
            start = strPart[0];
            end = strPart[1];
            const type = match[start];
            if (type === -1) {
                ret += str.substring(start, end + 1);
                for (let i = start; i <= end; i++) {
                    positionMap.set(index++, i);
                }
            }
            else {
                ret += replaceText;
                for (let i = 0; i < replaceText.length; i++) {
                    positionMap.set(index++, start);
                }
            }
        });


        positionMap.set(index++, str.length);

        return {
            numExtResults: numExtResults,
            source: ret,
            positionMap: positionMap,
        };
    }

    // replace the @sys.num to the real patterns, directly modifies the ExtractResult
    private postProcessing(results: ExtractResult[], originSource: string, positionMap: Map<number, number>, numExtResults: ExtractResult[]): void {
        const replaceText = BaseNumbers.NumberReplaceToken;
        for (let i = 0; i < results.length; i++) {
            const start = results[i].start;
            const end = start + results[i].length;
            const str = results[i].text;
            if (positionMap.has(start) && positionMap.has(end)) {
                const originStart = positionMap.get(start)!;
                const originLenth = positionMap.get(end)! - originStart;
                results[i].start = originStart;
                results[i].length = originLenth;
                results[i].text = originSource.substring(originStart, originStart + originLenth).trim();
                const numStart = str.indexOf(replaceText);
                if (numStart !== -1) {
                    const numOriginStart = start + numStart;
                    if (positionMap.has(numStart)) {
                        const dataKey = originSource.substring(positionMap.get(numOriginStart)!, positionMap.get(numOriginStart + replaceText.length));

                        for (let j = i; j < numExtResults.length; j++) {
                            if (results[i].start === numExtResults[j].start && results[i].text.includes(numExtResults[j].text)) {
                                results[i].data = [dataKey, numExtResults[j]];
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    // read the rules
    protected buildRegexes(regexStrs: string[], ignoreCase: boolean = true): RegExp[] {
        return regexStrs.map(regexStr => {
            let options = 'gs';
            if (ignoreCase) {
                options += 'i';
            }

            return RegExpUtility.getSafeRegExp(regexStr, options);
        });
    }
}
