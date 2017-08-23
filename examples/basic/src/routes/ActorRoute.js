import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { extendObservable } from 'mobx'
import styled from 'styled-components'
import { Link } from 'mobx-little-router-react'
import cx from 'classnames'

class ActorRoute extends Component {
  constructor(props) {
    super(props)

    extendObservable(this, {
      model: null
    })
  }

  componentDidMount() {
    this.fetchModel(this.props)
  }

  componentWillReceiveProps(props) {
    this.fetchModel(props)
  }

  fetchModel = async (props) => {
    const { params } = props

    const actorRes = await fetch(`https://api.tvmaze.com/people/${params.id}`)
    const actorData = await actorRes.json()

    const creditsRes = await fetch(`https://api.tvmaze.com/people/${params.id}/castcredits?embed=show`)
    const creditsData = await creditsRes.json()

    this.model = { ...actorData, credits: creditsData }
  }

  render() {
    const { className } = this.props

    return (
      <Modal className={cx('modal', className)}>
        <ModalOverlay to="/shows" />
        <ModalContainer>
          <ModalDialog>
            <CloseButton to="/shows" />
            {this.model &&
              <Content>
                {this.model.image && <CoverImage style={{ backgroundImage: `url(${this.model.image.original})` }} />}
                <Abstract>
                  <Title>{this.model.name}</Title>

                  <Credits>
                    <h2>Credits</h2>
                    {this.model.credits.map((credit, idx) => 
                      <Show key={idx} to={`/shows/${credit._embedded.show.id}`}>
                        {credit._embedded.show.name}
                      </Show>
                    )}
                  </Credits>
                </Abstract>
              </Content>
            }
          </ModalDialog>
        </ModalContainer>
      </Modal>
    )
  }
}

const ModalContainer = styled.div`
  position: absolute;
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

const Modal = styled.div`  
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

const CloseButton = styled(Link)`
  position: absolute;
  right: 0;
  top: 0;
  text-decoration: none;
  font-size: 23px;
  color: #333;
  margin: 9px;

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

const Content = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
`

const CoverImage = styled.div`
  display: block;
  width: 50%;
  background-position: 50% 50%;
  background-size: cover;
  position: relative;

  &::before {
    display: block;
    content: "";
    height: 5px;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background-image: linear-gradient(rgba(255, 255, 255, 0.4), transparent);
  }

  &::after {
    display: block;
    content: "";
    height: 5px;
    width: 100%;
    position: absolute;
    bottom: 0;
    left: 0;
    background-image: linear-gradient(transparent, rgba(0,0,0,0.4));
  }
`

const Abstract = styled.div`
  padding: 72px 36px 0;
  width: 50%;
  overflow-y: auto;
`

const Title = styled.h1`
  color: #333;
  margin: 0 0 18px;
`

const Summary = styled.p`
  color: #666;
  line-height: 18px;
  font-size: 13px;
`

const ShowType = styled.div`

`

const Network = styled.div`
  text-transform: uppercase;
  color: #aaa;
  font-size: 12px;
`

const OfficialSite = styled.a`
  font-size: 13px;
  line-height: 18px;
  color: #777;

  &:hover {
    color: #333;
  }
`

const Tags = styled.div`
  margin: 18px 0;

  > a {
    font-size: 12px;
    color: #079;
    margin-right: 9px;
    display: inline-block;
    text-decoration: none;
    border-radius: 9px;
    background-color: #eee;
    padding: 0 9px;
    line-height: 18px;
    color: #999;
  }
`

const Credits = styled.div`
  font-size: 13px;
  line-height: 18px;
  margin: 36px 0;
`

const Show = styled(Link)`
  display: block;
  padding: 9px 0;

  color: #777;

  &:hover {
    color: #333;
  }
`

export default observer(ActorRoute)
