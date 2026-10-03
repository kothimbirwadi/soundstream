// Declare CSS module imports as side-effect modules (no typed exports)
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}
