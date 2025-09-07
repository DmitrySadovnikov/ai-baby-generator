import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';

export const generations = sqliteTable('generations', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  
  // Input images (base64 encoded)
  motherImage: text('mother_image'),
  fatherImage: text('father_image'),
  babyImage: text('baby_image'),
  ultrasoundImage: text('ultrasound_image'),
  
  // Baby specifications
  gender: text('gender'), // 'male', 'female', or null
  age: integer('age').notNull().default(6),
  ageUnit: text('age_unit').notNull().default('months'), // 'months' or 'years'
  
  // Output
  generatedImage: text('generated_image').notNull(), // base64 encoded result
  
  // Metadata
  createdAt: integer('created_at').$defaultFn(() => Date.now()),
  prompt: text('prompt'),
  
  // Optional modifications
  weight: text('weight'), // 'light', 'normal', 'heavy'
});

export const ageProgressions = sqliteTable('age_progressions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  generationId: text('generation_id').notNull(),
  
  // New age specifications
  newAge: integer('new_age').notNull(),
  newAgeUnit: text('new_age_unit').notNull(),
  
  // Result
  progressedImage: text('progressed_image').notNull(),
  
  // Metadata
  createdAt: integer('created_at').$defaultFn(() => Date.now()),
});