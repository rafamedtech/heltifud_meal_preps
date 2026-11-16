import type { OperationSettingsInput } from '~~/layers/menu/shared/types/types';

import { updateOperationSettings } from '../../utils/cycles';

export default defineEventHandler(async (event) => updateOperationSettings(await readBody<OperationSettingsInput>(event)));
