export default function createKey(keyLength) {
  return Math.random().toString(36).substr(2, keyLength);
}