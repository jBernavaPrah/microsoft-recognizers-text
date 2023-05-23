// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.


import pkg from './package.json';
import defaultConfig from '../../rollup.config';
import alias from '@rollup/plugin-alias';
import path from 'path';

export default defaultConfig(pkg,
  // [alias({
  //     '@microsoft/recognizers-text': path.resolve(__dirname, '../recognizers-text/build/index.umd.js'),
  //     '@microsoft/recognizers-text-number': path.resolve(__dirname, '../recognizers-number/build/index.umd.js'),
  //   })],
);
