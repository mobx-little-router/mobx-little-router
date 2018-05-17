import React from 'react'
import { inject, observer } from 'mobx-react'
import styled from 'styled-components'
import { Link } from 'mobx-little-router-react'

import Modal from '../../components/Modal'

const ShowRoute = ({ route: { params, query, data }, className }) => {
  const { model: { activeShow, prevShow, nextShow } } = data

  return (
    <Modal className={className} closePath={`/shows?q=${query.q}`}>
      {activeShow &&
        <Content>
          {activeShow.image &&
            <CoverImage style={{ backgroundImage: `url(${activeShow.image.original})` }} />}
          <Abstract>
            <Navigation>
              {prevShow &&
                <PrevNavigationLink to={`/shows/${prevShow.id}?q=${query.q}`}>
                  Prev
                </PrevNavigationLink>}
              {nextShow &&
                <NextNavigationLink to={`/shows/${nextShow.id}?q=${query.q}`}>
                  Next
                </NextNavigationLink>}
            </Navigation>

            <Network>{activeShow.network && activeShow.network.name}</Network>
            <Title>{activeShow.name}</Title>
            <OfficialSite href={activeShow.officialSite} target="_blank">
              Official site
            </OfficialSite>
            <Summary dangerouslySetInnerHTML={{ __html: activeShow.summary }} />
            <Tags>
              {activeShow.genres &&
                activeShow.genres.map((genre, idx) =>
                  <Link key={idx} to={`/tags/${genre}`}>{genre}</Link>
                )}
            </Tags>

            <Cast>
              <h2>Cast</h2>
              {activeShow._embedded.cast.map((member, idx) =>
                <CastMember key={idx}>
                  <Character>{member.character.name}</Character>
                  <Actor to={`/actors/${member.person.id}`}>{member.person.name}</Actor>
                </CastMember>
              )}
            </Cast>
          </Abstract>
        </Content>}
    </Modal>
  )
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

const PrevNavigationLink = styled(NavigationLink)`
  margin-right: auto;
`

const NextNavigationLink = styled(NavigationLink)`
  margin-left: auto;
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

export default inject('ShowsStore')(observer(ShowRoute))
