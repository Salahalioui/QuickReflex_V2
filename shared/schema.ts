import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  age: integer("age"),
  sport: text("sport"),
  refreshRateHz: real("refresh_rate_hz").notNull().default(60),
  touchSamplingHz: real("touch_sampling_hz").notNull().default(120),
  deviceLatencyOffsetMs: real("device_latency_offset_ms").notNull().default(0),
  calibrationTimestamp: timestamp("calibration_timestamp").defaultNow(),
  deviceInfoString: text("device_info_string"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const testSessions = pgTable("test_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").references(() => profiles.id).notNull(),
  testType: text("test_type").notNull(), // 'SRT', 'CRT', 'GO_NO_GO', 'BATTERY', 'MIT'
  stimulusType: text("stimulus_type"), // 'visual', 'auditory', 'tactile'
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  metadata: jsonb("metadata"), // Store test configuration and device info
  status: text("status").notNull().default("in_progress"), // 'in_progress', 'completed', 'aborted'
  movementInitiationTime: real("movement_initiation_time"), // MIT calculated from finger tapping, in ms
  calibrationLimitations: text("calibration_limitations"), // Description of calibration limitations
  crossModalWarningShown: boolean("cross_modal_warning_shown").default(false), // Track if user was warned about cross-modal comparison
});

export const trials = pgTable("trials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => testSessions.id).notNull(),
  trialNumber: integer("trial_number").notNull(),
  stimulusType: text("stimulus_type").notNull(),
  stimulusDetail: text("stimulus_detail"), // Additional stimulus info
  cueTimestamp: real("cue_timestamp").notNull(),
  responseTimestamp: real("response_timestamp"),
  rtRaw: real("rt_raw"), // Raw reaction time in ms
  rtCorrected: real("rt_corrected"), // Latency-corrected reaction time
  stimulusDetectionTime: real("stimulus_detection_time"), // SDT = RT - MIT (for cognitive processing isolation)
  excludedFlag: boolean("excluded_flag").default(false),
  exclusionReason: text("exclusion_reason"),
  isPractice: boolean("is_practice").default(false),
  accuracy: boolean("accuracy"), // For Go/No-Go tests
  tapInterval: real("tap_interval"), // For MIT calculation (time between taps in finger tapping task)
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  calibrationTimestamp: true,
  deviceLatencyOffsetMs: true,
});

export const insertTestSessionSchema = createInsertSchema(testSessions).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

export const insertTrialSchema = createInsertSchema(trials).omit({
  id: true,
  createdAt: true,
});

// Types
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type TestSession = typeof testSessions.$inferSelect;
export type InsertTestSession = z.infer<typeof insertTestSessionSchema>;
export type Trial = typeof trials.$inferSelect;
export type InsertTrial = z.infer<typeof insertTrialSchema>;

// Enum types for better type safety
export const TestType = z.enum(['SRT', 'CRT_2', 'CRT_4', 'GO_NO_GO', 'BATTERY', 'MIT']);
export const StimulusType = z.enum(['visual', 'auditory', 'tactile']);
export const SessionStatus = z.enum(['in_progress', 'completed', 'aborted']);

// Calibration limitation types for transparency
export const CalibrationLimitation = z.enum([
  'no_external_hardware_calibration',
  'cross_modal_timing_differences_not_measured',
  'system_latency_not_precisely_measured',
  'display_refresh_rate_estimation_only',
  'audio_buffer_delay_unknown',
  'tactile_motor_startup_latency_unknown'
]);

export type TestTypeEnum = z.infer<typeof TestType>;
export type StimulusTypeEnum = z.infer<typeof StimulusType>;
export type SessionStatusEnum = z.infer<typeof SessionStatus>;
export type CalibrationLimitationEnum = z.infer<typeof CalibrationLimitation>;
