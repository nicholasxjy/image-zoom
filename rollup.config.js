import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import postcss from 'rollup-plugin-postcss'
import babel from 'rollup-plugin-babel'
import { uglify } from 'rollup-plugin-uglify'
import pkg from './package.json'

export default [
  {
    input: 'src/index.js',
    output: {
      name: 'NZoom',
      file: pkg.browser,
      format: 'umd'
    },
    plugins: [
      resolve(),
      commonjs(),
      babel(),
      postcss({
        plugins: [
          require('autoprefixer')({
            browsers: ['>= 5%', 'last 2 versions', 'iOS >= 8', 'Safari >= 8']
          })
        ]
      }),
      uglify()
    ]
  },
  {
    input: 'src/index.js',
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' }
    ],
    plugins: [
      resolve(),
      commonjs(),
      babel(),
      postcss({
        plugins: [
          require('autoprefixer')({
            browsers: ['>= 5%', 'last 2 versions', 'iOS >= 8', 'Safari >= 8']
          })
        ]
      })
    ]
  }
]