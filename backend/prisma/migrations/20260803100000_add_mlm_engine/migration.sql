CREATE TABLE `tbl_commissions` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `order_id` INTEGER NOT NULL,
  `earner_regno` VARCHAR(20) NOT NULL,
  `source_regno` VARCHAR(20) NOT NULL,
  `level` INTEGER NOT NULL,
  `type` VARCHAR(40) NOT NULL,
  `base_amount` DECIMAL(12, 2) NOT NULL,
  `percentage` DECIMAL(8, 2) NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'Credited',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `tbl_mlm_settings` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `key_name` VARCHAR(80) NOT NULL,
  `value_json` TEXT NOT NULL,
  `description` VARCHAR(255) NULL,
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `tbl_mlm_settings_key_name_key`(`key_name`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `tbl_audit_logs` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `admin_id` INTEGER NULL,
  `action` VARCHAR(80) NOT NULL,
  `entity_type` VARCHAR(80) NULL,
  `entity_id` VARCHAR(80) NULL,
  `details_json` TEXT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `tbl_commissions` ADD CONSTRAINT `tbl_commissions_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `tbl_orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `tbl_commissions` ADD CONSTRAINT `tbl_commissions_earner_regno_fkey` FOREIGN KEY (`earner_regno`) REFERENCES `tbl_members`(`regno`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `tbl_commissions` ADD CONSTRAINT `tbl_commissions_source_regno_fkey` FOREIGN KEY (`source_regno`) REFERENCES `tbl_members`(`regno`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `tbl_audit_logs` ADD CONSTRAINT `tbl_audit_logs_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `tbl_admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
