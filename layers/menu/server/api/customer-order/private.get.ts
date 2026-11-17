import { getPrivateCustomerOrder } from '../../utils/customerOrders';
export default defineEventHandler(event => getPrivateCustomerOrder(getHeader(event, 'x-order-token') ?? ''));
