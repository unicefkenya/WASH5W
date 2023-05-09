-- ------------------------------------------------------------
-- Create Table
-- ------------------------------------------------------------
CREATE TABLE administrative_unit_type (
    id SERIAL UNIQUE PRIMARY KEY NOT NULL,
    data JSONB DEFAULT '{}'::jsonb NOT NULL,
    version INTEGER NOT NULL);


-- ------------------------------------------------------------
-- Add Version Initialization Trigger for all insert operations
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION initializeAdministrativeUnitTypeVersion()
RETURNS "trigger" AS '
BEGIN
  New.version:=1;
  RETURN NEW;
END
'
LANGUAGE 'plpgsql' VOLATILE;

CREATE TRIGGER initializeAdministrativeUnitTypeVersionTrigger
BEFORE INSERT
ON administrative_unit_type
FOR EACH ROW
EXECUTE PROCEDURE initializeAdministrativeUnitTypeVersion();


-- ------------------------------------------------------------
-- Add Version Update Trigger for all update operations
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION incrementAdministrativeUnitTypeVersion()
RETURNS "trigger" AS
'
BEGIN
  New.version:=Old.version + 1;
  RETURN NEW;
END
'
LANGUAGE 'plpgsql' VOLATILE;

CREATE TRIGGER incrementAdministrativeUnitTypeVersionTrigger
BEFORE UPDATE
ON administrative_unit_type
FOR EACH ROW
EXECUTE PROCEDURE incrementAdministrativeUnitTypeVersion();

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

INSERT INTO administrative_unit_type(data) VALUES('{"name":"First Administrative Unit Type Name","plural":"First Administrative Unit Type Plural"}');
INSERT INTO administrative_unit_type(data) VALUES('{"name":"Second Administrative Unit Type Name","plural":"Second Administrative Unit Type Plural"}');
INSERT INTO administrative_unit_type(data) VALUES('{"name":"Third Administrative Unit Type Name","plural":"Third Administrative Unit Type Plural"}');