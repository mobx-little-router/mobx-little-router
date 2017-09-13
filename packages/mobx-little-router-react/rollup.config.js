import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'
import replace from 'rollup-plugin-replace'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import visualizer from 'rollup-plugin-visualizer'
import { minify } from 'uglify-es'

const config = {
  entry: 'src/index.js',
  moduleName: 'mobxLittleRouterReact',
  globals: {
    'mobx-little-router': 'mobxLittleRouter',
    'mobx-react': 'mobxReact',
    'react': 'React',
    'react-dom': 'ReactDOM',
    'prop-types': 'PropTypes',
    mobx: 'mobx',
    classnames: 'classNames'
  },
  external: [
    'mobx-little-router',
    'mobx-react',
    'react',
    'react-dom',
    'mobx',
    'prop-types',
    'classnames'
  ],
  plugins: [
    visualizer({
      filename: './stats.html'
    }),
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
