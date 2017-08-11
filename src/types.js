// @flow
import type { History, Location as HistoryLocation } from 'history'

export type Query = { [key: string]: string }
export type Params = { [key: string]: string }

export type Href = string | Location

export type HistoryCreatorFn = (opts: any) => History

export type Location = $Shape<
  HistoryLocation & {
    params: Params,
    query: Query
  }
>

export const GuardTypes = {
  CAN_ACTIVATE: 'CAN_ACTIVATE',
  CAN_DEACTIVATE: 'CAN_DEACTIVATE'
}

export type GuardType = $Keys<typeof GuardTypes>

export type GuardFn = () => boolean | Promise<boolean>
