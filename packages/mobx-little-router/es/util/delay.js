export default function delay(ms) {
  return new Promise(function (res) {
    setTimeout(function () {
      return res();
    }, ms);
  });
}