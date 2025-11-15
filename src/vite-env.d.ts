interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
declare module "*.ico" {
  const src: string;
  export default src;
}
