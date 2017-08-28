// @flow
import differenceWith from './differenceWith'

test('differenceWith', () => {
  expect(differenceWith(eq, [1, 2, 3], [1, 3, 4, 5])).toEqual([2])

  // Does not include duplicate input.
  expect(differenceWith(eq, [1, 1, 2, 3], [3, 4, 5])).toEqual([1, 2])
})

function eq(a, b) {
  return a === b
}
