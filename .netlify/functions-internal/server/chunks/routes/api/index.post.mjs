import { d as defineEventHandler, r as readBody, f as createFoodCatalogItem } from '../../nitro/nitro.mjs';
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

const index_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  return createFoodCatalogItem(body);
});

export { index_post as default };
