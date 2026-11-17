import { revokeOrderLinks } from '../../../utils/orderAccess';
export default defineEventHandler(event => revokeOrderLinks(getRouterParam(event, 'id')!));
