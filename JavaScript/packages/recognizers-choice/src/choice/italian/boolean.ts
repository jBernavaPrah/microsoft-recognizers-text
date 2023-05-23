// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { RegExpUtility } from "@microsoft/recognizers-text";
import { IBooleanExtractorConfiguration } from "../extractors";
import { ItalianChoice } from "../../resources/italianChoice";

export class ItalianBooleanExtractorConfiguration implements IBooleanExtractorConfiguration {
    readonly regexTrue: RegExp;
    readonly regexFalse: RegExp;
    readonly tokenRegex: RegExp;
    readonly emojiSkinToneRegex: RegExp;
    readonly onlyTopMatch: boolean;

    constructor(onlyTopMatch: boolean = true) {
        this.emojiSkinToneRegex = RegExpUtility.getSafeRegExp(ItalianChoice.SkinToneRegex);
        this.regexTrue = RegExpUtility.getSafeRegExp(ItalianChoice.TrueRegex);
        this.regexFalse = RegExpUtility.getSafeRegExp(ItalianChoice.FalseRegex);
        this.tokenRegex = RegExpUtility.getSafeRegExp(ItalianChoice.TokenizerRegex, 'is');
        this.onlyTopMatch = onlyTopMatch;
    }
}
