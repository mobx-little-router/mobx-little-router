const chalk = require('chalk')
const inquirer = require('inquirer')
const cp = require('child_process')

const CLIENT_DIR = 'examples/react-client'

console.log(
  `You ran ${chalk.bold(
    'yarn start'
  )} from the project root. Maybe you meant to run it from ${chalk.bold(CLIENT_DIR)}?`
)

console.log()

const question = {
  type: 'confirm',
  name: 'shouldRunExample',
  message: chalk.yellow(`Would you like to run ${CLIENT_DIR} now?`),
  default: true
}

inquirer.prompt(question).then(answer => {
  console.log()

  if (answer.shouldRunExample) {
    console.log("Alright, I'll start the example for you now!")
    console.log()
    console.log(
      `Running: ${chalk.cyan(
        `yarn bootstrap ${chalk.gray('# set up dependencies for packages and examples')}`
      )}`
    )
    console.log()

    spawn('yarn', ['bootstrap']).then(() => {
      console.log()
      console.log(`Running: ${chalk.cyan(`cd ${CLIENT_DIR} && yarn start`)}`)
      console.log()
      console.log(`The server should be up momentarily. Remember you can always run the example with:
${chalk.cyan(`
  yarn bootstrap ${chalk.gray('# set up dependencies for packages and examples')}
  cd ${CLIENT_DIR}
  yarn start`)}
`)
      fork('./scripts/run-example', [], {})
        .then(() => console.log('Done!'))
        .catch(e => console.error('oops'))
    }).catch(e => console.error(e))
  } else {
    console.log(`Okay got it! Remember that you can run the example with:
${chalk.cyan(`
  yarn bootstrap ${chalk.gray('# set up dependencies for packages and examples')}
  cd ${CLIENT_DIR}
  yarn start`)}

Learn more about the examples here:

  https://github.com/mobx-little-router/mobx-little-router/tree/master/examples
`)
  }
})

function spawn(cmd, args) {
  return new Promise((res, rej) => {
    const spawned = cp.spawn(cmd, args)
    spawned.stdout.on('data', data => {
      process.stdout.write(chalk.gray(data))
    })

    spawned.stderr.on('data', data => {
      process.stdout.write(chalk.gray(data))
    })

    spawned.on('close', code => {
      if (code === 0) {
        spawned.stdin.end()
        spawned.kill()
        res()
      } else {
        rej()
      }
    })
  })
}

function fork(cmd, args, opts) {
  return new Promise((res, rej) => {
    const proc = cp.fork(cmd, args, opts)
    proc.on('close', code => {
      res()
    })
  })
}
