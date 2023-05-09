-- ------------------------------------------------------------
-- Create Table
-- ------------------------------------------------------------
CREATE TABLE accountability_type (
    id SERIAL UNIQUE PRIMARY KEY NOT NULL,
    data JSONB NOT NULL,
    version INTEGER NOT NULL);


-- ------------------------------------------------------------
-- Add Version Initialization Trigger for all insert operations
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION initializeAccountabilityTypeVersion()
RETURNS "trigger" AS '
BEGIN
  New.version:=1;
  RETURN NEW;
END
'
LANGUAGE 'plpgsql' VOLATILE;

CREATE TRIGGER initializeAccountabilityTypeVersionTrigger
BEFORE INSERT
ON accountability_type
FOR EACH ROW
EXECUTE PROCEDURE initializeAccountabilityTypeVersion();


-- ------------------------------------------------------------
-- Add Version Update Trigger for all update operations
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION incrementAccountabilityTypeVersion()
RETURNS "trigger" AS
'
BEGIN
  New.version:=Old.version + 1;
  RETURN NEW;
END
'
LANGUAGE 'plpgsql' VOLATILE;

CREATE TRIGGER incrementAccountabilityTypeVersionTrigger
BEFORE UPDATE
ON accountability_type
FOR EACH ROW
EXECUTE PROCEDURE incrementAccountabilityTypeVersion();

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

INSERT INTO accountability_type(data) VALUES('{"hierarchy": {"id": 1}, "commissioner": {"id": 10, "name": "Tenth"}, "responsible": {"id": 100, "name": "One Hundredth"}}');
INSERT INTO accountability_type(data) VALUES('{"hierarchy": {"id": 2}, "commissioner": {"id": 20, "name": "Twentieth"}, "responsible": {"id": 200, "name": "Two Hundredth"}}');
INSERT INTO accountability_type(data) VALUES('{"hierarchy": {"id": 3}, "commissioner": {"id": 30, "name": "Thirtieth"}, "responsible": {"id": 300, "name": "Three Hundredth"}}');
INSERT INTO accountability_type(data) VALUES('{"hierarchy": {"id": 3}, "commissioner": {"id": 300, "name": "Three Hundredth"}, "responsible": {"id": 3000, "name": "Three Thousandth"}}');
INSERT INTO accountability_type(data) VALUES('{"hierarchy": {"id": 3}, "commissioner": {"id": 3000, "name": "Three Thousandth"}, "responsible": {"id": 30000, "name": "Thirty Thousandth"}}');

-- See: https://newbedev.com/postgres-jsonb-set-multiple-keys-update
-- UPDATE accountability_type SET data = jsonb_set(data, '{responsible}', data -> 'responsible' || '{"name": "30th"}') WHERE data -> 'responsible' ->> 'id' = '30'
-- UPDATE accountability_type SET data = jsonb_set(data, '{commissioner}', data -> 'commissioner' || '{"name": "30th"}') WHERE data -> 'commissioner' ->> 'id' = '30'
