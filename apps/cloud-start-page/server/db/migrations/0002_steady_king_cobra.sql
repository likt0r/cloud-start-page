CREATE TABLE `site_settings` (
	`id` integer PRIMARY KEY DEFAULT 1 NOT NULL,
	`login_button_text` text DEFAULT 'Login' NOT NULL,
	`page_title` text DEFAULT 'Cloud Start Page' NOT NULL,
	`logo_path` text DEFAULT '' NOT NULL,
	`logo_small_path` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
INSERT OR IGNORE INTO `site_settings` (`id`, `login_button_text`, `page_title`, `logo_path`, `logo_small_path`)
VALUES (1, 'Login', 'Cloud Start Page', '', '');
