-- ------------------------------------------------------------
-- Create Table
-- ------------------------------------------------------------
CREATE TABLE entity_type (
    id SERIAL UNIQUE PRIMARY KEY NOT NULL,
    data JSONB DEFAULT '{}'::jsonb NOT NULL,
    version INTEGER NOT NULL);


-- ------------------------------------------------------------
-- Add Version Initialization Trigger for all insert operations
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION initializeEntityTypeVersion()
RETURNS "trigger" AS '
BEGIN
  New.version:=1;
  RETURN NEW;
END
'
LANGUAGE 'plpgsql' VOLATILE;

CREATE TRIGGER initializeEntityTypeVersionTrigger
BEFORE INSERT
ON entity_type
FOR EACH ROW
EXECUTE PROCEDURE initializeEntityTypeVersion();


-- ------------------------------------------------------------
-- Add Version Update Trigger for all update operations
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION incrementEntityTypeVersion()
RETURNS "trigger" AS
'
BEGIN
  New.version:=Old.version + 1;
  RETURN NEW;
END
'
LANGUAGE 'plpgsql' VOLATILE;

CREATE TRIGGER incrementEntityTypeVersionTrigger
BEFORE UPDATE
ON entity_type
FOR EACH ROW
EXECUTE PROCEDURE incrementEntityTypeVersion();

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

INSERT INTO entity_type(data) VALUES('{"contextId": 1,"name": "First Entity Type Name","plural": "First Entity Type Names","optionsTypesIds": [9]}');
INSERT INTO entity_type(data) VALUES('{"contextId": 1,"name": "Second Entity Type Name","plural": "Second Entity Type Names","optionsTypesIds": [9]}');
INSERT INTO entity_type(data) VALUES('{"contextId": 1,"name": "Third Entity Type Name","plural": "Third Entity Type Names","optionsTypesIds": [9]}');