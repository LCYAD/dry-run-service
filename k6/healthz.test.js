import { check } from 'k6'
import http from 'k6/http'

export const options = {
  vus: 1,
  duration: '10s'
}

export default function () {
  const res = http.get('http://localhost:3000/healthz')
  check(res, { 'status was 200': r => r.status == 200 })
}
