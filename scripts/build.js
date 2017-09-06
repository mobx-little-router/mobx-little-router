const fs = require(`fs`)
const execSync = require(`child_process`).execSync
const prettyBytes = require(`pretty-bytes`)
const gzipSize = require(`gzip-size`)

const BABEL_BIN = `${process.cwd()}/node_modules/.bin/babel`

fs.readdirSync(`${process.cwd()}/packages`).forEach(module => {
  exec(`${BABEL_BIN} packages/${module}/src -d packages/${module}/lib --ignore "*.test.js"`, {
    BABEL_ENV: `cjs`
  })

  console.log(`\nBuilding ES modules ...`)

  exec(`${BABEL_BIN} packages/${module}/src -d packages/${module}/es --ignore "*.test.js"`, {
    BABEL_ENV: `es`
  })

  console.log(`\nBuilding Flow modules ...`)

  exec(`./node_modules/.bin/flow-copy-source -v -i "**/*.test.js" packages/${module}/src packages/${module}/lib`)

  if (process.argv.includes(`umd`)) {
    console.log(`\nBuilding packages/${module}/umd/${module}.js ...`)

    exec(`rollup -c packages/${module}/rollup.config.js -f umd -o packages/${module}/umd/${module}.js`, {
      BABEL_ENV: `umd`,
      NODE_ENV: `development`
    })

    console.log(`\nBuilding packages/${module}/umd/${module}.min.js ...`)

    exec(`rollup -c packages/${module}/rollup.config.js -f umd -o packages/${module}/umd/${module}.min.js`, {
      BABEL_ENV: `umd`,
      NODE_ENV: `production`
    })

    const size = gzipSize.sync(
      fs.readFileSync(`packages/${module}/umd/${module}.min.js`)
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
