import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { observable } from 'mobx'
import { Link } from 'mobx-little-router-react'
import styled from 'styled-components'

class IndexRoute extends Component {
  collection = observable([])

  componentDidMount() {
    this.onSearch('gundam')
  }

  onSearch = async (query) => {
    const res = await fetch(`https://api.tvmaze.com/search/shows?q=${query}`)
    const data = await res.json()

    this.collection.clear()
    data.forEach(({ show }) => this.collection.push(show))
  }

  render() {
    return (
      <Container>
        <SearchHeader>
          <SearchInput onChange={ev => this.onSearch(ev.target.value)} defaultValue="gundam" />
        </SearchHeader>
        <SearchResults>
          {this.collection.map(show =>
            <Show key={show.id}>
              <CoverImage style={{backgroundImage: `url(${show.image && show.image.medium})` }} />
              <Abstract>
                <ShowType>{show.type}</ShowType>
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
  background-image: linear-gradient(transparent, rgba(0,0,0,0.8));
  width: 100%;
  height: 50%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;

`

const ShowType = styled.div`
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

const CoverImage = styled.div`
  background-size: cover;
  background-position: 50% 50%;
  background-color: #eee;
  box-shadow: 0 1px 8px rgba(0,0,0,0.2) inset;
  width: 100%;
  height: 100%;
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

export default observer(IndexRoute)
