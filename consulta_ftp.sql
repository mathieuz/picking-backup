SELECT TOP (1000) [id]
      ,[technical_sheet_id]
      ,[attribute_id]
      ,[value_string]
      ,[value_number]
      ,[value_boolean]
      ,[value_date]
      ,[value_list]
      ,[record_access_key]
      ,[user_id_insert]
      ,[date_insert]
      ,[user_id_update]
      ,[date_update]
      ,[access_key]
      ,[flag_integration]
      ,[value_multiple]
  FROM [datadriven_paranoa].[dbo].[dw_attribute_values]
  where [technical_sheet_id] = 121
  --where attribute_id in (2118, 2119)





DECLARE @ficha_tecnica_id INT = 121;

SELECT 
	a.title
	,CASE 
		WHEN a.[type] = 'STRING' THEN av.[value_string]
		WHEN a.[type] = 'NUMBER' THEN CONVERT(VARCHAR(50), av.[value_number])
		WHEN a.[type] = 'BOOLEAN' THEN  CONVERT(VARCHAR(50), av.[value_boolean])
		WHEN a.[type] = 'DATE' THEN  CONVERT(VARCHAR(50), av.[value_date])
		ELSE av.[value_list]
	END AS valor
	,av.record_access_key
FROM [datadriven_paranoa].[dbo].[dw_attribute_values] av
INNER JOIN dbo.dw_attribute a
	ON a.id = av.attribute_id
WHERE technical_sheet_id = @ficha_tecnica_id
ORDER BY  av.record_access_key, title