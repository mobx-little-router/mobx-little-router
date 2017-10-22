import * as React from 'react'
import { observer } from 'mobx-react'
import { extendObservable } from 'mobx'
import styled from 'styled-components'
import { Link } from 'mobx-little-router-react'
import Modal from '../components/Modal'

export interface IActorRouteProps {
  className: string
}

@observer
class ActorRoute extends React.Component<IActorRouteProps, {}> {
  model: any

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
    const { params } = props.route

    const actorRes = await fetch(`https://api.tvmaze.com/people/${params.id}`)
    const actorData = await actorRes.json()

    const creditsRes = await fetch(`https://api.tvmaze.com/people/${params.id}/castcredits?embed=show`)
    const creditsData = await creditsRes.json()

    this.model = { ...actorData, credits: creditsData }
  }

  render() {
    const { className } = this.props

    return (
      <Modal className={className} closePath='/shows'>
        {this.model &&
          <Content>
            {this.model.image && <CoverImage style={{ backgroundImage: `url(${this.model.image.original})` }} />}
            <Abstract>
              <Title>{this.model.name}</Title>
              <Summary/>
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
      </Modal>
    )
  }
}

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

export default ActorRoute
