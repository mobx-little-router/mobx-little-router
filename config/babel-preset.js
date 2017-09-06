const plugins = [
  'syntax-dynamic-import',
  'transform-export-extensions',
  'transform-object-rest-spread',
  'transform-class-properties',
  'transform-flow-strip-types',
  'transform-regenerator',
  [
    'transform-runtime',
    {
      helpers: false,
      polyfill: false,
      regenerator: true
    }
  ]
]

if (process.env.BABEL_ENV === 'umd') {
  plugins.push('external-helpers')
}

module.exports = {
  presets: [
    'flow',
    'react',
    ['env', { modules: ['cjs', 'test'].includes(process.env.BABEL_ENV) ? 'commonjs' : false }]
  ],
  plugins: plugins
}
