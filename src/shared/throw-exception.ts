export function throwException<T extends Error>(exception: T): never {
  throw exception;
}
