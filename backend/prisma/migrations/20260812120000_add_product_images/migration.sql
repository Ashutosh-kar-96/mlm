CREATE TABLE `tbl_product_images` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `product_id` INTEGER NOT NULL,
  `image_url` VARCHAR(255) NULL,
  `image_name` VARCHAR(180) NULL,
  `image_mime` VARCHAR(80) NULL,
  `image_data` LONGTEXT NULL,
  `sort_order` INTEGER NOT NULL DEFAULT 0,
  `is_primary` BOOLEAN NOT NULL DEFAULT false,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `tbl_product_images_product_id_idx`(`product_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `tbl_product_images`
  ADD CONSTRAINT `tbl_product_images_product_id_fkey`
  FOREIGN KEY (`product_id`) REFERENCES `tbl_products`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;
