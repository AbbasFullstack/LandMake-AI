CREATE TABLE `apiProjects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`name` varchar(120) NOT NULL,
	`description` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `apiProjects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `apiSpecVersions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`name` varchar(120) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`format` enum('yaml','json') NOT NULL DEFAULT 'yaml',
	`validationState` enum('valid','invalid','unvalidated') NOT NULL DEFAULT 'unvalidated',
	`validationDetails` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `apiSpecVersions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projectActivities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`actorId` int NOT NULL,
	`type` varchar(64) NOT NULL,
	`message` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `projectActivities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `apiProjects` ADD CONSTRAINT `apiProjects_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `apiSpecVersions` ADD CONSTRAINT `apiSpecVersions_projectId_apiProjects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `apiProjects`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projectActivities` ADD CONSTRAINT `projectActivities_projectId_apiProjects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `apiProjects`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projectActivities` ADD CONSTRAINT `projectActivities_actorId_users_id_fk` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `apiProjects_ownerId_idx` ON `apiProjects` (`ownerId`);--> statement-breakpoint
CREATE INDEX `apiSpecVersions_projectId_idx` ON `apiSpecVersions` (`projectId`);--> statement-breakpoint
CREATE INDEX `projectActivities_projectId_idx` ON `projectActivities` (`projectId`);--> statement-breakpoint
CREATE INDEX `projectActivities_actorId_idx` ON `projectActivities` (`actorId`);