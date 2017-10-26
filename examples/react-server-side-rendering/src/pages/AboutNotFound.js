import React from 'react'
import { Link } from 'mobx-little-router-react'

export default () => {
  return (
    <div>
      <p>
        'Hmm, this section does not exist... go back to ' <Link to="/about">about</Link> ' page?'
      </p>
    </div>
  )
}
