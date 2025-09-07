CREATE TABLE `age_progressions` (
	`id` text PRIMARY KEY NOT NULL,
	`generation_id` text NOT NULL,
	`new_age` integer NOT NULL,
	`new_age_unit` text NOT NULL,
	`progressed_image` text NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `generations` (
	`id` text PRIMARY KEY NOT NULL,
	`mother_image` text,
	`father_image` text,
	`baby_image` text,
	`ultrasound_image` text,
	`gender` text,
	`age` integer DEFAULT 6 NOT NULL,
	`age_unit` text DEFAULT 'months' NOT NULL,
	`generated_image` text NOT NULL,
	`created_at` integer,
	`prompt` text,
	`weight` text
);
