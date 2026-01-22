/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Kysely } from 'kysely';

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('application')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('user_id', 'int4', (col) => col.references('user.id'))
    .addColumn('startup_name', 'text', (col) => col.notNull())
    .addColumn('industry', 'text', (col) => col.notNull())
    .addColumn('analysis', 'text', (col) => col.notNull())
    .execute();
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('application').execute();
}
