ALTER TABLE `tbl_ranks`
  ADD COLUMN `base_rate` DECIMAL(8, 2) NULL,
  ADD COLUMN `monthly_cap` DECIMAL(12, 2) NULL;

ALTER TABLE `tbl_members`
  ADD COLUMN `gpg_paid_until` DATE NULL,
  ADD COLUMN `licenses_remaining` INTEGER NOT NULL DEFAULT 0;
