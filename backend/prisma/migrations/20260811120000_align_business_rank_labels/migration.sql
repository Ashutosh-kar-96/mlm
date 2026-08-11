UPDATE `tbl_ranks`
SET `rank_name` = 'Free Signup',
    `percentage` = 10.00,
    `base_rate` = 0.00
WHERE `id` = 8;

UPDATE `tbl_ranks`
SET `rank_name` = 'Fashion Influencer',
    `percentage` = 14.00
WHERE `id` = 1;

UPDATE `tbl_ranks`
SET `rank_name` = 'Vision Influencer',
    `percentage` = 19.00
WHERE `id` = 2;

UPDATE `tbl_ranks`
SET `rank_name` = 'Promoter',
    `percentage` = 24.00
WHERE `id` = 3;

UPDATE `tbl_ranks`
SET `rank_name` = 'Sales Executive',
    `percentage` = 29.00
WHERE `id` = 4;

UPDATE `tbl_ranks`
SET `rank_name` = 'Junior Sales Executive',
    `percentage` = 38.00
WHERE `id` = 5;

UPDATE `tbl_ranks`
SET `rank_name` = 'Senior Sales Executive',
    `percentage` = 41.00
WHERE `id` = 6;

UPDATE `tbl_ranks`
SET `rank_name` = 'Zonal Sales Executive',
    `percentage` = 42.00
WHERE `id` = 7;

UPDATE `tbl_mlm_settings`
SET `value_json` = '[{"rankLabel":10,"baseRate":0,"monthlyCap":null},{"rankLabel":14,"baseRate":4,"monthlyCap":4500},{"rankLabel":19,"baseRate":9,"monthlyCap":9000},{"rankLabel":24,"baseRate":24,"monthlyCap":null},{"rankLabel":29,"baseRate":29,"monthlyCap":null},{"rankLabel":38,"baseRate":38,"monthlyCap":null},{"rankLabel":41,"baseRate":41,"monthlyCap":null}]',
    `description` = 'Rank differential unilevel compensation plan from Free Signup through Junior Sales Executive.'
WHERE `key_name` = 'commission_plan';
