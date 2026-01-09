import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'asset-chooser.js', // Your main entry file
  output: [
    {
      file: 'dist/asset-chooser.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    {
      file: 'dist/asset-chooser.umd.js',
      format: 'umd',
      name: 'AssetChooser',
      sourcemap: true,
    }
  ],
  plugins: [
    resolve(),
    commonjs(),
  ],
  external: [
    // List external dependencies here, e.g. 'arcgis-js-api'
  ]
};