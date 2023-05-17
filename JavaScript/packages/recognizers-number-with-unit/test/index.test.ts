import {
    DimensionModel,
    EnglishDimensionExtractorConfiguration,
    EnglishDimensionParserConfiguration,
    NumberWithUnitExtractor, NumberWithUnitOptions,
    NumberWithUnitParser,
    NumberWithUnitRecognizer,
} from '../src';
import { Culture } from '@microsoft/recognizers-text';

const controlModel = new DimensionModel(new Map([[
    new NumberWithUnitExtractor(new EnglishDimensionExtractorConfiguration()),
    new NumberWithUnitParser(new EnglishDimensionParserConfiguration())]]));

const InvalidCulture = 'vo-id';

function clearCache() {
    const recognizer = new NumberWithUnitRecognizer(Culture.English);

    // @ts-ignore
    Object.getPrototypeOf(recognizer.modelFactory).constructor.cache.clear();
}

function getCache(recognizer: NumberWithUnitRecognizer) {
    // @ts-ignore
    return Object.getPrototypeOf(recognizer.modelFactory).constructor.cache;
}

describe(`numberWithUnitRecognizer - initialization -`, () => {
    it('WithoutCulture_UseTargetCulture', () => {
        const recognizer = new NumberWithUnitRecognizer(Culture.English);
        expect(recognizer.getDimensionModel()).toEqual(controlModel);
    });

    it('WithOtherCulture_NotUseTargetCulture', () => {
        const recognizer = new NumberWithUnitRecognizer(Culture.English);
        expect(recognizer.getDimensionModel(Culture.Spanish)).not.toEqual(controlModel);
    });

    it('WithInvalidCulture_UseTargetCulture', () => {
        const recognizer = new NumberWithUnitRecognizer(Culture.English);
        expect(recognizer.getDimensionModel(InvalidCulture)).toEqual(controlModel);
    });

    it('WithInvalidCultureAndWithoutFallback_ThrowError', () => {
        const recognizer = new NumberWithUnitRecognizer('ab');
        expect(() => recognizer.getDimensionModel(InvalidCulture, false)).toThrow();

    });

    it('WithInvalidCultureAsTargetAndWithoutFallback_ThrowError', () => {
        const recognizer = new NumberWithUnitRecognizer(InvalidCulture);
        expect(() => recognizer.getDimensionModel(null, false)).toThrow();
    });

    it('InitializationWithIntOption_ResolveOptionsEnum', () => {
        const recognizer = new NumberWithUnitRecognizer(Culture.English, 0);
        expect(recognizer.Options & NumberWithUnitOptions.None).toEqual(NumberWithUnitOptions.None);
    });

    it('InitializationWithInvalidOptions_ThrowError', () => {
        expect(() =>new NumberWithUnitRecognizer(InvalidCulture, -1)).toThrow();
    });
});

describe(`numberWithUnitRecognizer - cache -`, () => {
    it('WithLazyInitialization_CacheEmpty', () => {
        clearCache();
        const recognizer = new NumberWithUnitRecognizer(Culture.English, 0, true);
        expect(getCache(recognizer).size).toEqual(0);
    });

    it('WithoutLazyInitialization_CacheFull', () => {
        clearCache();
        const recognizer = new NumberWithUnitRecognizer(Culture.English, 0, false);
        expect(getCache(recognizer).size).not.toEqual(0);
    });

    it('WithoutLazyInitializationAndCulture_CacheWithCulture', () => {
        clearCache();
        const recognizer = new NumberWithUnitRecognizer(Culture.English, 0, false);
        getCache(recognizer).forEach((value: any, key: any) => JSON.parse(key).culture);
    });
});
