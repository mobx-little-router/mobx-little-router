// Jest setup
const mobx = require('mobx')
const JSDOM = require('jsdom').JSDOM
const enzyme = require('enzyme')
const EnzymeAdapter = require('enzyme-adapter-react-16')

mobx.configure({ enforceActions: true })

enzyme.configure({ adapter: new EnzymeAdapter() })

const jsdom = new JSDOM('<!doctype html><html><body></body></html>')
const { window } = jsdom

function copyProps(src, target) {
  const props = Object.getOwnPropertyNames(src)
    .filter(prop => typeof target[prop] === 'undefined')
    .map(prop => Object.getOwnPropertyDescriptor(src, prop))
  Object.defineProperties(target, props)
}

global.window = window
global.document = window.document
global.navigator = {
  userAgent: 'node.js'
}
copyProps(window, global)