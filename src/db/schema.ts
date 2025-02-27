import { sql } from 'drizzle-orm'
import {
  bigint,
  boolean,
  index,
  mysqlTableCreator,
  timestamp,
  varchar
} from 'drizzle-orm/mysql-core'

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = mysqlTableCreator(name => name)

export const failedJobs = createTable(
  'failed_job',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
    jobId: varchar('job_id', { length: 255 }).notNull(),
    jobName: varchar('job_name', { length: 255 }).notNull(),
    s3Key: varchar('s3_key', { length: 255 }).notNull(),
    downloadApproved: boolean('download_approved').default(false),
    createdAt: timestamp('created_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at').onUpdateNow()
  },
  fj => [index('job_id_idx').on(fj.jobId)]
)

export const auditLogs = createTable(
  'audit_log',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
    jobId: bigint('job_id', { mode: 'number' }).notNull(),
    event: varchar('event', { length: 255 }).notNull(),
    performedBy: varchar('performed_by', { length: 255 }).notNull(),
    createdAt: timestamp('created_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at').onUpdateNow()
  },
  al => [
    index('audit_log_job_id_idx').on(al.jobId),
    index('audit_log_performed_by_idx').on(al.performedBy)
  ]
)
