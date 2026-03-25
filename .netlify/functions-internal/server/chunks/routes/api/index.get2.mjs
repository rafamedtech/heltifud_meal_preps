import { d as defineEventHandler, l as getActiveMenu } from '../../nitro/nitro.mjs';
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

const index_get = defineEventHandler(async () => {
  return await getActiveMenu();
});

export { index_get as default };
//# sourceMappingURL=index.get2.mjs.map
