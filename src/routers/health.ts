import { Hono } from 'hono'

const router = new Hono()

router.get('/healthz', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  })
})

export default router 
