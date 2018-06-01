// @flow
import React, { createContext } from 'react'

export type OutletContextValue = { index: number }

const OutletContext = React.createContext(({ index: 0 }: OutletContextValue))

export default OutletContext
