import ActorsStore from './ActorsStore'
import SessionStore from './SessionStore'
import ShowsStore from './ShowsStore'

export default function createStores() {
  return {
    ActorsStore: new ActorsStore(),
    SessionStore: new SessionStore(),
    ShowsStore: new ShowsStore()
  }
}