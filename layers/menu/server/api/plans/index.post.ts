import type { PlanInput } from '~~/layers/menu/shared/types/types';

import { createPlan } from '../../utils/plans';

export default defineEventHandler(async (event) => createPlan(await readBody<PlanInput>(event)));
