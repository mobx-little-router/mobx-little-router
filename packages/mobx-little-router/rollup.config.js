import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'
import replace from 'rollup-plugin-replace'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import visualizer from 'rollup-plugin-visualizer'
import builtins from 'rollup-plugin-node-builtins'
import { minify } from 'uglify-es'

const config = {
  entry: 'src/index.js',
  moduleName: 'mobxLittleRouter',
  globals: {
    mobx: 'mobx',
    'url-pattern': 'UrlPattern'
  },
  external: ['mobx'],
  plugins: [
    visualizer({
      filename: './stats.html'
    }),
    builtins(),
    babel({
      exclude: 'node_modules/**'
    }),
    resolve(),
    commonjs({
      include: /node_modules/
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ]
}

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(uglify({}, minify))
}

export default config
