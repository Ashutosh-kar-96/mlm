UPDATE `tbl_ranks`
SET `base_rate` = 10.00
WHERE `percentage` = 10.00;

UPDATE `tbl_mlm_settings`
SET `value_json` = '[{"rankLabel":10,"baseRate":10,"monthlyCap":null},{"rankLabel":14,"baseRate":4,"monthlyCap":4500},{"rankLabel":19,"baseRate":9,"monthlyCap":9000},{"rankLabel":24,"baseRate":24,"monthlyCap":null},{"rankLabel":29,"baseRate":29,"monthlyCap":null},{"rankLabel":38,"baseRate":38,"monthlyCap":null},{"rankLabel":41,"baseRate":41,"monthlyCap":null}]',
    `description` = 'Rank differential unilevel compensation plan from Free Signup through Junior Sales Executive.'
WHERE `key_name` = 'commission_plan';
