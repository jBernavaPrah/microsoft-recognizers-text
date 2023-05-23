import { Culture, IModel, ModelResult, Recognizer } from '../src';


class FakeModel implements IModel {
    readonly modelTypeName: string = 'fakeModel';

    parse(query: string): ModelResult[] {
        return [];
    }

}

class FakeRecognizer extends Recognizer<any> {

    public constructor(lazy: boolean = true) {
        super(Culture.English, undefined, lazy);
    }

    protected InitializeConfiguration(): void {
        this.registerModel('FakeModel', Culture.English, (options) => new FakeModel());
    }

    protected IsValidOptions(options: any): boolean {
        return true;
    }
}

function clearCache(): void {
    const recognizer = new FakeRecognizer();

    // TODO: the modelFactory is private!
    // @ts-ignore
    Object.getPrototypeOf(recognizer.modelFactory).constructor.cache.clear();
}

function getCache(recognizer: FakeRecognizer): any {
    // TODO: the modelFactory is private!
    // @ts-ignore
    return Object.getPrototypeOf(recognizer.modelFactory).constructor.cache;
}

describe(`Test cache`, () => {
    it('WithLazyInitialization_CacheEmpty', () => {
        clearCache();
        const recognizer = new FakeRecognizer();
        expect(getCache(recognizer).size).toBe(0);
    });

    it('WithoutLazyInitialization_CacheFull', () => {
        clearCache();
        const recognizer = new FakeRecognizer(false);
        expect(getCache(recognizer).size).not.toBe(0);
    });

    it('WithoutLazyInitializationAndCulture_CacheWithCulture', () => {
        clearCache();
        const recognizer = new FakeRecognizer();
        //console.log(getCache(recognizer))
        getCache(recognizer).forEach((value: any, key: any) => expect(JSON.parse(key).culture).toEqual('it'));
    });
});
