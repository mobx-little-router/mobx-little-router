// @flow

export class NoMatch  {
  url: string
  constructor(url: string) {
    this.url = url
  }
  toString() {
    return `No match for ${this.url}`
  }
}

