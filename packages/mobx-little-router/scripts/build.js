const fs = require('fs')
const execSync = require('child_process').execSync
const prettyBytes = require('pretty-bytes')
const gzipSize = require('gzip-size')

const exec = (command, extraEnv) =>
  execSync(command, {
    stdio: 'inherit',
    env: Object.assign({}, process.env, extraEnv)
  })

const BABEL_BIN = `${process.cwd()}/node_modules/.bin/babel`

exec(`${BABEL_BIN} src -d lib --ignore "*.test.js"`, {
  BABEL_ENV: 'cjs'
})

console.log('\nBuilding ES modules ...')

exec(`${BABEL_BIN} src -d es --ignore "*.test.js"`, {
  BABEL_ENV: 'es'
})

console.log('\nBuilding Flow modules ...')

exec('./node_modules/.bin/flow-copy-source -v -i "**/*.test.js" src lib')

if (process.argv.includes('umd')) {
  console.log('\nBuilding mobx-router-little.js ...')

  exec('rollup -c -f umd -o umd/mobx-router-little.js', {
    BABEL_ENV: 'umd',
    NODE_ENV: 'development'
  })

  console.log('\nBuilding mobx-router-little.min.js ...')

  exec('rollup -c -f umd -o umd/mobx-router-little.min.js', {
    BABEL_ENV: 'umd',
    NODE_ENV: 'production'
  })

  const size = gzipSize.sync(
    fs.readFileSync('umd/mobx-router-little.min.js')
  )

  console.log('\ngzipped, the UMD build is %s', prettyBytes(size))
}
