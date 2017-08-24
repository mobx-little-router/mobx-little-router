import React from 'react'
import styled from 'styled-components'
import cx from 'classnames'
import { Link } from 'mobx-little-router-react'

const Modal = (props) => {
  const { className, closePath, children } = props
  return (
    <Container className={cx('modal', className)}>
      <ModalOverlay to={closePath}/>
      <ModalContainer>
        <ModalDialog>
          <CloseButton to={closePath} />

          {children}
        </ModalDialog>
      </ModalContainer>
    </Container>
  )
}

const ModalContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  max-width: 900px;
  width: 80%;
  height: 600px;
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
`

const Container = styled.div`
  &.transitioning {
    ${ModalOverlay} {
      transition: opacity 400ms ease-out;
    }

    ${ModalDialog} {
      transition: all 400ms ease-out;
    }

    &.leaving {
      ${ModalOverlay} {
        opacity: 1;
      }

      ${ModalDialog} {
        opacity: 1;
        transform: translateY(0%);
      }

      &.leave {
        ${ModalOverlay} {
          opacity: 0;
        }

        ${ModalDialog} {
          opacity: 0;
          transform: translateY(-100%);
        }
      }
    }

    &.entering {
      ${ModalOverlay} {
        opacity: 0;
      }

      ${ModalDialog} {
        opacity: 0;
        transform: translateY(100%);
      }

      &.enter {
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

export default Modal