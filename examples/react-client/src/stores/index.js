import SessionStore from './SessionStore'
import ShowsStore from './ShowsStore'

export default function createStores() {
  return {
    SessionStore: new SessionStore(),
    ShowsStore: new ShowsStore()
  }
}