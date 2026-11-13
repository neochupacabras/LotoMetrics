/* eslint-disable -- script de evidência da auditoria, fora do código do site */
// Permite rodar os .ts do projeto com `node --import ./ts-loader.mjs`:
// resolve imports sem extensão e o alias "@/".
import { register } from "node:module";
register("data:text/javascript," + encodeURIComponent(`
import { pathToFileURL } from "node:url";
const RAIZ = ${JSON.stringify(new URL("../../../../../", import.meta.url).href)};
export async function resolve(esp, ctx, next) {
  if (esp.startsWith("@/")) esp = RAIZ + esp.slice(2);
  try { return await next(esp, ctx); }
  catch (e) { if (!/\.[cm]?[jt]sx?$/.test(esp)) { for (const ext of [".ts", ".tsx", "/index.ts"]) { try { return await next(esp + ext, ctx); } catch {} } } throw e; }
}`));
