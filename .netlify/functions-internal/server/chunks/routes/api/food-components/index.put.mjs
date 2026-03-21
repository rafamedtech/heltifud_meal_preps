import { d as defineEventHandler, g as getRouterParam, c as createError, r as readBody, u as updateFoodCatalogItem } from '../../../nitro/nitro.mjs';
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

const index_put = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "ID de FoodComponent inv\xE1lido." });
  }
  const body = await readBody(event);
  return updateFoodCatalogItem(id, body);
});

export { index_put as default };
