import {
    BooleanExtractor,
    BooleanModel,
    BooleanParser,
    ChoiceRecognizer,
    ChoiceOptions,
    Culture,
    EnglishBooleanExtractorConfiguration,
} from '../src/index';

const InvalidCulture = 'vo-id';
describe('choiceRecognizer - initialization', () => {

    const controlModel = new BooleanModel(
        new BooleanParser(),
        new BooleanExtractor(new EnglishBooleanExtractorConfiguration()));

    test('With Culture in both Construct and getBooleanModel', () => {
        const recognizer = new ChoiceRecognizer(Culture.English);
        expect((recognizer.getBooleanModel(Culture.English))).toEqual(controlModel);
    });

    test('With Culture only on Construct', () => {
        const recognizer = new ChoiceRecognizer(Culture.English);
        expect((recognizer.getBooleanModel())).toEqual(controlModel);
    });

    it('WithInvalidCultureAndWithoutFallback_ThrowError', () => {
        const recognizer = new ChoiceRecognizer(InvalidCulture);
        expect(() => recognizer.getBooleanModel(InvalidCulture, false)).toThrow();
    });

    it('WithoutTargetCultureAndWithoutCulture_FallbackToEnglishCulture', () => {
        const recognizer = new ChoiceRecognizer(InvalidCulture);
        expect((recognizer.getBooleanModel())).toEqual(controlModel);
    });

    it('InitializationWithIntOption_ResolveOptionsEnum', () => {
        const recognizer = new ChoiceRecognizer(Culture.English, 0);
        expect((recognizer.Options & ChoiceOptions.None)).toEqual(ChoiceOptions.None);
    });

    it('InitializationWithInvalidOptions_ThrowError', () => {
        expect(() => new ChoiceRecognizer(Culture.English, 5)).toThrow();
    });

});
