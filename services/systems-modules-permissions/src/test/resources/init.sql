-- ------------------------------------------------------------
-- Create Table
-- ------------------------------------------------------------
CREATE TABLE system_module_permission (
    id SERIAL UNIQUE PRIMARY KEY NOT NULL,
    data JSONB DEFAULT '{}'::jsonb NOT NULL,
    version INTEGER NOT NULL);


-- ------------------------------------------------------------
-- Add Version Initialization Trigger for all insert operations
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION initializeSystemModulePermissionVersion()
RETURNS "trigger" AS '
BEGIN
  New.version:=1;
  RETURN NEW;
END
'
LANGUAGE 'plpgsql' VOLATILE;

CREATE TRIGGER initializeSystemModulePermissionVersionTrigger
BEFORE INSERT
ON system_module_permission
FOR EACH ROW
EXECUTE PROCEDURE initializeSystemModulePermissionVersion();


-- ------------------------------------------------------------
-- Add Version Update Trigger for all update operations
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION incrementSystemModulePermissionVersion()
RETURNS "trigger" AS
'
BEGIN
  New.version:=Old.version + 1;
  RETURN NEW;
END
'
LANGUAGE 'plpgsql' VOLATILE;

CREATE TRIGGER incrementSystemModulePermissionVersionTrigger
BEFORE UPDATE
ON system_module_permission
FOR EACH ROW
EXECUTE PROCEDURE incrementSystemModulePermissionVersion();

-- ------------------------------------------------------------
-- Add query estimates retrieval function
-- See:
-- https://abrisplatform.com/articles/effective-pagination-of-postgresql-data-in-the-user-interface/
-- https://stackoverflow.com/questions/67282699/how-do-i-process-execution-plan-in-postgresql
-- https://medium.com/geekculture/how-to-read-postgresql-query-plan-df4b158781a1
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION getQueryEstimates(p_sql TEXT)
RETURNS TEXT AS '
DECLARE
  query_result jsonb;
  total_cost decimal;
  output_rows integer;
BEGIN
  EXECUTE ''EXPLAIN (FORMAT JSON) '' || p_sql INTO query_result;
  total_cost := query_result->0->''Plan''->''Total Cost'';
  output_rows := query_result->0->''Plan''->''Plan Rows'';
  RETURN CONCAT(''{"cost": '', total_cost, '', "rows": '', output_rows,''}'');
END;
'
LANGUAGE 'plpgsql' VOLATILE;


-- ------------------------------------------------------------
-- Add Some dummy data
-- ------------------------------------------------------------

INSERT INTO system_module_permission(data) VALUES('{"systemModuleId":1,"code":"firstSystemModulePermissionCode","name":"First System Module Permission Name","description":"First System Module Permission Description","custom":false}');
INSERT INTO system_module_permission(data) VALUES('{"systemModuleId":2,"code":"secondSystemModulePermissionCode","name":"Second System Module Permission Name","description":"Second System Module Permission Description","custom":false}');
INSERT INTO system_module_permission(data) VALUES('{"systemModuleId":3,"code":"thirdSystemModulePermissionCode","name":"Third System Module Permission Name","description":"Third System Module Permission Description","custom":false}');