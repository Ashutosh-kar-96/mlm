ALTER TABLE `tbl_gpg_subscriptions`
  ADD COLUMN `rank_label` DECIMAL(8, 2) NULL,
  ADD COLUMN `assignment_mode` VARCHAR(20) NULL,
  ADD COLUMN `assigned_at` DATETIME(3) NULL;

UPDATE `tbl_gpg_subscriptions` AS g
JOIN `tbl_members` AS m ON m.`regno` = g.`regno`
JOIN `tbl_ranks` AS r ON r.`id` = m.`rank_id`
SET g.`rank_label` = r.`percentage`
WHERE g.`rank_label` IS NULL;

CREATE UNIQUE INDEX `tbl_gpg_subscriptions_cycle_rank_position_key`
  ON `tbl_gpg_subscriptions`(`cycle_key`, `rank_label`, `access_number`);
