import { d as defineEventHandler, n as getNextMenu, c as createError } from '../../../nitro/nitro.mjs';
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

const next_get = defineEventHandler(async () => {
  const nextMenu = await getNextMenu();
  if (!nextMenu) {
    throw createError({ statusCode: 404, statusMessage: "No hay un men\xFA pr\xF3ximo disponible." });
  }
  return nextMenu;
});

export { next_get as default };
