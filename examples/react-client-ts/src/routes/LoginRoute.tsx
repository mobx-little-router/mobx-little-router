import * as React from 'react'
import { runInAction } from 'mobx'
import { inject, observer } from 'mobx-react'
import { withRouter } from 'mobx-little-router-react'
import styled from 'styled-components'

export interface ILoginRouteProps {
  className: string
  SessionStore: any
  router: any
}

@observer
class LoginRoute extends React.Component<ILoginRouteProps, {}> {
  login = () => {
    const { SessionStore, router } = this.props

    runInAction(() => {
      SessionStore.isAuthenticated = true

      const redirectTo = SessionStore.unauthorizedNavigation
        ? SessionStore.unauthorizedNavigation.to
        : '/'

      router.push(redirectTo)
    })
  }

  render() {
    const { className } = this.props

    return (
      <Container className={className}>
        <h1>Login</h1>
        <div><EmailInput/></div>
        <div><PasswordInput/></div>
        <div><LoginButton onClick={this.login}>Login</LoginButton></div>
      </Container>
    )
  }
}

const Container = styled.div`
  margin: 0 auto;
  width: 320px;
`

const Input = styled.input`
  width: 100%;
  height: 36px;
  line-height: 34px;
  border: 1px solid #eee;
  margin-bottom: 18px;
  padding: 0 9px;
  border-radius: 2px;
  transition: border-color 200ms ease-out;

  &:focus {
    border-color: #ccc;
  }
`

const EmailInput = styled(Input).attrs({
  type: 'text',
  placeholder: 'Email'
})``

const PasswordInput = styled(Input).attrs({
  type: 'password',
  placeholder: 'Password'
})``

const LoginButton = styled.button`
  height: 36px;
  background-color: #333;
  color: white;
  border: 1px solid rgba(0,0,0,0.2);
  border-radius: 2px;
  min-width: 120px;
  float: right;
  cursor: pointer;
  transition: background-color 200ms ease-out;

  &:hover {
    background-color: rgb(50, 212, 212);
  }
`

export default withRouter(inject('SessionStore')(LoginRoute))
