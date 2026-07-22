import { pgTable, text, timestamp, integer, boolean, decimal, uuid, jsonb } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Common fields for all tables
const commonFields = {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
};

export const drivers = pgTable('drivers', {
  ...commonFields,
  cwdsId: text('cwds_id').notNull().unique(),
  name: text('name').notNull(),
  passport: text('passport').notNull(),
  visaType: text('visa_type').notNull(),
  status: text('status').default('NewOnboarded').notNull(),
  clientId: uuid('client_id'),
  trainingFee: decimal('training_fee').default('1000').notNull(),
  trainingBalance: decimal('training_balance').default('1000').notNull(),
  absences: integer('absences').default(0).notNull(),
  lastSeen: timestamp('last_seen'),
  vehicleId: uuid('vehicle_id'),
  simId: uuid('sim_id'),
  finesBalance: decimal('fines_balance').default('0').notNull(),
  advancesOwed: decimal('advances_owed').default('0').notNull(),
  notes: text('notes'),
});

export const clients = pgTable('clients', {
  ...commonFields,
  name: text('name').notNull().unique(),
  sopText: text('sop_text'),
  standardSalary: decimal('standard_salary').default('2800').notNull(),
});

export const assets = pgTable('assets', {
  ...commonFields,
  type: text('type').notNull(), // 'Vehicle', 'SIM', 'Uniform', 'Helmet'
  identifier: text('identifier').notNull(), // plate number, SIM number
  status: text('status').default('Available').notNull(),
  assignedTo: uuid('assigned_to'), // driver id
  maintenanceDate: timestamp('maintenance_date'),
  stockLevel: integer('stock_level'), // For bulk items
});

export const assignments = pgTable('assignments', {
  ...commonFields,
  driverId: uuid('driver_id').notNull(),
  clientId: uuid('client_id').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  salary: decimal('salary').notNull(),
  reason: text('reason'), // Reason for ending assignment
});

export const approvals = pgTable('approvals', {
  ...commonFields,
  type: text('type').notNull(), // 'fee_discount', 'salary_hike', etc.
  driverId: uuid('driver_id'),
  details: text('details'),
  status: text('status').default('Pending').notNull(),
  requestedBy: text('requested_by').notNull(),
});

export const financeLedgers = pgTable('finance_ledgers', {
  ...commonFields,
  driverId: uuid('driver_id').notNull(),
  transactionType: text('transaction_type').notNull(), // 'Fine', 'Advance', 'Salary', 'Deduction'
  amount: decimal('amount').notNull(),
  description: text('description'),
  date: timestamp('date').defaultNow().notNull(),
});

export const auditLogs = pgTable('audit_logs', {
  ...commonFields,
  actorId: text('actor_id').notNull(),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  changes: jsonb('changes').notNull(),
});

export const outboxEvents = pgTable('outbox_events', {
  ...commonFields,
  eventType: text('event_type').notNull(),
  eventVersion: integer('event_version').notNull(),
  payload: jsonb('payload').notNull(),
  correlationId: text('correlation_id'),
  processedAt: timestamp('processed_at'),
});
