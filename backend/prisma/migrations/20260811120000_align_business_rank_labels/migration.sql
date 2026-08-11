INSERT INTO `tbl_ranks`
  (`id`, `rank_name`, `criteria_bv`, `level_no`, `percentage`, `base_rate`, `monthly_cap`, `self_shopping_amount`, `challenge_business_bv`, `challenge_months`)
VALUES
  (8, 'Free Signup', 0.00, 0, 10.00, 0.00, NULL, 0.00, NULL, NULL),
  (1, 'Fashion Influencer', 4500.00, 1, 14.00, 4.00, 4500.00, 4500.00, NULL, NULL),
  (2, 'Vision Influencer', 9000.00, 2, 19.00, 9.00, 9000.00, 9000.00, NULL, NULL),
  (3, 'Promoter', 22500.00, 3, 24.00, 24.00, NULL, 22500.00, NULL, NULL),
  (4, 'Sales Executive', 38000.00, 4, 29.00, 29.00, NULL, 38000.00, NULL, NULL),
  (5, 'Junior Sales Executive', 0.00, 5, 38.00, 38.00, NULL, 0.00, NULL, NULL),
  (6, 'Senior Sales Executive', 0.00, 6, 41.00, NULL, NULL, 0.00, NULL, NULL),
  (7, 'Zonal Sales Executive', 0.00, 7, 42.00, NULL, NULL, 0.00, NULL, NULL)
ON DUPLICATE KEY UPDATE
  `rank_name` = VALUES(`rank_name`),
  `criteria_bv` = VALUES(`criteria_bv`),
  `level_no` = VALUES(`level_no`),
  `percentage` = VALUES(`percentage`),
  `base_rate` = VALUES(`base_rate`),
  `monthly_cap` = VALUES(`monthly_cap`),
  `self_shopping_amount` = VALUES(`self_shopping_amount`),
  `challenge_business_bv` = VALUES(`challenge_business_bv`),
  `challenge_months` = VALUES(`challenge_months`);

UPDATE `tbl_mlm_settings`
SET `value_json` = '[{"rankLabel":10,"baseRate":0,"monthlyCap":null},{"rankLabel":14,"baseRate":4,"monthlyCap":4500},{"rankLabel":19,"baseRate":9,"monthlyCap":9000},{"rankLabel":24,"baseRate":24,"monthlyCap":null},{"rankLabel":29,"baseRate":29,"monthlyCap":null},{"rankLabel":38,"baseRate":38,"monthlyCap":null},{"rankLabel":41,"baseRate":41,"monthlyCap":null}]',
    `description` = 'Rank differential unilevel compensation plan from Free Signup through Junior Sales Executive.'
WHERE `key_name` = 'commission_plan';
