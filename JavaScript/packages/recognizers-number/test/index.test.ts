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


function clearCache(): void {
    const recognizer = new NumberRecognizer();

    // TODO: the modelFactory is private!
    // @ts-ignore
    Object.getPrototypeOf(recognizer.modelFactory).constructor.cache.clear();
}

function getCache(recognizer: NumberRecognizer): any {
    // TODO: the modelFactory is private!
    // @ts-ignore
    return Object.getPrototypeOf(recognizer.modelFactory).constructor.cache;
}

describe(`numberRecognizer - cache -`, () => {
    it('WithLazyInitialization_CacheEmpty', () => {
        clearCache();
        const recognizer = new NumberRecognizer(Culture.English, NumberOptions.None, true);
        expect(getCache(recognizer).size).toBe(0);
    });

    it('WithoutLazyInitialization_CacheFull', () => {
        clearCache();
        const recognizer = new NumberRecognizer(Culture.English, NumberOptions.None, false);
        expect(getCache(recognizer).size).not.toBe(0);
    });

    it('WithoutLazyInitializationAndCulture_CacheWithCulture', () => {
        clearCache();
        const recognizer = new NumberRecognizer(Culture.English, NumberOptions.None, false);
        //console.log(getCache(recognizer))
        getCache(recognizer).forEach((value: any, key: any) => expect(JSON.parse(key).culture).toEqual(Culture.English));
    });
});
