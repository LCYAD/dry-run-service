import { Hono } from 'hono'

const router = new Hono().basePath('/healthz')

router.get('/', c => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  })
})

export default router
