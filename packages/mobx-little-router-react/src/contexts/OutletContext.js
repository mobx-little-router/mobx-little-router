// @flow
import React, { createContext } from 'react'

export type OutletContextValue = { index: number }

const OutletContext = createContext(({ index: 0 }: OutletContextValue))

export default OutletContext
