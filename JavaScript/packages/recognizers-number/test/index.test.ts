import {
    AgnosticNumberParserFactory,
    AgnosticNumberParserType,
    EnglishNumberExtractor,
    EnglishNumberParserConfiguration,
    NumberMode,
    NumberModel,
    NumberOptions,
    NumberRecognizer,
} from '../src';
import { Culture } from '@microsoft/recognizers-text';

const InvalidCulture = 'vo-id';

const controlModel = new NumberModel(
    AgnosticNumberParserFactory.getParser(AgnosticNumberParserType.Number, new EnglishNumberParserConfiguration()),
    new EnglishNumberExtractor(NumberMode.PureNumber));

describe(`numberRecognizer - initialization -`, () => {
    test('WithoutCulture_UseTargetCulture', () => {
        const recognizer = new NumberRecognizer(Culture.English);
        expect(recognizer.getNumberModel()).toEqual(controlModel);
    });

    test('WithOtherCulture_NotUseTargetCulture', () => {
        const recognizer = new NumberRecognizer(Culture.English);

        expect(recognizer.getNumberModel(Culture.Spanish)).not.toEqual(controlModel);
    });

    test('WithInvalidCultureAndWithoutFallback_ThrowError', () => {
        const recognizer = new NumberRecognizer(InvalidCulture);
        expect(() => recognizer.getNumberModel(InvalidCulture, false)).toThrow();

    });

    test('WithInvalidCultureAsTargetAndWithoutFallback_ThrowError', () => {
        const recognizer = new NumberRecognizer(InvalidCulture);
        expect(() => recognizer.getNumberModel(null, false)).toThrow();
    });

    test('WithoutTargetCultureAndWithoutCulture_FallbackToEnglishCulture', () => {
        const recognizer = new NumberRecognizer();
        expect(recognizer.getNumberModel()).toEqual(controlModel);
    });

    test('InitializationWithIntOption_ResolveOptionsEnum', () => {
        const recognizer = new NumberRecognizer(Culture.English, 0);
        expect((recognizer.Options & NumberOptions.None)).toEqual(NumberOptions.None);
    });

    test('InitializationWithInvalidOptions_ThrowError', () => {
        expect(() => {
            new NumberRecognizer(InvalidCulture, -1);
        }).toThrow();
    });
});



