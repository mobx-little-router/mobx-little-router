import ShowsRoute from './ShowsRoute'
import ShowRoute from './ShowRoute'

export default [
  {
    path: '',
    query: ['q'],
    component: ShowsRoute
  },
  {
    path: ':id',
    component: ShowRoute,
    outlet: 'modal',
    animate: true
  }
]
