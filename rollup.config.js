import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';

export default {
  input: 'asset-manager.js', // the main entry file aka 'one file to rule them all'
  output: [
    {
      file: 'dist/asset-manager.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    {
      file: 'dist/asset-manager.umd.js',
      format: 'umd',
      name: 'AssetManager',
      sourcemap: true,
    }
  ],
  plugins: [
    resolve(),
    commonjs(),
    copy({
      targets: [
        { src: 'asset-manager-styles.css', dest: 'dist' },
        { src: 'city-of-stl-styles.css', dest: 'dist' }
      ]
    })
  ],
  external: [
    // List any external dependencies here
  ]
};