// @flow
import PropTypes from 'prop-types'

export const RouterType = PropTypes.shape({
  store: PropTypes.object,
  history: PropTypes.object,
  push: PropTypes.func,
  replace: PropTypes.func,
  goBack: PropTypes.func,
  navigated: PropTypes.func
})

export const OutletType = PropTypes.shape({
  index: PropTypes.number
})
