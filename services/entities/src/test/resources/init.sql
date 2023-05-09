-- ------------------------------------------------------------
-- Create Table
-- ------------------------------------------------------------
CREATE TABLE entity (
    id SERIAL UNIQUE PRIMARY KEY NOT NULL,
    data JSONB DEFAULT '{}'::jsonb NOT NULL,
    version INTEGER NOT NULL);


-- ------------------------------------------------------------
-- Add Version Initialization Trigger for all insert operations
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION initializeEntityVersion()
RETURNS "trigger" AS '
BEGIN
  New.version:=1;
  RETURN NEW;
END
'
LANGUAGE 'plpgsql' VOLATILE;

CREATE TRIGGER initializeEntityVersionTrigger
BEFORE INSERT
ON entity
FOR EACH ROW
EXECUTE PROCEDURE initializeEntityVersion();


-- ------------------------------------------------------------
-- Add Version Update Trigger for all update operations
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION incrementEntityVersion()
RETURNS "trigger" AS
'
BEGIN
  New.version:=Old.version + 1;
  RETURN NEW;
END
'
LANGUAGE 'plpgsql' VOLATILE;

CREATE TRIGGER incrementEntityVersionTrigger
BEFORE UPDATE
ON entity
FOR EACH ROW
EXECUTE PROCEDURE incrementEntityVersion();

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

INSERT INTO entity(data) VALUES('{"index": 1, "name": "First Entity", "valid": true, "types": [1], "groups": [1], "roles": [1], "levels": [1], "statuses": [1], "locations": [1]}');
INSERT INTO entity(data) VALUES('{"index": 2, "name": "Second Entity", "valid": true, "types": [2], "groups": [2], "roles": [2], "levels": [2], "statuses": [2], "locations": [2]}');
INSERT INTO entity(data) VALUES('{"index": 3, "name": "Third Entity", "valid": false, "types": [3], "groups": [3], "roles": [3], "levels": [3], "statuses": [3], "locations": [3]}');