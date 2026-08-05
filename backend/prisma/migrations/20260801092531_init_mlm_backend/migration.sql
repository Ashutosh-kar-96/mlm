-- CreateTable
CREATE TABLE `tbl_ranks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rank_name` VARCHAR(50) NOT NULL,
    `criteria_bv` DECIMAL(12, 2) NULL,
    `level_no` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_members` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `regno` VARCHAR(20) NOT NULL,
    `username` VARCHAR(50) NULL,
    `first_name` VARCHAR(50) NOT NULL,
    `last_name` VARCHAR(50) NULL,
    `password` VARCHAR(100) NULL,
    `sponsor_id` VARCHAR(20) NULL,
    `rank_id` INTEGER NULL,
    `aadhaar_no` VARCHAR(20) NULL,
    `father_name` VARCHAR(100) NULL,
    `address` VARCHAR(255) NULL,
    `city` VARCHAR(50) NULL,
    `state` VARCHAR(50) NULL,
    `country` VARCHAR(50) NULL,
    `marital_status` VARCHAR(20) NULL,
    `sex` VARCHAR(10) NULL,
    `email_id` VARCHAR(100) NULL,
    `mobile_no` VARCHAR(15) NULL,
    `postal_code` VARCHAR(10) NULL,
    `birthday` DATETIME NULL,
    `bank_name` VARCHAR(100) NULL,
    `branch` VARCHAR(100) NULL,
    `account_no` VARCHAR(30) NULL,
    `account_type` VARCHAR(20) NULL,
    `ifsc_code` VARCHAR(15) NULL,
    `pan_no` VARCHAR(15) NULL,
    `account_holder_name` VARCHAR(100) NULL,
    `nominee_name` VARCHAR(100) NULL,
    `nominee_relation` VARCHAR(30) NULL,
    `doj` DATETIME NULL,
    `paid_date` DATETIME NULL,
    `plan_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `status` INTEGER NOT NULL DEFAULT 0,
    `login_flag` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `tbl_members_regno_key`(`regno`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_pan_verification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `member_id` INTEGER NOT NULL,
    `pan_no` VARCHAR(15) NULL,
    `pan_image` VARCHAR(255) NULL,
    `status` ENUM('Pending', 'Verified', 'Cancelled') NOT NULL DEFAULT 'Pending',
    `verified_by` VARCHAR(50) NULL,
    `verified_date` DATETIME(3) NULL,

    UNIQUE INDEX `tbl_pan_verification_member_id_key`(`member_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_company_info` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_name` VARCHAR(150) NOT NULL,
    `address_line` VARCHAR(255) NULL,
    `city` VARCHAR(50) NULL,
    `state` VARCHAR(50) NULL,
    `pincode` VARCHAR(10) NULL,
    `email` VARCHAR(100) NULL,
    `customer_care_phone` VARCHAR(20) NULL,
    `website` VARCHAR(100) NULL,
    `gst_no` VARCHAR(20) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_shops` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `shop_name` VARCHAR(100) NOT NULL,
    `address` VARCHAR(255) NULL,
    `phone_no` VARCHAR(20) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_orders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` VARCHAR(20) NOT NULL,
    `regno` VARCHAR(20) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `shop_id` INTEGER NULL,
    `pv` DECIMAL(12, 2) NULL,
    `total_amount` DECIMAL(12, 2) NOT NULL,
    `bv` DECIMAL(12, 2) NULL,
    `sale_date` DATETIME(3) NOT NULL,
    `approved_status` INTEGER NOT NULL DEFAULT 0,
    `bill_path` VARCHAR(255) NULL,
    `ship_address` VARCHAR(255) NULL,
    `ship_city` VARCHAR(50) NULL,
    `ship_state` VARCHAR(50) NULL,
    `ship_pincode` VARCHAR(10) NULL,
    `ship_mobile` VARCHAR(15) NULL,
    `payment_mode` VARCHAR(30) NULL,
    `total_gst` DECIMAL(12, 2) NULL,
    `total_with_gst` DECIMAL(12, 2) NULL,
    `shipping_cost` DECIMAL(10, 2) NULL,
    `sub_total_amount` DECIMAL(12, 2) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `tbl_orders_order_id_key`(`order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_order_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER NOT NULL,
    `sl_no` INTEGER NOT NULL,
    `product_description` VARCHAR(255) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `offer_price` DECIMAL(10, 2) NOT NULL,
    `discount_percent` DECIMAL(5, 2) NOT NULL,
    `size` VARCHAR(20) NULL,
    `quantity` DECIMAL(10, 2) NOT NULL,
    `gross_amount` DECIMAL(12, 2) NOT NULL,
    `gst` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_downline_business` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `regno` VARCHAR(20) NOT NULL,
    `downline_regno` VARCHAR(20) NOT NULL,
    `business_amount` DECIMAL(12, 2) NULL,
    `from_date` DATE NULL,
    `to_date` DATE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_online_transactions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `regno` VARCHAR(20) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `mobile` VARCHAR(15) NULL,
    `amount_txn_id` VARCHAR(100) NOT NULL,
    `order_id` VARCHAR(30) NULL,
    `transaction_amount` DECIMAL(12, 2) NOT NULL,
    `txn_date` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tbl_online_transactions_amount_txn_id_key`(`amount_txn_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_payout` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `regno` VARCHAR(20) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `generation_bonus` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `level_bonus` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `total_amount` DECIMAL(12, 2) NOT NULL,
    `tds` DECIMAL(12, 2) NULL,
    `admin_charge` DECIMAL(12, 2) NULL,
    `net_amount` DECIMAL(12, 2) NOT NULL,
    `bank_name` VARCHAR(100) NULL,
    `account_no` VARCHAR(30) NULL,
    `ifsc_code` VARCHAR(15) NULL,
    `mobile` VARCHAR(15) NULL,
    `aadhaar_no` VARCHAR(20) NULL,
    `pan_no` VARCHAR(15) NULL,
    `payment_date` DATE NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_pin_plans` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `plan_name` VARCHAR(50) NOT NULL,
    `pin_value` DECIMAL(12, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_pins` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pin_sl_no` INTEGER NOT NULL,
    `pin_no` VARCHAR(30) NOT NULL,
    `plan_id` INTEGER NOT NULL,
    `pin_value` DECIMAL(12, 2) NOT NULL,
    `generated_date` DATE NOT NULL,
    `generated_by_admin_id` INTEGER NOT NULL,
    `transfer_status` BOOLEAN NOT NULL DEFAULT false,
    `used_status` BOOLEAN NOT NULL DEFAULT false,
    `active_status` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `tbl_pins_pin_sl_no_key`(`pin_sl_no`),
    UNIQUE INDEX `tbl_pins_pin_no_key`(`pin_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_pin_transfers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pin_id` INTEGER NOT NULL,
    `from_admin_id` INTEGER NOT NULL,
    `to_regno` VARCHAR(20) NOT NULL,
    `to_name` VARCHAR(100) NULL,
    `pin_type_value` DECIMAL(12, 2) NULL,
    `no_of_pins` INTEGER NULL,
    `transfer_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `tbl_pin_transfers_pin_id_key`(`pin_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_pin_usage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pin_id` INTEGER NOT NULL,
    `used_by_regno` VARCHAR(20) NOT NULL,
    `used_by_name` VARCHAR(100) NULL,
    `used_for_regno` VARCHAR(20) NOT NULL,
    `used_for_name` VARCHAR(100) NULL,
    `used_date` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tbl_pin_usage_pin_id_key`(`pin_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_admin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `password` VARCHAR(100) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_help_desk_messages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `regno` VARCHAR(20) NOT NULL,
    `subject` VARCHAR(150) NULL,
    `message` TEXT NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'Open',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_help_desk_replies` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `message_id` INTEGER NOT NULL,
    `admin_id` INTEGER NULL,
    `reply` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_dashboard_messages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `admin_id` INTEGER NULL,
    `message` TEXT NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tbl_members` ADD CONSTRAINT `tbl_members_rank_id_fkey` FOREIGN KEY (`rank_id`) REFERENCES `tbl_ranks`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_pan_verification` ADD CONSTRAINT `tbl_pan_verification_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `tbl_members`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_orders` ADD CONSTRAINT `tbl_orders_regno_fkey` FOREIGN KEY (`regno`) REFERENCES `tbl_members`(`regno`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_orders` ADD CONSTRAINT `tbl_orders_shop_id_fkey` FOREIGN KEY (`shop_id`) REFERENCES `tbl_shops`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_order_items` ADD CONSTRAINT `tbl_order_items_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `tbl_orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_downline_business` ADD CONSTRAINT `tbl_downline_business_regno_fkey` FOREIGN KEY (`regno`) REFERENCES `tbl_members`(`regno`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_downline_business` ADD CONSTRAINT `tbl_downline_business_downline_regno_fkey` FOREIGN KEY (`downline_regno`) REFERENCES `tbl_members`(`regno`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_online_transactions` ADD CONSTRAINT `tbl_online_transactions_regno_fkey` FOREIGN KEY (`regno`) REFERENCES `tbl_members`(`regno`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_payout` ADD CONSTRAINT `tbl_payout_regno_fkey` FOREIGN KEY (`regno`) REFERENCES `tbl_members`(`regno`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_pins` ADD CONSTRAINT `tbl_pins_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `tbl_pin_plans`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_pins` ADD CONSTRAINT `tbl_pins_generated_by_admin_id_fkey` FOREIGN KEY (`generated_by_admin_id`) REFERENCES `tbl_admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_pin_transfers` ADD CONSTRAINT `tbl_pin_transfers_pin_id_fkey` FOREIGN KEY (`pin_id`) REFERENCES `tbl_pins`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_pin_transfers` ADD CONSTRAINT `tbl_pin_transfers_from_admin_id_fkey` FOREIGN KEY (`from_admin_id`) REFERENCES `tbl_admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_pin_transfers` ADD CONSTRAINT `tbl_pin_transfers_to_regno_fkey` FOREIGN KEY (`to_regno`) REFERENCES `tbl_members`(`regno`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_pin_usage` ADD CONSTRAINT `tbl_pin_usage_pin_id_fkey` FOREIGN KEY (`pin_id`) REFERENCES `tbl_pins`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_pin_usage` ADD CONSTRAINT `tbl_pin_usage_used_by_regno_fkey` FOREIGN KEY (`used_by_regno`) REFERENCES `tbl_members`(`regno`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_pin_usage` ADD CONSTRAINT `tbl_pin_usage_used_for_regno_fkey` FOREIGN KEY (`used_for_regno`) REFERENCES `tbl_members`(`regno`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_help_desk_messages` ADD CONSTRAINT `tbl_help_desk_messages_regno_fkey` FOREIGN KEY (`regno`) REFERENCES `tbl_members`(`regno`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_help_desk_replies` ADD CONSTRAINT `tbl_help_desk_replies_message_id_fkey` FOREIGN KEY (`message_id`) REFERENCES `tbl_help_desk_messages`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_help_desk_replies` ADD CONSTRAINT `tbl_help_desk_replies_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `tbl_admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_dashboard_messages` ADD CONSTRAINT `tbl_dashboard_messages_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `tbl_admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
