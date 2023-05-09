-- ------------------------------------------------------------
-- Create Table
-- ------------------------------------------------------------
CREATE TABLE logical_element (
    id SERIAL UNIQUE PRIMARY KEY NOT NULL,
    data JSONB NOT NULL,
    version INTEGER NOT NULL);


-- ------------------------------------------------------------
-- Add Version Initialization Trigger for all insert operations
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION initializeLogicalElementVersion()
RETURNS "trigger" AS '
BEGIN
  New.version:=1;
  RETURN NEW;
END
'
LANGUAGE 'plpgsql' VOLATILE;

CREATE TRIGGER initializeLogicalElementVersionTrigger
BEFORE INSERT
ON logical_element
FOR EACH ROW
EXECUTE PROCEDURE initializeLogicalElementVersion();


-- ------------------------------------------------------------
-- Add Version Update Trigger for all update operations
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION incrementLogicalElementVersion()
RETURNS "trigger" AS
'
BEGIN
  New.version:=Old.version + 1;
  RETURN NEW;
END
'
LANGUAGE 'plpgsql' VOLATILE;

CREATE TRIGGER incrementLogicalElementVersionTrigger
BEFORE UPDATE
ON logical_element
FOR EACH ROW
EXECUTE PROCEDURE incrementLogicalElementVersion();

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