import { check } from 'k6'
import http from 'k6/http'
import { fakeJson } from './faker.js'

export const options = {
  vus: 1,
  duration: '10s'
}

const duplicationFactor = __ENV.DUPLICATION_FACTOR || 1
const duplicatedFakeJson = Array.from(
  { length: duplicationFactor },
  () => fakeJson
).flat()

export default function () {
  const res = http.post(
    'http://localhost:3000/jobs/test-heavy',
    JSON.stringify({ expectedRes: duplicatedFakeJson }),
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
  check(res, {
    'status was 201': r => r.status == 201
  })
}
