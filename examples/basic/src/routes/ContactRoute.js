import React, { Component } from 'react'
import { observer } from 'mobx-react'

class ContactRoute extends Component {
  render() {
    return (
      <div>
        <h1>Contact Us</h1>
        <p>
          Example Inc.,<br/>
          123 King St.<br/>
          Suite 100<br/>
          Toronto, ON<br/>
          Canada
        </p>
        <p>
          Telephone: (555) 555-5555<br/>
          Fax: (555) 555-5555<br/>
          Email: <a href="mailto:info@example.com">info@example.com</a>
        </p>
      </div>
    )
  }
}

export default observer(ContactRoute)
