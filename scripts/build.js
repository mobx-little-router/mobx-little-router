const fs = require(`fs`)
const execSync = require(`child_process`).execSync
const prettyBytes = require(`pretty-bytes`)
const gzipSize = require(`gzip-size`)

const BASE_DIR = process.cwd()
const BABEL_BIN = `${BASE_DIR}/node_modules/.bin/babel`

fs.readdirSync(`${BASE_DIR}/packages`).forEach(module => {
  process.chdir(`${BASE_DIR}/packages/${module}`)

  exec(`${BABEL_BIN} src -d lib --ignore "*.test.js"`, {
    BABEL_ENV: `cjs`
  })

  console.log(`\nBuilding ES modules ...`)

  exec(`${BABEL_BIN} src -d es --ignore "*.test.js"`, {
    BABEL_ENV: `es`
  })

  console.log(`\nBuilding Flow modules ...`)

  exec(`${BASE_DIR}/node_modules/.bin/flow-copy-source -v -i "**/*.test.js" src lib`)

  if (process.argv.includes(`umd`)) {
    console.log(`\nBuilding umd/${module}.js ...`)

    exec(`rollup -c rollup.config.js -f umd -o umd/${module}.js`, {
      BABEL_ENV: `umd`,
      NODE_ENV: `development`
    })

    console.log(`\nBuilding umd/${module}.min.js ...`)

    exec(`rollup -c rollup.config.js -f umd -o umd/${module}.min.js`, {
      BABEL_ENV: `umd`,
      NODE_ENV: `production`
    })

    const size = gzipSize.sync(
      fs.readFileSync(`umd/${module}.min.js`)
    )

    console.log(`\ngzipped, the UMD build is %s`, prettyBytes(size))
  }
})

function exec (command, extraEnv) {
  execSync(command, {
    stdio: `inherit`,
    env: Object.assign({}, process.env, extraEnv)
  })
}
