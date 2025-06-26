-- テーブル構造と最初の5行を確認する
-- テーブル名は直接書き換えてください

-- 例: user テーブルの場合
PRAGMA table_info(user);

SELECT * FROM user LIMIT 5;

-- 例: records テーブルの場合
-- PRAGMA table_info(records);
-- SELECT * FROM records LIMIT 5;

-- 必要に応じて上記のコメントアウトを切り替えてください
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


