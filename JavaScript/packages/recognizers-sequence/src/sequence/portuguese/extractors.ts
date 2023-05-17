// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { BasePhoneNumberExtractorConfiguration } from '../extractors';
import { PortuguesePhoneNumbers } from '../../resources/portuguesePhoneNumbers';

export class PortuguesePhoneNumberExtractorConfiguration extends BasePhoneNumberExtractorConfiguration {
    readonly FalsePositivePrefixRegex: string;

    constructor() {
        super();
        this.FalsePositivePrefixRegex = PortuguesePhoneNumbers.FalsePositivePrefixRegex;
    }
}
