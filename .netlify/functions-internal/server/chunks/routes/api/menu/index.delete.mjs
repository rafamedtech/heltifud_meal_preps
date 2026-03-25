import { d as defineEventHandler, g as getRouterParam, c as createError, h as deleteWeeklyMenu } from '../../../nitro/nitro.mjs';
import 'zod';
import '@prisma/adapter-pg';
import 'pg';
import 'node:path';
import 'node:url';
import '@prisma/client/runtime/client';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:crypto';
import '@iconify/utils';
import 'consola';

const index_delete = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "ID de men\xFA inv\xE1lido." });
  }
  return deleteWeeklyMenu(id);
});

export { index_delete as default };
//# sourceMappingURL=index.delete.mjs.map
