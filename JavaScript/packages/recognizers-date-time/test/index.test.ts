import {
    BaseMergedParser,
    DateTimeModel,
    DateTimeOptions,
    EnglishMergedParserConfiguration,
    EnglishCommonDateTimeParserConfiguration,
    EnglishMergedExtractorConfiguration, BaseMergedExtractor, DateTimeRecognizer,
    Culture,
} from '../src';


const InvalidCulture = 'vo-id';

const controlModel = new DateTimeModel(
    new BaseMergedParser(new EnglishMergedParserConfiguration(new EnglishCommonDateTimeParserConfiguration()), DateTimeOptions.None),
    new BaseMergedExtractor(new EnglishMergedExtractorConfiguration(), DateTimeOptions.None));

function clearCache() {
    const recognizer = new DateTimeRecognizer(Culture.English);

    // @ts-ignore
    Object.getPrototypeOf(recognizer.modelFactory).constructor.cache.clear();
}

function getCache(recognizer: DateTimeRecognizer) {

    // @ts-ignore
    return Object.getPrototypeOf(recognizer.modelFactory).constructor.cache;
}

describe(`dateTimeRecognizer - initialization -`, () => {
    it('WithoutCulture_UseTargetCulture', () => {
        const recognizer = new DateTimeRecognizer(Culture.English);
        expect(recognizer.getDateTimeModel()).toEqual(controlModel);
    });

    it('WithOtherCulture_NotUseTargetCulture', () => {
        const recognizer = new DateTimeRecognizer(Culture.English);
        expect(recognizer.getDateTimeModel(Culture.Spanish)).not.toEqual(controlModel);
    });

    it('WithInvalidCulture_UseTargetCulture', () => {
        const recognizer = new DateTimeRecognizer(Culture.English);
        expect(recognizer.getDateTimeModel(InvalidCulture)).toEqual(controlModel);
    });


    it('WithInvalidCultureAsTargetAndWithoutFallback_ThrowError', () => {
        const recognizer = new DateTimeRecognizer(InvalidCulture);
        expect(() => recognizer.getDateTimeModel(null, false)).toThrow();
    });


    it('InitializationWithIntOption_ResolveOptionsEnum', () => {
        const recognizer = new DateTimeRecognizer(Culture.English, 5);
        expect((recognizer.Options & DateTimeOptions.SkipFromToMerge) === DateTimeOptions.SkipFromToMerge).toBeTruthy();
        expect((recognizer.Options & DateTimeOptions.Calendar) === DateTimeOptions.Calendar).toBeTruthy();
    });

    it('InitializationWithInvalidOptions_ThrowError', () => {
        expect(() => new DateTimeRecognizer(InvalidCulture, -1)).toThrow();
    });
});

describe(`dateTimeRecognizer - cache -`, () => {
    it('WithLazyInitialization_CacheEmpty', () => {
        clearCache();
        const recognizer = new DateTimeRecognizer(Culture.English, 0, true);
        expect(getCache(recognizer).size).toEqual(0);
    });

    it('WithoutLazyInitialization_CacheFull', () => {
        clearCache();
        const recognizer = new DateTimeRecognizer(Culture.English, 0, false);
        expect(getCache(recognizer).size).not.toEqual(0);
    });

    it('WithoutLazyInitializationAndCulture_CacheWithCulture', () => {
        clearCache();
        const recognizer = new DateTimeRecognizer(Culture.English, 0, true);

        getCache(recognizer).forEach((value:any, key:any) => expect(JSON.parse(key).culture).toEqual(Culture.English));
    });
});
