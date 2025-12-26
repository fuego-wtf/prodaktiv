/// <reference types="vite/client" />

/**
 * Vite Worker Import Type Declarations
 *
 * These declarations enable TypeScript to understand Vite's special
 * import suffixes for Web Workers.
 */

declare module '*?worker' {
  const workerConstructor: {
    new (): Worker;
  };
  export default workerConstructor;
}

declare module '*?worker&inline' {
  const workerConstructor: {
    new (): Worker;
  };
  export default workerConstructor;
}
