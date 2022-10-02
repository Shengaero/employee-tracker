USE employees_db;

INSERT INTO departments_table(name)
    VALUES  ("Software");

INSERT INTO roles_table(title, salery, department_id) 
    VALUES  ("Project Manager", 100000, 1),
            ("Developer",       80000,  1),
            ("Intern",          0,      1);

INSERT INTO employees_table(first_name, last_name, role_id, manager_id)
    VALUES  ("John",    "Smith",    1,  NULL),
            ("Jane",    "Goodman",  2,  1),
            ("Will",    "Park",     2,  1),
            ("Lisa",    "Johnson",  2,  1),
            ("Chris",   "Walker",   3,  1);
