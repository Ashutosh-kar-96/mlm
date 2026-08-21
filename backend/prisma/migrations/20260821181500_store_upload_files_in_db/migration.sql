ALTER TABLE `tbl_file_uploads`
  ADD COLUMN `mime_type` VARCHAR(80) NULL,
  ADD COLUMN `file_size` INTEGER NULL,
  ADD COLUMN `file_data` LONGBLOB NULL;

CREATE INDEX `tbl_file_uploads_file_url_idx` ON `tbl_file_uploads`(`file_url`);
