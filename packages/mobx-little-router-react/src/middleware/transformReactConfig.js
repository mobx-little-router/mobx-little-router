// @flow
import { transformConfig } from 'mobx-little-router'
import { when } from 'mobx'

const handleAnimatedTransition = ({ type, target }) => {
  return new Promise((resolve, reject) => {
    when(
      () => {
        return target.data.transitionState === (type === 'entering' ? 'entered' : 'exited')
      },
      () => {
        resolve()
      }
    )
  })
}

// Allow component and outlet to be specified within the config and automatically gets added to getData
// for a cleaner look and feel
export default transformConfig(config => {
  const { component, outlet, animate } = config
  delete config.component
  delete config.outlet
  delete config.animate
  return {
    ...config,
    onTransition: animate ? handleAnimatedTransition : config.onTransition,
    getData: () => ({
      component,
      outlet,
      ...(config.getData ? config.getData() : {})
    })
  }
})
