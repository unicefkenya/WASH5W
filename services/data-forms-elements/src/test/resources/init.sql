-- ------------------------------------------------------------
-- Create Table
-- ------------------------------------------------------------
CREATE TABLE data_form_element_ (
    id SERIAL UNIQUE PRIMARY KEY NOT NULL,
    data JSONB DEFAULT '{}'::jsonb NOT NULL,
    version INTEGER NOT NULL);


-- ------------------------------------------------------------
-- Add Version Initialization Trigger for all insert operations
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION initializeDataFormElementVersion()
RETURNS "trigger" AS '
BEGIN
  New.version:=1;
  RETURN NEW;
END
'
LANGUAGE 'plpgsql' VOLATILE;

CREATE TRIGGER initializeDataFormElementVersionTrigger
BEFORE INSERT
ON data_form_element_
FOR EACH ROW
EXECUTE PROCEDURE initializeDataFormElementVersion();


-- ------------------------------------------------------------
-- Add Version Update Trigger for all update operations
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION incrementDataFormElementVersion()
RETURNS "trigger" AS
'
BEGIN
  New.version:=Old.version + 1;
  RETURN NEW;
END
'
LANGUAGE 'plpgsql' VOLATILE;

CREATE TRIGGER incrementDataFormElementVersionTrigger
BEFORE UPDATE
ON data_form_element_
FOR EACH ROW
EXECUTE PROCEDURE incrementDataFormElementVersion();

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

INSERT INTO data_form_element_(data) VALUES('{"contextId": 1,"dataFormId": 1,"categoryId": 1,"typeId": 1,"layoutId": 1,"index": null,"code": null,"titled": true,"title": "First Title","described": true,"description": "First Description","conditionallyRelevant": false,"conditionalRelevancyRule": null,"repeated": false,"repeatabilityRule": {},"validated": null,"validationRules": null,"reserved": null,"hidden": null,"required": null,"options": null}');
INSERT INTO data_form_element_(data) VALUES('{"contextId": 2,"dataFormId": 2,"categoryId": 2,"typeId": 2,"layoutId": 2,"index": null,"code": null,"titled": true,"title": "Second Title","described": true,"description": "Second Description","conditionallyRelevant": false,"conditionalRelevancyRule": null,"repeated": false,"repeatabilityRule": {},"validated": null,"validationRules": null,"reserved": null,"hidden": null,"required": null,"options": null}');
INSERT INTO data_form_element_(data) VALUES('{"contextId": 3,"dataFormId": 3,"categoryId": 3,"typeId": 3,"layoutId": 3,"index": null,"code": null,"titled": true,"title": "Third Title","described": true,"description": "Third Description","conditionallyRelevant": false,"conditionalRelevancyRule": null,"repeated": false,"repeatabilityRule": {},"validated": null,"validationRules": null,"reserved": null,"hidden": null,"required": null,"options": null}');