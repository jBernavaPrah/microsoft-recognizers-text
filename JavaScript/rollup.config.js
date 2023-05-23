// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.


import camelCase from 'lodash.camelcase';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default (pkg, plugins = []) => ({
  input: `src/index.ts`,
  output: [
    { file: pkg.module, format: 'es', sourcemap: true },
    { file: pkg.main, name: camelCase(pkg.name), format: 'umd', exports: 'named', sourcemap: true },
    { file: pkg.browser, format: 'iife', name: camelCase(pkg.name), exports: 'named', sourcemap: true },
  ],
  plugins: [
    ...plugins,
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve(),

    typescript(),

  ],

});
