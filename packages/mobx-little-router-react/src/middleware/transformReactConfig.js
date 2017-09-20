import { transformConfig } from 'mobx-little-router'
import { when } from 'mobx'

const onTransition = ({ type, target }) => {
  return new Promise((resolve, reject) => {
    when(
      () => {
        return target.data.transitionState === (type === 'entering' ? 'entered' : 'exited')
      },
      () => {
        console.log("RESOLVING_TRANSITION", target.key)
        resolve()
      }
    )
  })
}

// Allow component and outlet to be specified within the config and automatically gets added to getData
// for a cleaner look and feel
export default transformConfig(config => {
  const { component, outlet } = config
  delete config.component
  delete config.outlet
  return {
    onTransition,
    ...config,
    getData: () => ({
      component,
      outlet,
      ...(config.getData ? config.getData() : {})
    })
  }
})
