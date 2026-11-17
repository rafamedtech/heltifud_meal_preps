import type { PlanInput } from '~~/layers/menu/shared/types/types';

import { updatePlan } from '../../../utils/plans';

export default defineEventHandler(async (event) => updatePlan(getRouterParam(event, 'id'), await readBody<PlanInput>(event)));
