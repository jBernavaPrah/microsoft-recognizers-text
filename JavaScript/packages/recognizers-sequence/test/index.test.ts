import {
    BasePhoneNumberExtractor, Culture,
    EnglishPhoneNumberExtractorConfiguration,
    PhoneNumberModel,
    PhoneNumberParser, SequenceOptions, SequenceRecognizer,
} from '../src';

const InvalidCulture = 'vo-id';

const controlModel = new PhoneNumberModel(
    new PhoneNumberParser(),
    new BasePhoneNumberExtractor(new EnglishPhoneNumberExtractorConfiguration()));

function clearCache() {
    const recognizer = new SequenceRecognizer(Culture.English);
    // @ts-ignore
    Object.getPrototypeOf(recognizer.modelFactory).constructor.cache.clear();
}

function getCache(recognizer: SequenceRecognizer) {
    // @ts-ignore
    return Object.getPrototypeOf(recognizer.modelFactory).constructor.cache;
}

describe(`sequenceRecognizer - initialization -`, () => {
    it('WithoutCulture_UseTargetCulture', () => {
        const recognizer = new SequenceRecognizer(Culture.English);
        expect(recognizer.getPhoneNumberModel()).toEqual(controlModel);
    });

    it('WithInvalidCulture_UseTargetCulture', () => {
        const recognizer = new SequenceRecognizer(Culture.English);
        expect(recognizer.getPhoneNumberModel(InvalidCulture)).toEqual(controlModel);
    });

    it('WithInvalidCultureAsTargetAndWithoutFallback_ThrowError', () => {
        const recognizer = new SequenceRecognizer(InvalidCulture);
        expect(() => {
            recognizer.getPhoneNumberModel(null, false);
        }).toThrow();
    });

    it('InitializationWithIntOption_ResolveOptionsEnum', () => {
        const recognizer = new SequenceRecognizer(Culture.English, 0);
        expect((recognizer.Options & SequenceOptions.None)).toEqual(SequenceOptions.None);
    });

    it('InitializationWithInvalidOptions_ThrowError', () => {
        expect(() => {
            new SequenceRecognizer(InvalidCulture, -1);
        }).toThrow();
    });
});

describe(`sequenceRecognizer - cache -`, () => {
    it('WithLazyInitialization_CacheEmpty', () => {
        clearCache();
        const recognizer = new SequenceRecognizer(Culture.English, 0, true);
        expect(getCache(recognizer).size).toEqual(0);
    });

    it('WithoutLazyInitialization_CacheFull', () => {
        clearCache();
        const recognizer = new SequenceRecognizer(Culture.English, 0, false);
        expect(getCache(recognizer).size).not.toEqual(0);
    });

    it('WithoutLazyInitializationAndCulture_CacheWithCulture', () => {
        clearCache();
        const recognizer = new SequenceRecognizer(Culture.English, 0, false);
        getCache(recognizer).forEach((value: any, key: any) => expect(JSON.parse(key).culture).toEqual(Culture.English));
    });
});
