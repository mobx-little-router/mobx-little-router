import { transformConfig } from 'mobx-little-router'

// Allow component and outlet to be specified within the config and automatically gets added to getData
// for a cleaner look and feel
export default transformConfig(config => {
  const { component, outlet } = config
  delete config.component
  delete config.outlet
  return {
    ...config,
    getData: () => ({
      component,
      outlet,
      ...(config.getData ? config.getData() : {})
    })
  }
})
