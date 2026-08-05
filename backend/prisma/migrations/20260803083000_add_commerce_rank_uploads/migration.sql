CREATE TABLE `tbl_products` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT NULL,
  `sku` VARCHAR(50) NULL,
  `price` DECIMAL(12, 2) NOT NULL,
  `offer_price` DECIMAL(12, 2) NULL,
  `pv` DECIMAL(12, 2) NULL,
  `bv` DECIMAL(12, 2) NULL,
  `gst_percent` DECIMAL(5, 2) NOT NULL DEFAULT 0,
  `stock` INTEGER NOT NULL DEFAULT 0,
  `image_url` VARCHAR(255) NULL,
  `active` BOOLEAN NOT NULL DEFAULT true,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `tbl_products_sku_key`(`sku`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `tbl_cart_items` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `regno` VARCHAR(20) NOT NULL,
  `product_id` INTEGER NOT NULL,
  `quantity` INTEGER NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `tbl_cart_items_regno_product_id_key`(`regno`, `product_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `tbl_wallet_ledger` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `regno` VARCHAR(20) NOT NULL,
  `type` VARCHAR(30) NOT NULL,
  `description` VARCHAR(255) NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `balance` DECIMAL(12, 2) NULL,
  `reference_id` VARCHAR(80) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `tbl_rank_history` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `regno` VARCHAR(20) NOT NULL,
  `old_rank_id` INTEGER NULL,
  `new_rank_id` INTEGER NULL,
  `old_rank_name` VARCHAR(50) NULL,
  `new_rank_name` VARCHAR(50) NULL,
  `old_percent` DECIMAL(8, 2) NULL,
  `new_percent` DECIMAL(8, 2) NULL,
  `changed_by_id` INTEGER NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `tbl_file_uploads` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `regno` VARCHAR(20) NOT NULL,
  `type` VARCHAR(40) NOT NULL,
  `file_name` VARCHAR(180) NULL,
  `file_url` VARCHAR(255) NOT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'Pending',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `tbl_order_items` ADD COLUMN `product_id` INTEGER NULL;

ALTER TABLE `tbl_cart_items` ADD CONSTRAINT `tbl_cart_items_regno_fkey` FOREIGN KEY (`regno`) REFERENCES `tbl_members`(`regno`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `tbl_cart_items` ADD CONSTRAINT `tbl_cart_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `tbl_products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `tbl_order_items` ADD CONSTRAINT `tbl_order_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `tbl_products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `tbl_wallet_ledger` ADD CONSTRAINT `tbl_wallet_ledger_regno_fkey` FOREIGN KEY (`regno`) REFERENCES `tbl_members`(`regno`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `tbl_rank_history` ADD CONSTRAINT `tbl_rank_history_regno_fkey` FOREIGN KEY (`regno`) REFERENCES `tbl_members`(`regno`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `tbl_rank_history` ADD CONSTRAINT `tbl_rank_history_changed_by_id_fkey` FOREIGN KEY (`changed_by_id`) REFERENCES `tbl_admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `tbl_file_uploads` ADD CONSTRAINT `tbl_file_uploads_regno_fkey` FOREIGN KEY (`regno`) REFERENCES `tbl_members`(`regno`) ON DELETE RESTRICT ON UPDATE CASCADE;
