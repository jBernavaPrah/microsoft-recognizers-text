import {
    BooleanExtractor,
    BooleanModel,
    BooleanParser,
    ChoiceRecognizer,
    ChoiceOptions,
    Culture,
    EnglishBooleanExtractorConfiguration, recognizeBoolean,
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

describe('Test recognizer', () => {
    describe('Check Locales', () => {

        test.each([
            {
                text: `Yes please`,
                culture: Culture.English,
                result: [{
                    'end': 2,
                    'resolution': { 'otherResults': [], 'score': 0.7, 'value': true },
                    'start': 0,
                    'text': 'Yes',
                    'typeName': 'boolean',
                }],
            },
            {
                text: `Si, por favor`,
                culture: Culture.Spanish,
                result: [{
                    'end': 1,
                    'resolution': { 'otherResults': [], 'score': 0.6, 'value': true },
                    'start': 0,
                    'text': 'Si',
                    'typeName': 'boolean',
                }],
            },
            {
                text: `Si, per piacere`,
                culture: Culture.Italian,
                result: [{
                    'end': 1,
                    'resolution': { 'otherResults': [], 'score': 0.6, 'value': true },
                    'start': 0,
                    'text': 'Si',
                    'typeName': 'boolean',
                }],
            },
            {
                text: `No grazie`,
                culture: Culture.Italian,
                result: [{
                    'end': 1,
                    'resolution': { 'otherResults': [], 'score': 0.7, 'value': false },
                    'start': 0,
                    'text': 'No',
                    'typeName': 'boolean',
                }],
            }
            // todo: add allow accents letters!!
            // {
            //     text: `Sì, per piacere`,
            //     culture: Culture.Italian,
            //     result: [{
            //         'end': 1,
            //         'resolution': { 'otherResults': [], 'score': 0.6, 'value': true },
            //         'start': 0,
            //         'text': 'Si',
            //         'typeName': 'boolean',
            //     }],
            // },
        ])(`It recognize correctly $culture`, (resp) => expect(recognizeBoolean(resp.text, resp.culture)).toEqual(resp.result));


    });


});
