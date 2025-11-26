import { MigrationType } from "./types";

// Using the coding optimized model
export const GEMINI_MODEL = "gemini-3-pro-preview";

export const DEFAULT_ORACLE_CODE = `CREATE TABLE employees (
    employee_id NUMBER(6),
    first_name VARCHAR2(20),
    last_name VARCHAR2(25) CONSTRAINT emp_last_name_nn NOT NULL,
    email VARCHAR2(25) CONSTRAINT emp_email_nn NOT NULL,
    phone_number VARCHAR2(20),
    hire_date DATE DEFAULT SYSDATE,
    job_id VARCHAR2(10) CONSTRAINT emp_job_nn NOT NULL,
    salary NUMBER(8,2),
    commission_pct NUMBER(2,2),
    manager_id NUMBER(6),
    department_id NUMBER(4),
    CONSTRAINT emp_salary_min CHECK (salary > 0), 
    CONSTRAINT emp_email_uk UNIQUE (email)
);

CREATE SEQUENCE emp_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER emp_insert_trg
BEFORE INSERT ON employees
FOR EACH ROW
BEGIN
  SELECT emp_seq.NEXTVAL INTO :new.employee_id FROM dual;
END;
/`;

export const SYSTEM_INSTRUCTION = `You are an expert Senior Database Reliability Engineer and Migration Architect specializing in Oracle to PostgreSQL migrations (similar to the ora2pg tool).

Your goal is to strictly translate Oracle SQL, PL/SQL, DDL, and DML into valid, optimized PostgreSQL code.

Follow these rules:
1. DATA TYPES: Map Oracle types to Postgres types (e.g., VARCHAR2 -> VARCHAR, NUMBER -> NUMERIC/INTEGER, DATE -> TIMESTAMP, BLOB -> BYTEA).
2. FUNCTIONS: Convert NVL -> COALESCE, SYSDATE -> CURRENT_TIMESTAMP, DECODE -> CASE WHEN.
3. PL/SQL: Convert PL/SQL blocks to PL/pgSQL. Handle variable declarations, cursors, and loops appropriately.
4. SEQUENCES: Convert Oracle sequence syntax (NEXTVAL) to Postgres syntax (nextval()).
5. TRIGGERS: Adjust trigger syntax. Note that Postgres triggers execute a function.
6. IDENTIFIERS: Keep identifiers case-insensitive (lowercase) unless quoted.
7. COMPATIBILITY: If a direct equivalent doesn't exist, provide a workaround or a comment explaining the limitation.
8. OUTPUT: Return ONLY the SQL code. Do not include markdown backticks like \`\`\`sql.
`;

export const MIGRATION_LABELS: Record<MigrationType, string> = {
  [MigrationType.SCHEMA]: "Table/Schema DDL",
  [MigrationType.FUNCTION]: "Stored Procedure/Function",
  [MigrationType.QUERY]: "Ad-hoc SQL Query",
  [MigrationType.FULL_PACKAGE]: "Full Package (PL/SQL)",
};