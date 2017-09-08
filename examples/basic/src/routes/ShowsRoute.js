import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { runInAction, extendObservable } from 'mobx'
import { Link } from 'mobx-little-router-react'
import styled from 'styled-components'

class ShowsRoute extends Component {
  constructor(props) {
    super(props)

    extendObservable(this, {
      query: ''
    })
  }

  componentDidMount() {
    const { query } = this.props
    this.onSearch(query.q || 'gundam')
  }

  onSearch = async (query) => {
    const { ShowsStore } = this.props
    const res = await fetch(`https://api.tvmaze.com/search/shows?q=${query}`)
    const data = await res.json()

    runInAction(() => {
      this.query = query
      ShowsStore.collection = data.map(({ show }) => show)
    })
  }

  render() {
    const { ShowsStore } = this.props

    return (
      <Container>
        <SearchHeader>
          <SearchInput onChange={ev => this.onSearch(ev.target.value)} value={this.query} />
        </SearchHeader>
        <SearchResults>
          {ShowsStore.collection.map(show =>
            <Show key={show.id}>
              <CoverImage to={`/shows/${show.id}`} style={{backgroundImage: `url(${show.image && show.image.medium})` }}/>
              <Abstract>
                <Network>{show.network && show.network.name}</Network>
                <ShowName to={`/shows/${show.id}`}>{show.name}</ShowName>
              </Abstract>
            </Show>
          )}
        </SearchResults>
      </Container>
    )
  }
}

const Container = styled.div`
  margin: 0 auto;
  max-width: 900px;
  width: 100%;
`

const SearchResults = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: left;
`

const Show = styled.div`
  width: 30%;
  height: 360px;
  background-color: white;
  margin: 9px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
  position: relative;
  border-radius: 2px;
  overflow: hidden;
`

const Abstract = styled.div`
  padding: 9px;
  position: absolute;
  bottom: 0;
`

const Network = styled.div`
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
`

const ShowName = styled(Link)`
  color: white;
  line-height: 21px;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`

const SearchHeader = styled.div`
  margin: 18px auto;
  max-width: 600px;
  width: 100%;
`

const CoverImage = styled(Link)`
  display: block;
  background-size: cover;
  background-position: 50% 50%;
  background-color: #eee;
  box-shadow: 0 1px 8px rgba(0,0,0,0.2) inset;
  width: 100%;
  height: 100%;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    background-image: linear-gradient(transparent, rgba(0,0,0,0.8));
    width: 100%;
    height: 50%;
  }
`

const SearchInput = styled.input.attrs({
  type: 'text',
  placeholder: 'Search shows...'
})`
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  border: 0;
  height: 45px;
  border: 1px solid #eee;
  width: 600px;

  font-size: 21px;
  padding: 0 9px;
`

const SearchButton = styled.button`

`

export default inject('ShowsStore')(observer(ShowsRoute))
