import { getPlans } from '../../utils/plans';

export default defineEventHandler(() => getPlans(false));
