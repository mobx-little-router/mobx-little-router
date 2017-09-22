import React, { Component } from 'react'
import styled, { injectGlobal } from 'styled-components'
import cx from 'classnames'
import { Link } from 'mobx-little-router-react'

class Modal extends Component {
  componentWillMount() {
    if (document && document.body) {
      const bodyClassNames = document.body.className
      document.body.className = bodyClassNames + (bodyClassNames ? ' ' : '') + 'modal-open'
    }
  }

  componentWillUnmount() {
    if (document && document.body) {
      document.body.className = document.body.className.replace(/ ?modal-open/, '')
    }
  }

  render() {
    const { className, closePath, children } = this.props
    
    return (
      <Container className={cx('modal', className)}>
        <ModalOverlay className={'modal-overlay'} to={closePath}/>
        <ModalContainer>
          <ModalDialog className={'modal-dialog'} data-transition-ref>
            <CloseButton to={closePath} />

            {children}
          </ModalDialog>
        </ModalContainer>
      </Container>
    )
  }
}

const ModalContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  max-width: 900px;
  width: 80%;
  height: 600px;
  z-index: 4;
`

const ModalDialog = styled.div`
  width: 100%;
  height: 100%;
  background-color: white;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0,0,0,0.2), 0 1px 16px 1px rgba(0,0,0,0.2);
  border-radius: 2px;
`

const ModalOverlay = styled(Link)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255,255,255,0.8);
  cursor: default;
  z-index: 3;
`

const Container = styled.div`  
  &.transitioning {
    ${ModalOverlay} {
      transition: opacity 400ms ease-out;
    }

    ${ModalDialog} {
      transition: all 200ms ease-out;
    }

    &.exit {
      ${ModalOverlay} {
        opacity: 1;
      }

      ${ModalDialog} {
        opacity: 1;
        transform: translateY(0%);
      }

      &.exit-active {
        ${ModalOverlay} {
          opacity: 0;
        }

        ${ModalDialog} {
          opacity: 0;
          transform: translateY(-100%);
        }
      }
    }

    &.enter {
      ${ModalOverlay} {
        opacity: 0;
      }

      ${ModalDialog} {
        opacity: 0;
        transform: translateY(100%);
      }

      &.enter-active {
        ${ModalOverlay} {
          opacity: 1;
        }

        ${ModalDialog} {
          opacity: 1;
          transform: translateY(0%);
        }
      }
    }
  }
`

const CloseButton = styled(Link) `
  position: absolute;
  right: 0;
  top: 0;
  text-decoration: none;
  font-size: 23px;
  color: #333;
  margin: 9px;
  z-index: 2;

  &:hover {
    opacity: 0.7;
  }

  &::after {
    cursor: pointer;
    content: "✕";
    display: block;
    width: 36px;
    height: 36px;
    line-height: 36px;
    text-align: center;
  }
`

injectGlobal`
  body.modal-open {
    overflow: hidden;
  }
`

export default Modal