import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { extendObservable } from 'mobx'
import styled from 'styled-components'
import { Link } from 'mobx-little-router-react'

import Modal from '../components/Modal'

class ShowRoute extends Component {
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

    const res = await fetch(`https://api.tvmaze.com/shows/${params.id}?embed=cast`)
    const data = await res.json()

    this.model = data
  }

  closeModal = () => {

  }

  render() {
    const { className } = this.props

    return (
      <Modal className={className} closePath="/shows">
        {this.model &&
          <Content>
            {this.model.image && <CoverImage style={{ backgroundImage: `url(${this.model.image.original})` }} />}
            <Abstract>
              <Navigation>
                <NavigationLink to={`/shows/${this.model.id - 1}`}>Prev</NavigationLink>
                <NavigationLink to={`/shows/${this.model.id + 1}`}>Next</NavigationLink>
              </Navigation>

              <Network>{this.model.network && this.model.network.name}</Network>
              <Title>{this.model.name}</Title>
              <OfficialSite href={this.model.officialSite} target="_blank">Official site</OfficialSite>
              <Summary dangerouslySetInnerHTML={{ __html: this.model.summary }} />
              <Tags>{this.model.genres && this.model.genres.map((genre, idx) => <Link key={idx} to={`/tags/${genre}`}>{genre}</Link>)}</Tags>
            
              <Cast>
                <h2>Cast</h2>
                {this.model._embedded.cast.map((member, idx) => 
                  <CastMember key={idx}>
                    <Character>{member.character.name}</Character>
                    <Actor to={`/actors/${member.person.id}`}>{member.person.name}</Actor>
                  </CastMember>
                )}
              </Cast>
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
  position: relative;
`

const Navigation = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  position: absolute;
  top: 0;
  left: 36px;
  right: 54px;
  line-height: 36px;
  margin: 18px 0;
`

const NavigationLink = styled(Link)`
  font-size: 13px;
  line-height: 18px;
  color: #777;

  &:hover {
    color: #333;
  }
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

const Cast = styled.div`
  font-size: 13px;
  line-height: 18px;
  margin: 36px 0;
`

const CastMember = styled.div`
  display: flex;
  flex-direction: row;
  padding: 9px 0;
`

const Character = styled.div`
  width: 50%;
`

const Actor = styled(Link)`
  width: 50%;

  color: #777;

  &:hover {
    color: #333;
  }
`

export default observer(ShowRoute)
