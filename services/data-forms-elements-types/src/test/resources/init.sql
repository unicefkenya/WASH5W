-- ------------------------------------------------------------
-- Create Table
-- ------------------------------------------------------------
CREATE TABLE data_form_element_type (
    id SERIAL UNIQUE PRIMARY KEY NOT NULL,
    data JSONB DEFAULT '{}'::jsonb NOT NULL,
    version INTEGER NOT NULL);


-- ------------------------------------------------------------
-- Add Version Initialization Trigger for all insert operations
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION initializeDataFormElementTypeVersion()
RETURNS "trigger" AS '
BEGIN
  New.version:=1;
  RETURN NEW;
END
'
LANGUAGE 'plpgsql' VOLATILE;

CREATE TRIGGER initializeDataFormElementTypeVersionTrigger
BEFORE INSERT
ON data_form_element_type
FOR EACH ROW
EXECUTE PROCEDURE initializeDataFormElementTypeVersion();


-- ------------------------------------------------------------
-- Add Version Update Trigger for all update operations
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION incrementDataFormElementTypeVersion()
RETURNS "trigger" AS
'
BEGIN
  New.version:=Old.version + 1;
  RETURN NEW;
END
'
LANGUAGE 'plpgsql' VOLATILE;

CREATE TRIGGER incrementDataFormElementTypeVersionTrigger
BEFORE UPDATE
ON data_form_element_type
FOR EACH ROW
EXECUTE PROCEDURE incrementDataFormElementTypeVersion();

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

INSERT INTO data_form_element_type(data) VALUES('{"categoryId":1,"name":"First Data Form Element Type Name","icon": "arrow-right","operators": []}');
INSERT INTO data_form_element_type(data) VALUES('{"categoryId":1,"name":"Second Data Form Element Type Name","icon": "arrow-right","operators": []}');
INSERT INTO data_form_element_type(data) VALUES('{"categoryId":1,"name":"Third Data Form Element Type Name","icon": "arrow-right","operators": []}');