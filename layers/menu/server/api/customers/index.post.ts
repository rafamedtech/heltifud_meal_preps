import type { CustomerInput } from '~~/layers/menu/shared/types/types';

import { createCustomer } from '../../utils/customers';

export default defineEventHandler(async (event) => createCustomer(await readBody<CustomerInput>(event)));
