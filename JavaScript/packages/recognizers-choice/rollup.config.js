// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import pkg from './package.json';
import defaultConf from '../../rollup.config';
import alias from '@rollup/plugin-alias'
import path from 'path'
export default defaultConf(pkg, [
  // alias({
  //   '@microsoft/recognizers-text': path.resolve(__dirname, '../recognizers-text/index.umd.js'),
  // })
  ],
);

