// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { Recognizer, IModel, Culture, ModelResult } from '@microsoft/recognizers-text';
import { BooleanModel } from './models';
import { BooleanExtractor } from './extractors';
import { BooleanParser } from './parsers';
import { ChineseBooleanExtractorConfiguration } from './chinese/boolean';
import { DutchBooleanExtractorConfiguration } from './dutch/boolean';
import { EnglishBooleanExtractorConfiguration } from './english/boolean';
import { FrenchBooleanExtractorConfiguration } from './french/boolean';
import { GermanBooleanExtractorConfiguration } from './german/boolean';
import { JapaneseBooleanExtractorConfiguration } from './japanese/boolean';
import { PortugueseBooleanExtractorConfiguration } from './portuguese/boolean';
import { SpanishBooleanExtractorConfiguration } from './spanish/boolean';
import { ItalianBooleanExtractorConfiguration } from './italian/boolean';


export enum ChoiceOptions {
    None = 0,
}

export function recognizeBoolean(query: string,
    culture: string,
    options: ChoiceOptions = ChoiceOptions.None,
    fallbackToDefaultCulture: boolean = true): ModelResult[] {
    const recognizer = new ChoiceRecognizer(culture, options);
    const model = recognizer.getBooleanModel(culture, fallbackToDefaultCulture);
    return model.parse(query);
}

export default class ChoiceRecognizer extends Recognizer<ChoiceOptions> {
    constructor(culture: string, options: ChoiceOptions|number = ChoiceOptions.None, lazyInitialization: boolean = false) {
        super(culture, options, lazyInitialization);
    }

    protected InitializeConfiguration(): void {
        // #region Chinese
        this.registerModel('BooleanModel', Culture.Chinese, () => new BooleanModel(
            new BooleanParser(),
            new BooleanExtractor(new ChineseBooleanExtractorConfiguration()),
        ));
        // #endregion

        // #region Dutch
        this.registerModel('BooleanModel', Culture.Dutch, () => new BooleanModel(
            new BooleanParser(),
            new BooleanExtractor(new DutchBooleanExtractorConfiguration()),
        ));
        // #endregion

        // #region English
        this.registerModel('BooleanModel', Culture.English, () => new BooleanModel(
            new BooleanParser(),
            new BooleanExtractor(new EnglishBooleanExtractorConfiguration()),
        ));
        // #endregion

        // #region French
        this.registerModel('BooleanModel', Culture.French, () => new BooleanModel(
            new BooleanParser(),
            new BooleanExtractor(new FrenchBooleanExtractorConfiguration()),
        ));
        // #endregion

        // #region German
        this.registerModel('BooleanModel', Culture.German, () => new BooleanModel(
            new BooleanParser(),
            new BooleanExtractor(new GermanBooleanExtractorConfiguration()),
        ));
        // #endregion

        // #region Japanese
        this.registerModel('BooleanModel', Culture.Japanese, () => new BooleanModel(
            new BooleanParser(),
            new BooleanExtractor(new JapaneseBooleanExtractorConfiguration()),
        ));
        // #endregion

        // #region Portuguese
        this.registerModel('BooleanModel', Culture.Portuguese, () => new BooleanModel(
            new BooleanParser(),
            new BooleanExtractor(new PortugueseBooleanExtractorConfiguration()),
        ));
        // #endregion

        // #region Spanish
        this.registerModel('BooleanModel', Culture.Spanish, () => new BooleanModel(
            new BooleanParser(),
            new BooleanExtractor(new SpanishBooleanExtractorConfiguration()),
        ));
        // #endregion

        // #region Italian
        this.registerModel('BooleanModel', Culture.Italian, () => new BooleanModel(
            new BooleanParser(),
            new BooleanExtractor(new ItalianBooleanExtractorConfiguration()),
        ));
        // #endregion
    }

    protected IsValidOptions(options: ChoiceOptions): boolean {
        return options in ChoiceOptions;
    }

    getBooleanModel(culture?: string | null | undefined, fallbackToDefaultCulture: boolean = true): IModel {
        return this.getModel('BooleanModel', culture, fallbackToDefaultCulture);
    }
}
