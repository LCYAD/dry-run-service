import { html } from 'hono/html'

export const createFailedJobListTemplate = (
  failedJobs: { jobId: string; jobName: string; createdAt: Date }[]
) => html`
  ${html`${failedJobs.map(
    job => html`
      <tr>
        <td>${job.jobId}</td>
        <td>${job.jobName}</td>
        <td>${job.createdAt.toLocaleString()}</td>
        <td><button>Download File</button></td>
      </tr>
    `
  )}`}
`
