-- ------------------------------------------------------------
-- Create Table
-- ------------------------------------------------------------
CREATE TABLE administrative_structure (
    id SERIAL UNIQUE PRIMARY KEY NOT NULL,
    data JSONB DEFAULT '{}'::jsonb NOT NULL,
    version INTEGER NOT NULL);


-- ------------------------------------------------------------
-- Add Version Initialization Trigger for all insert operations
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION initializeAdministrativeStructureVersion()
RETURNS "trigger" AS '
BEGIN
  New.version:=1;
  RETURN NEW;
END
'
LANGUAGE 'plpgsql' VOLATILE;

CREATE TRIGGER initializeAdministrativeStructureVersionTrigger
BEFORE INSERT
ON administrative_structure
FOR EACH ROW
EXECUTE PROCEDURE initializeAdministrativeStructureVersion();


-- ------------------------------------------------------------
-- Add Version Update Trigger for all update operations
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION incrementAdministrativeStructureVersion()
RETURNS "trigger" AS
'
BEGIN
  New.version:=Old.version + 1;
  RETURN NEW;
END
'
LANGUAGE 'plpgsql' VOLATILE;

CREATE TRIGGER incrementAdministrativeStructureVersionTrigger
BEFORE UPDATE
ON administrative_structure
FOR EACH ROW
EXECUTE PROCEDURE incrementAdministrativeStructureVersion();

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

INSERT INTO administrative_structure(data) VALUES('{"hierarchy": {"id": 1,"name": "First Administrative Structure Name"},"commissioner": {"id": null,"name": " Commissioner First Administrative Structure Name"},"responsible": {"id":null,"name": "Responsible First Administrative Structure Name"}}');
INSERT INTO administrative_structure(data) VALUES('{"hierarchy": {"id": 1,"name": "Second Administrative Structure Name"},"commissioner": {"id": null,"name": " Commissioner Second Administrative Structure Name"},"responsible": {"id":null,"name": "Responsible Second Administrative Structure Name"}}');
INSERT INTO administrative_structure(data) VALUES('{"hierarchy": {"id": 1,"name": "Third Administrative Structure Name"},"commissioner": {"id": null,"name": " Commissioner Third Administrative Structure Name"},"responsible": {"id":null,"name": "Responsible Third Administrative Structure Name"}}');