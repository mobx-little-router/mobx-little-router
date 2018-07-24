// @flow
import createContext from 'create-react-context';

export type OutletContextValue = { index: number }

const OutletContext = createContext(({ index: 0 }: OutletContextValue))

export default OutletContext
