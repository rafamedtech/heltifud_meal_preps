import type { PlanInput } from '~~/layers/menu/shared/types/types';

import { updatePlan } from '../../../utils/plans';
import { requireUuidParam } from '../../../utils/routeParams';

export default defineEventHandler(async (event) => updatePlan(requireUuidParam(event, 'id', 'del plan'), await readBody<PlanInput>(event)));
