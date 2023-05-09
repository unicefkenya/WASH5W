-- ------------------------------------------------------------
-- Create Table
-- ------------------------------------------------------------
CREATE TABLE administrative_hierarchy (
    id SERIAL UNIQUE PRIMARY KEY NOT NULL,
    data JSONB DEFAULT '{}'::jsonb NOT NULL,
    version INTEGER NOT NULL);


-- ------------------------------------------------------------
-- Add Version Initialization Trigger for all insert operations
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION initializeAdministrativeHierarchyVersion()
RETURNS "trigger" AS '
BEGIN
  New.version:=1;
  RETURN NEW;
END
'
LANGUAGE 'plpgsql' VOLATILE;

CREATE TRIGGER initializeAdministrativeHierarchyVersionTrigger
BEFORE INSERT
ON administrative_hierarchy
FOR EACH ROW
EXECUTE PROCEDURE initializeAdministrativeHierarchyVersion();


-- ------------------------------------------------------------
-- Add Version Update Trigger for all update operations
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION incrementAdministrativeHierarchyVersion()
RETURNS "trigger" AS
'
BEGIN
  New.version:=Old.version + 1;
  RETURN NEW;
END
'
LANGUAGE 'plpgsql' VOLATILE;

CREATE TRIGGER incrementAdministrativeHierarchyVersionTrigger
BEFORE UPDATE
ON administrative_hierarchy
FOR EACH ROW
EXECUTE PROCEDURE incrementAdministrativeHierarchyVersion();

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

INSERT INTO administrative_hierarchy(data) VALUES('{"type": {"id": 1},"commissioner": {"id": null,"name": "First Administrative Hierarchy Name"},"responsible": {"id": 1,"nameTwo": "First Administrative Hierarchy Name"}}');
INSERT INTO administrative_hierarchy(data) VALUES('{"type": {"id": 2},"commissioner": {"id": null,"name": "Second Administrative Hierarchy Name"},"responsible": {"id": 1,"nameTwo": "Second Administrative Hierarchy Name"}}');
INSERT INTO administrative_hierarchy(data) VALUES('{"type": {"id": 3},"commissioner": {"id": null,"name": "Third Administrative Hierarchy Name"},"responsible": {"id": 1,"nameTwo": null}}');