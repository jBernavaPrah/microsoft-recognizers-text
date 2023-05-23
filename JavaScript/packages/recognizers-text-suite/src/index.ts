// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.


import { Culture } from '@microsoft/recognizers-text';

import {
    NumberOptions, recognizeNumber, recognizeOrdinal, recognizePercentage,
} from '@microsoft/recognizers-text-number';
import {
    NumberWithUnitOptions,
    recognizeAge,
    recognizeCurrency,
    recognizeDimension,
    recognizeTemperature,
} from '@microsoft/recognizers-text-number-with-unit';

//import { DateTimeOptions, recognizeDateTime } from '@microsoft/recognizers-text-date-time';

import { ChoiceOptions, recognizeBoolean } from '@microsoft/recognizers-text-choice';
import {
    SequenceOptions,
    recognizePhoneNumber,
    recognizeIpAddress,
    recognizeMention,
    recognizeHashtag,
    recognizeEmail,
    recognizeURL,
    recognizeGUID,
} from '@microsoft/recognizers-text-sequence';

export default {
    Culture,
    NumberOptions,
    recognizeNumber,
    recognizeOrdinal,
    recognizePercentage,
    NumberWithUnitOptions,
    recognizeAge,
    recognizeCurrency,
    recognizeDimension,
    recognizeTemperature,
    //DateTimeOptions,
    //recognizeDateTime,
    ChoiceOptions,
    recognizeBoolean,
    SequenceOptions,
    recognizePhoneNumber,
    recognizeIpAddress,
    recognizeMention,
    recognizeHashtag,
    recognizeEmail,
    recognizeURL,
    recognizeGUID,
};
