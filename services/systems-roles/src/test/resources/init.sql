-- ------------------------------------------------------------
-- Create Table
-- ------------------------------------------------------------
CREATE TABLE system_role (
    id SERIAL UNIQUE PRIMARY KEY NOT NULL,
    data JSONB DEFAULT '{}'::jsonb NOT NULL,
    version INTEGER NOT NULL);


-- ------------------------------------------------------------
-- Add Version Initialization Trigger for all insert operations
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION initializeSystemRoleVersion()
RETURNS "trigger" AS '
BEGIN
  New.version:=1;
  RETURN NEW;
END
'
LANGUAGE 'plpgsql' VOLATILE;

CREATE TRIGGER initializeSystemRoleVersionTrigger
BEFORE INSERT
ON system_role
FOR EACH ROW
EXECUTE PROCEDURE initializeSystemRoleVersion();


-- ------------------------------------------------------------
-- Add Version Update Trigger for all update operations
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION incrementSystemRoleVersion()
RETURNS "trigger" AS
'
BEGIN
  New.version:=Old.version + 1;
  RETURN NEW;
END
'
LANGUAGE 'plpgsql' VOLATILE;

CREATE TRIGGER incrementSystemRoleVersionTrigger
BEFORE UPDATE
ON system_role
FOR EACH ROW
EXECUTE PROCEDURE incrementSystemRoleVersion();

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
-- -------------------------------------------------------------- ------------------------------------------------------------

INSERT INTO system_role(data) VALUES('{"code":"firstSystemRolesCode","name":"First System Roles Name","description":"First System Roles Description","permissions": ["First System Roles Permissions"],"customisable":false}');
INSERT INTO system_role(data) VALUES('{"code":"secondSystemRolesCode","name":"Second System Roles Name","description":"Second System Roles Description","permissions":["Second System Roles Permissions"],"customisable":false}');
INSERT INTO system_role(data) VALUES('{"code":"thirdSystemRolesCode","name":"Third System Roles Name","description":"Third System Roles Description","permissions": ["Third System Roles Permissions"],"customisable":false}');