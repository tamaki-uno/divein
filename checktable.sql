-- check table structure and first 5 rows
-- Usage: \i checktable.sql <table_name>

SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = DATABASE() AND
    table_name = @table_name
ORDER BY
    ordinal_position;

SELECT
    *
FROM
    @table_name
LIMIT 5;
SET @table_name = 'user'; -- Change this to the table you want to check
SET @table_name = 'records'; -- Change this to the table you want to check


