CREATE TABLE `tbl_member_genealogy` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `ancestor_regno` VARCHAR(20) NOT NULL,
  `descendant_regno` VARCHAR(20) NOT NULL,
  `depth` INTEGER NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `tbl_member_genealogy_ancestor_regno_descendant_regno_key` (`ancestor_regno`, `descendant_regno`),
  INDEX `tbl_member_genealogy_descendant_regno_idx` (`descendant_regno`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `tbl_member_genealogy`
  ADD CONSTRAINT `tbl_member_genealogy_ancestor_regno_fkey`
  FOREIGN KEY (`ancestor_regno`) REFERENCES `tbl_members`(`regno`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `tbl_member_genealogy`
  ADD CONSTRAINT `tbl_member_genealogy_descendant_regno_fkey`
  FOREIGN KEY (`descendant_regno`) REFERENCES `tbl_members`(`regno`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `tbl_payout`
  ADD COLUMN `transaction_ref` VARCHAR(100) NULL,
  ADD COLUMN `payment_mode` VARCHAR(40) NULL,
  ADD COLUMN `remarks` VARCHAR(255) NULL;

INSERT IGNORE INTO `tbl_member_genealogy` (`ancestor_regno`, `descendant_regno`, `depth`, `created_at`)
SELECT `regno`, `regno`, 0, CURRENT_TIMESTAMP(3)
FROM `tbl_members`;

INSERT IGNORE INTO `tbl_member_genealogy` (`ancestor_regno`, `descendant_regno`, `depth`, `created_at`)
SELECT `sponsor_id`, `regno`, 1, CURRENT_TIMESTAMP(3)
FROM `tbl_members`
WHERE `sponsor_id` IS NOT NULL AND `sponsor_id` <> '';
