ALTER TABLE `tbl_orders`
  ADD COLUMN `delivery_status` VARCHAR(30) NOT NULL DEFAULT 'Pending';
