import { deletePlan } from '../../../utils/plans';

export default defineEventHandler((event) => deletePlan(getRouterParam(event, 'id')));
