ALTER TABLE `tbl_members`
  ADD COLUMN `photo_name` VARCHAR(180) NULL,
  ADD COLUMN `photo_mime` VARCHAR(80) NULL,
  ADD COLUMN `photo_data` LONGTEXT NULL;
