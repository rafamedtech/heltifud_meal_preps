export default defineEventHandler(event => {
  const path = getRequestURL(event).pathname;
  if (path.startsWith('/api/customer-order') || path.startsWith('/pedido') || path.endsWith('/order-link') || path.endsWith('/private-link')) {
    setResponseHeader(event, 'Cache-Control', 'no-store');
    setResponseHeader(event, 'Referrer-Policy', 'no-referrer');
    setResponseHeader(event, 'X-Robots-Tag', 'noindex, nofollow');
  }
});
