ALTER TABLE `tbl_ranks`
  ADD COLUMN `percentage` DECIMAL(8, 2) NULL,
  ADD COLUMN `self_shopping_amount` DECIMAL(12, 2) NULL,
  ADD COLUMN `challenge_business_bv` DECIMAL(12, 2) NULL,
  ADD COLUMN `challenge_months` INTEGER NULL;
