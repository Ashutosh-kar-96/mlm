ALTER TABLE `tbl_members`
  ADD COLUMN `rank38_achieved_at` DATETIME(3) NULL;

ALTER TABLE `tbl_rank_history`
  ADD COLUMN `promotion_reason` VARCHAR(60) NULL,
  ADD COLUMN `qualification_snapshot` TEXT NULL;

ALTER TABLE `tbl_commissions`
  ADD COLUMN `source_key` VARCHAR(120) NULL,
  ADD COLUMN `reason_code` VARCHAR(80) NULL,
  ADD COLUMN `rank_label` DECIMAL(8, 2) NULL,
  ADD COLUMN `lower_rank_label` DECIMAL(8, 2) NULL,
  ADD COLUMN `amount_before_cap` DECIMAL(12, 2) NULL,
  ADD COLUMN `cap_applied` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `gpg_slot` INTEGER NULL,
  ADD COLUMN `audit_json` TEXT NULL;

CREATE UNIQUE INDEX `tbl_commissions_source_key_key` ON `tbl_commissions`(`source_key`);

CREATE TABLE `tbl_license_usages` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `giver_regno` VARCHAR(20) NOT NULL,
  `giver_rank_at_time` DECIMAL(8, 2) NOT NULL,
  `receiver_regno` VARCHAR(20) NOT NULL,
  `receiver_previous_rank` DECIMAL(8, 2) NOT NULL,
  `receiver_new_rank` DECIMAL(8, 2) NOT NULL,
  `license_sequence` INTEGER NOT NULL,
  `reference_id` VARCHAR(120) NOT NULL,
  `metadata_json` TEXT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `tbl_license_usages_receiver_regno_key`(`receiver_regno`),
  UNIQUE INDEX `tbl_license_usages_reference_id_key`(`reference_id`),
  INDEX `tbl_license_usages_giver_regno_idx`(`giver_regno`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `tbl_gpg_subscriptions` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `regno` VARCHAR(20) NOT NULL,
  `cycle_key` VARCHAR(20) NOT NULL,
  `subscribed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `approval_status` VARCHAR(30) NOT NULL DEFAULT 'Pending',
  `approved_at` DATETIME(3) NULL,
  `rejected_at` DATETIME(3) NULL,
  `approved_by_id` INTEGER NULL,
  `access_number` INTEGER NULL,
  `metadata_json` TEXT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `tbl_gpg_subscriptions_regno_cycle_key_key`(`regno`, `cycle_key`),
  INDEX `tbl_gpg_subscriptions_cycle_key_approval_status_idx`(`cycle_key`, `approval_status`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `tbl_rank_challenges` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `regno` VARCHAR(20) NOT NULL,
  `challenge_type` VARCHAR(40) NOT NULL DEFAULT 'RANK_41',
  `status` VARCHAR(30) NOT NULL DEFAULT 'Active',
  `started_at` DATETIME(3) NOT NULL,
  `ends_at` DATETIME(3) NOT NULL,
  `required_bv` DECIMAL(12, 2) NOT NULL DEFAULT 1490000,
  `current_bv` DECIMAL(12, 2) NOT NULL DEFAULT 0,
  `metadata_json` TEXT NULL,
  `completed_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `tbl_rank_challenges_regno_challenge_type_started_at_key`(`regno`, `challenge_type`, `started_at`),
  INDEX `tbl_rank_challenges_status_idx`(`status`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `tbl_license_usages`
  ADD CONSTRAINT `tbl_license_usages_giver_regno_fkey` FOREIGN KEY (`giver_regno`) REFERENCES `tbl_members`(`regno`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `tbl_license_usages_receiver_regno_fkey` FOREIGN KEY (`receiver_regno`) REFERENCES `tbl_members`(`regno`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `tbl_gpg_subscriptions`
  ADD CONSTRAINT `tbl_gpg_subscriptions_regno_fkey` FOREIGN KEY (`regno`) REFERENCES `tbl_members`(`regno`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `tbl_rank_challenges`
  ADD CONSTRAINT `tbl_rank_challenges_regno_fkey` FOREIGN KEY (`regno`) REFERENCES `tbl_members`(`regno`) ON DELETE RESTRICT ON UPDATE CASCADE;
