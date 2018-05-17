import React from 'react'
import { inject, observer } from 'mobx-react'
import { Link, withRouter } from 'mobx-little-router-react'
import styled, { keyframes } from 'styled-components'

const ShowsRoute = ({ router, route, ShowsStore, className }) =>
  <Container className={className}>
    <SearchHeader>
      <SearchInput
        onChange={ev => {
          router.updateQuery({ q: encodeURIComponent(ev.target.value) })
        }}
        defaultValue={route.query.q}
      />
    </SearchHeader>
    <SearchResults>
      {ShowsStore.shows.map(show =>
        <Show key={show.id}>
          <CoverImage
            to={`/shows/${show.id}?q=${route.query.q}`}
            style={{ backgroundImage: `url(${show.image && show.image.medium})` }}
          />
          <Abstract>
            <Network>{show.network && show.network.name}</Network>
            <ShowName to={`/shows/${show.id}?q=${route.query.q}`}>{show.name}</ShowName>
          </Abstract>
        </Show>
      )}
    </SearchResults>
  </Container>

const Container = styled.div`
  margin: 0 auto;
  max-width: 900px;
  width: 100%;
`

const spinnerAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`
const spinnerRadius = 25
const spinnerWeight = 4

const Spinner = styled.div`
  &, &::after {
    border-radius: 50%;
    width: ${spinnerRadius * 2}px;
    height: ${spinnerRadius * 2}px;
  }

  margin: 240px auto;
  font-size: 10px;
  position: relative;
  text-indent: -9999em;
  border-top: ${spinnerWeight}px solid rgba(0, 0, 0, 0.2);
  border-right: ${spinnerWeight}px solid rgba(0, 0, 0, 0.2);
  border-bottom: ${spinnerWeight}px solid rgba(0, 0, 0, 0.2);
  border-left: ${spinnerWeight}px solid rgba(0,0,0,0.5);
  transform: translateZ(0);
  animation: 1s ${spinnerAnimation} infinite linear;
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
  autoFocus: true,
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

export default inject('ShowsStore')(withRouter(observer(ShowsRoute)))
