import { Culture, NumberRecognizer } from '../src';


describe('Recognizer English', () => {
    test.each([
        // ['eleven', [{ 'end': 5, 'resolution': { 'value': '11' }, 'start': 0, 'text': 'eleven', 'typeName': 'number' }]],
        // ['it is only 3', [{
        //     'end': 11,
        //     'resolution': { 'value': '3' },
        //     'start': 11,
        //     'text': '3',
        //     'typeName': 'number',
        // }]],
        // ['I need four and a half kg', [{
        //     'end': 21,
        //     'resolution': { 'value': '4.5' },
        //     'start': 7,
        //     'text': 'four and a half',
        //     'typeName': 'number',
        // }]],

        // the next test need to pass!
        //["I need 4 and a half kg", [{"end": 18, "resolution": {"value": "4.5"}, "start": 7, "text": "4 and a half", "typeName": "number"}]],
        ['eleven and a half', [{
            'end': 16,
            'resolution': { 'value': '11.5' },
            'start': 0,
            'text': 'eleven and a half',
            'typeName': 'number',
        }]],
        //["sono solo 3", [{"end": 10, "resolution": {"value": "3"}, "start": 10, "text": "3", "typeName": "number"}]],
        //["mi servono quattro kg e mezzo", [{"end": 28, "resolution": {"value": "4,5"}, "start": 11, "text": "quattro e mezzo", "typeName": "number"}]],
    ])('Search from %s ', (text, result) => {
        const recognizer = new NumberRecognizer(Culture.English);
        const model = recognizer.getNumberModel();
        expect(model.parse(text)).toEqual(result);
    });
});

describe('Recognizer Italian', () => {

    test.each([
        //["undici", [{"end": 5, "resolution": {"value": "11"}, "start": 0, "text": "undici", "typeName": "number"}]],
        ['undici e mezzo', [{
            'end': 13,
            'resolution': { 'value': '11,5' },
            'start': 0,
            'text': 'undici e mezzo',
            'typeName': 'number',
        }]],
        //["sono solo 3", [{"end": 10, "resolution": {"value": "3"}, "start": 10, "text": "3", "typeName": "number"}]],
        //["mi servono quattro kg e mezzo", [{"end": 28, "resolution": {"value": "4,5"}, "start": 11, "text": "quattro e mezzo", "typeName": "number"}]],
    ])('Search from %s ', (text, result) => {
        const recognizer = new NumberRecognizer(Culture.Italian);
        const model = recognizer.getNumberModel();
        expect(model.parse(text)).toEqual(result);
    });

});
