ALTER TABLE `tbl_products`
  ADD COLUMN `category` VARCHAR(80) NULL,
  ADD COLUMN `brand` VARCHAR(80) NULL,
  ADD COLUMN `hsn_code` VARCHAR(30) NULL,
  ADD COLUMN `size` VARCHAR(60) NULL,
  ADD COLUMN `color` VARCHAR(60) NULL,
  ADD COLUMN `material` VARCHAR(100) NULL,
  ADD COLUMN `discount_percent` DECIMAL(5, 2) NULL,
  ADD COLUMN `image_name` VARCHAR(180) NULL,
  ADD COLUMN `image_mime` VARCHAR(80) NULL,
  ADD COLUMN `image_data` LONGTEXT NULL,
  ADD COLUMN `highlights` TEXT NULL,
  ADD COLUMN `care_instructions` TEXT NULL;
