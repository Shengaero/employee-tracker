USE employees_db;

INSERT INTO departments_table(name) VALUES ("employee-tracker-project");

INSERT INTO roles_table(title, salery, department_id) 
    SELECT "employee-tracker", 0.00, id
    FROM departments_table WHERE name = "employee-tracker-project";

INSERT INTO employees_table(first_name, last_name, role_id)
    SELECT "John", "Smith", id
    FROM roles_table WHERE title = "employee-tracker";

INSERT INTO employees_table(first_name, last_name, role_id, manager_id)
    SELECT "Kaidan", "Gustave", id, 1
    FROM roles_table WHERE title = "employee-tracker";
