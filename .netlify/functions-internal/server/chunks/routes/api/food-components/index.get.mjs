import { d as defineEventHandler, g as getRouterParam, c as createError, b as getFoodCatalogItemById } from '../../../nitro/nitro.mjs';
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

const index_get = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "ID de FoodComponent inv\xE1lido." });
  }
  const item = await getFoodCatalogItemById(id);
  if (!item) {
    throw createError({ statusCode: 404, statusMessage: "FoodComponent no encontrado." });
  }
  return item;
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
