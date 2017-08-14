// @flow
import type { History, Location as HistoryLocation } from 'history'

export type Query = { [key: string]: string }
export type Params = { [key: string]: string }

export type HistoryCreatorFn = (opts: any) => History

export type Location = $Shape<
  HistoryLocation & {
    params: Params,
    query: Query
  }
>
