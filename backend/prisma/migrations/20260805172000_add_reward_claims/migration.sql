CREATE TABLE `tbl_reward_claims` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `regno` VARCHAR(20) NOT NULL,
  `reward_key` VARCHAR(120) NOT NULL,
  `title` VARCHAR(120) NOT NULL,
  `condition_text` VARCHAR(255) NULL,
  `reward_text` VARCHAR(255) NOT NULL,
  `rank_percent` DECIMAL(8, 2) NOT NULL,
  `self_bv` DECIMAL(12, 2) NOT NULL DEFAULT 0,
  `team_bv` DECIMAL(12, 2) NOT NULL DEFAULT 0,
  `status` VARCHAR(30) NOT NULL DEFAULT 'Pending',
  `remarks` VARCHAR(255) NULL,
  `approved_at` DATETIME(3) NULL,
  `paid_at` DATETIME(3) NULL,
  `rejected_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,

  INDEX `tbl_reward_claims_status_idx`(`status`),
  UNIQUE INDEX `tbl_reward_claims_regno_reward_key_key`(`regno`, `reward_key`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `tbl_reward_claims`
  ADD CONSTRAINT `tbl_reward_claims_regno_fkey`
  FOREIGN KEY (`regno`) REFERENCES `tbl_members`(`regno`)
  ON DELETE RESTRICT ON UPDATE CASCADE;
