import { html } from 'hono/html'

export const createDashboardTemplate = () =>
  html`<!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Failed Jobs Dashboard</title>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-4Q6Gf2aSP4eDXB8Miphtr37CMZZQ5oXLH2yaXMJ2w8e2ZtHTl7GptT4jmndRuHDT"
          crossorigin="anonymous"
        />
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-j1CDi7MgGQ12Z7Qab0qlWQ/Qqz24Gc6BM0thvEMVjHnfYGF0rmFCozFSxQBxwHKO"
          crossorigin="anonymous"
        ></script>
        <script
          src="https://unpkg.com/htmx.org@2.0.4"
          integrity="sha384-HGfztofotfshcF7+8n44JQL2oJmowVChPTg48S+jvZoztPfvwD79OC/LTtG6dMp+"
          crossorigin="anonymous"
        ></script>
      </head>
      <body>
        <div class="container mt-5">
          <h1>Failed Jobs</h1>
          <table class="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Job Name</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody hx-get="/dashboard/failed-jobs" hx-trigger="load" hx-target="this">
              <!-- Rows will be dynamically populated by htmx -->
              </tr>
            </tbody>
          </table>
        </div>
      </body>
    </html>`
