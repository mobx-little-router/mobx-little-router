

export function differenceWith(f, xs, ys) {
  var out = [];
  var idx = 0;
  var firstLen = xs.length;
  while (idx < firstLen) {
    if (!ys.some(function (y) {
      return f(y, xs[idx]);
    }) && !out.some(function (o) {
      return f(o, xs[idx]);
    })) {
      out.push(xs[idx]);
    }
    idx += 1;
  }
  return out;
}