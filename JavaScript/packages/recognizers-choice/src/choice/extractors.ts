// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {IExtractor, ExtractResult, RegExpUtility, Match, StringUtility} from "@microsoft/recognizers-text";
import {Constants} from "./constants";
import GraphemeSplitter from "grapheme-splitter";

const splitter = new GraphemeSplitter();

export interface IChoiceExtractorConfiguration {
    regexesMap: Map<RegExp, string>;
    tokenRegex: RegExp;
    allowPartialMatch: boolean;
    maxDistance: number;
    onlyTopMatch: boolean;
    emojiSkinToneRegex: RegExp;
}

export class ChoiceExtractor implements IExtractor {
    private readonly config: IChoiceExtractorConfiguration;
    protected extractType: string | undefined;

    constructor(config: IChoiceExtractorConfiguration) {
        this.config = config;
    }

    extract(source: string): ExtractResult[] {
        let results = new Array<ExtractResult>();
        const trimmedSource = source.toLowerCase();

        if (StringUtility.isNullOrWhitespace(source)) {
            return results;
        }

        const allMatches = new Array<Match>();
        let partialResults = new Array<ExtractResult>();
        const sourceTokens = this.tokenize(trimmedSource);

        this.config.regexesMap.forEach((typeExtracted, regex) => {
            RegExpUtility.getMatches(regex, trimmedSource).forEach(match => {
                const matchTokens = this.tokenize(match.value);
                const topScore = sourceTokens
                    .map((sToken, index) => this.matchValue(sourceTokens, matchTokens, index))
                    .reduce((top, value) => top = Math.max(top, value), 0.0);
                if (topScore > 0.0) {
                    const start = match.index;
                    const length = match.length;
                    const text = source.substr(start, length).trim();
                    partialResults.push({
                        start: start,
                        length: length,
                        text: text,
                        type: typeExtracted,
                        data: {
                            source: source,
                            score: topScore
                        }
                    });
                }
            });
        });

        if (partialResults.length === 0) {
            return results;
        }

        partialResults = partialResults.sort((a, b) => a.start - b.start);

        if (this.config.onlyTopMatch) {
            const topResult = partialResults.reduce((top, value) => top = top.data.score < value.data.score ? value : top, partialResults[0]);
            topResult.data.otherMatches = partialResults.filter(r => r !== topResult);
            results.push(topResult);
        } else {
            results = partialResults;
        }

        return results;
    }

    matchValue(source: string[], match: string[], startPos: number): number {
        let matched = 0;
        let emojiSkinToneMatch = 0;
        let totalDeviation = 0;
        match.forEach(matchToken => {
            const pos = source.indexOf(matchToken, startPos);
            if (pos >= 0) {
                const distance = matched > 0 ? pos - startPos : 0;
                if (distance <= this.config.maxDistance) {
                    matched++;
                    totalDeviation += distance;
                    startPos = pos + 1;
                    emojiSkinToneMatch += RegExpUtility.getMatches(this.config.emojiSkinToneRegex, matchToken).length;
                }
            }
        });

        let score = 0.0;
        const emojiSkinToneLen = RegExpUtility.getMatches(this.config.emojiSkinToneRegex, source.join()).length;
        if (matched > 0 && (matched === (match.length) || this.config.allowPartialMatch)) {
            const completeness = matched / match.length;
            const accuracy = completeness * (matched / (matched + totalDeviation));
            const initialScore = accuracy * ((matched + emojiSkinToneMatch) / (source.length + emojiSkinToneLen));
            score = 0.4 + (0.6 * initialScore);
        }
        return score;
    }

    private tokenize(source: string): string[] {
        const tokens: string[] = [];
        const chars = splitter.splitGraphemes(source);
        let token = '';
        chars.forEach(c => {
            const codePoint = (c.codePointAt(0) || c.charAt(0)) as number;
            if (codePoint > 0xFFFF) {
                // Character is in a Supplementary Unicode Plane. This is where emoji live so
                // we're going to just break each character in this range out as its own token.
                tokens.push(c);
                if (!StringUtility.isNullOrWhitespace(token)) {
                    tokens.push(token);
                    token = '';
                }
            } else if (!(this.config.tokenRegex.test(c) || StringUtility.isWhitespace(c))) {
                token = token.concat(c);
            } else if (!StringUtility.isNullOrWhitespace(token)) {
                tokens.push(token);
                token = '';
            }
        });

        if (!StringUtility.isNullOrWhitespace(token)) {
            tokens.push(token);
            token = '';
        }
        return tokens;
    }
}

export interface IBooleanExtractorConfiguration {
    regexTrue: RegExp;
    regexFalse: RegExp;
    tokenRegex: RegExp;
    onlyTopMatch: boolean;
    emojiSkinToneRegex: RegExp;
}

export class BooleanExtractor extends ChoiceExtractor {
    private static readonly booleanTrue = Constants.SYS_BOOLEAN_TRUE;
    private static readonly booleanFalse = Constants.SYS_BOOLEAN_FALSE;

    constructor(config: IBooleanExtractorConfiguration) {
        const regexesMap = new Map<RegExp, string>()
            .set(config.regexTrue, Constants.SYS_BOOLEAN_TRUE)
            .set(config.regexFalse, Constants.SYS_BOOLEAN_FALSE);

        const optionsConfig: IChoiceExtractorConfiguration = {
            regexesMap: regexesMap,
            tokenRegex: config.tokenRegex,
            allowPartialMatch: false,
            maxDistance: 2,
            onlyTopMatch: config.onlyTopMatch,
            emojiSkinToneRegex: config.emojiSkinToneRegex
        };
        super(optionsConfig);
        this.extractType = Constants.SYS_BOOLEAN;
    }
}
