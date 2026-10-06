import { handleGo, CONFIG } from '../_shared/golinks.js';
export async function onRequest(context) {
  const res = await handleGo(context.request, context.env, context, CONFIG);
  return res || context.next();
}
