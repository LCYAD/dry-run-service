import { check } from 'k6'
import http from 'k6/http'
import { fakeJson } from './faker.js'

export const options = {
  vus: 1,
  duration: '10s'
}

export default function () {
  const res = http.post(
    'http://localhost:3000/jobs/test-json-equal',
    JSON.stringify({ expectedRes: fakeJson }),
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
  check(res, {
    'status was 201': r => r.status == 201
  })
}
