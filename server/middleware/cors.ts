import {
  defineEventHandler,
  getRequestHeader,
  getRequestURL,
  setHeader,
  setResponseStatus,
} from 'h3'

const DEFAULT_ALLOWED_HEADERS = [
  'Authorization',
  'Content-Type',
  'Accept',
  'Origin',
  'X-Requested-With',
]

const DEFAULT_ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']

function parseAllowedOrigins(raw: string | undefined) {
  return (raw ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname

  if (!path.startsWith('/api/')) {
    return
  }

  const config = useRuntimeConfig(event)
  const allowedOrigins = parseAllowedOrigins(config.corsAllowedOrigins)
  const origin = getRequestHeader(event, 'origin')

  setHeader(event, 'Vary', 'Origin')
  setHeader(event, 'Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS.join(', '))
  setHeader(event, 'Access-Control-Allow-Headers', DEFAULT_ALLOWED_HEADERS.join(', '))
  setHeader(event, 'Access-Control-Max-Age', '86400')

  if (!origin) {
    return
  }

  if (!allowedOrigins.includes(origin)) {
    if (event.method === 'OPTIONS') {
      setResponseStatus(event, 403, 'CORS origin not allowed')
      return 'CORS origin not allowed'
    }

    return
  }

  setHeader(event, 'Access-Control-Allow-Origin', origin)

  if (event.method === 'OPTIONS') {
    setResponseStatus(event, 204)
    return ''
  }
})
