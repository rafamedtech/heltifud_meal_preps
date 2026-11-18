import { deletePlan } from '../../../utils/plans';
import { requireUuidParam } from '../../../utils/routeParams';

export default defineEventHandler((event) => deletePlan(requireUuidParam(event, 'id', 'del plan')));
