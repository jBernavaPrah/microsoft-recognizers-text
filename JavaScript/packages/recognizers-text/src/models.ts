// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {Culture} from "./culture";
import {StringUtility} from "./utilities";

export interface IModel {
    readonly modelTypeName: string

    parse(query: string): ModelResult[]
}

export class ModelResult {
    text!: string
    start!: number
    end!: number
    typeName!: string
    resolution!: { [key: string]: any }
}

export class ExtendedModelResult extends ModelResult {
    parentText!: string

    constructor(source: ModelResult | null = null) {
        super();
        if (source) {
            this.text = source.text;
            this.start = source.start;
            this.end = source.end;
            this.typeName = source.typeName;
            this.resolution = source.resolution;
        }
    }
}

class ModelFactoryKey<TModelOptions> {
    culture: string | null;
    modelType: string;
    options: TModelOptions | null;

    constructor(culture: string, modelType: string, options: TModelOptions | null = null) {
        this.culture = culture ? culture.toLowerCase() : null;
        this.modelType = modelType;
        this.options = options;
    }

    public toString(): string {
        return JSON.stringify(this);
    }

    public static fromString<TModelOptions>(key: string): ModelFactoryKey<TModelOptions> {
        return JSON.parse(key) as ModelFactoryKey<TModelOptions>;
    }
}

export class ModelFactory<TModelOptions> {
    static readonly fallbackCulture: string = Culture.English;

    private modelFactories: Map<string, (options: TModelOptions) => IModel> = new Map<string, (options: TModelOptions) => IModel>();

    private static cache: Map<string, IModel> = new Map<string, IModel>();

    getModel(modelTypeName: string, culture: string, fallbackToDefaultCulture: boolean, options: TModelOptions): IModel {

        let result = this.tryGetModel(modelTypeName, culture, options);
        if (!result.containsModel && fallbackToDefaultCulture) {
            result = this.tryGetModel(modelTypeName, ModelFactory.fallbackCulture, options);
        }

        if (result.containsModel) {
            return result.model!;
        }

        throw new Error(`Could not find Model with the specified configuration: ${culture},${modelTypeName}`);
    }

    tryGetModel(modelTypeName: string, culture: string, options: TModelOptions): {
        containsModel: boolean;
        model?: IModel
    } {
        culture = Culture.mapToNearestLanguage(culture);
        const cacheResult = this.getModelFromCache(modelTypeName, culture, options);
        if (cacheResult) {
            return {containsModel: true, model: cacheResult};
        }

        const key = this.generateKey(modelTypeName, culture);
        if (this.modelFactories.has(key)) {
            const model = this.modelFactories.get(key)!(options);
            this.registerModelInCache(modelTypeName, culture, options, model);
            return {containsModel: true, model: model};
        }

        return {containsModel: false};
    }

    registerModel(modelTypeName: string, culture: string, modelCreator: (options: TModelOptions) => IModel):void {
        const key = this.generateKey(modelTypeName, culture);
        if (this.modelFactories.has(key)) {
            throw new Error(`${culture}-${modelTypeName} has already been registered.`);
        }

        this.modelFactories.set(key, modelCreator);
    }

    initializeModels(targetCulture: string, options: TModelOptions):void {
        this.modelFactories.forEach((value, key) => {
            const modelFactoryKey = ModelFactoryKey.fromString<TModelOptions>(key);
            if (StringUtility.isNullOrEmpty(targetCulture) || modelFactoryKey.culture === targetCulture) {
                this.tryGetModel(modelFactoryKey.modelType, (modelFactoryKey.culture as string), modelFactoryKey.options!);
            }
        });
    }

    private generateKey(modelTypeName: string, culture: string): string {
        return new ModelFactoryKey(culture, modelTypeName).toString();
    }

    private getModelFromCache(modelTypeName: string, culture: string, options: TModelOptions): IModel | undefined {
        const key = this.generateCacheKey(modelTypeName, culture, options);
        return ModelFactory.cache.get(key);
    }

    private registerModelInCache(modelTypeName: string, culture: string, options: TModelOptions, model: IModel):void {
        const key = this.generateCacheKey(modelTypeName, culture, options);
        ModelFactory.cache.set(key, model);
    }

    private generateCacheKey(modelTypeName: string, culture: string, options: TModelOptions): string {
        return new ModelFactoryKey<TModelOptions>(culture, modelTypeName, options).toString();
    }
}
