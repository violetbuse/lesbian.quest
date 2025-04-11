CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`clerk_id` text NOT NULL,
	`email` text,
	`name` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_clerk_id_unique` ON `users` (`clerk_id`);