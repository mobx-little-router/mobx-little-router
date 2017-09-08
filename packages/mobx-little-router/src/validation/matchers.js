// @flow

export function empty(x: any) {
  return {
    type: 'empty',
    pass: x === null || x === undefined
  }
}

export function string(x: any) {
  return {
    type: 'string',
    pass: typeof x === 'string'
  }
}

export function number(x: any) {
  return {
    type: 'number',
    pass: typeof x === 'number'
  }
}

export function func(x: any) {
  return {
    type: 'function',
    pass: typeof x === 'function'
  }
}


export function array(x: any) {
  return {
    type: 'array',
    pass: Array.isArray(x)
  }
}
