USE employees_db;

INSERT INTO departments_table(name)
    VALUES  ("Software"),
            ("Marketing");

INSERT INTO roles_table(title, salery, department_id) 
    VALUES  ("Project Manager",         100000, 1),
            ("Developer",               80000,  1),
            ("Software Intern",         0,      1),
            ("Community Manager",       76000,  2),
            ("Asset Developer",         60000,  2),
            ("Communications Expert",   70000,  2);

INSERT INTO employees_table(first_name, last_name, role_id, manager_id)
    VALUES  ("John",    "Smith",    1,  NULL),
            ("Jane",    "Goodman",  2,  1),
            ("Will",    "Park",     2,  1),
            ("Chris",   "Walker",   3,  1),
            ("Lisa",    "Johnson",  4,  NULL),
            ("Wendy",   "Marcus",   4,  NULL),
            ("Ryan",    "Hunter",   5,  5),
            ("Joseph",  "Derick",   5,  6),
            ("Nolan",   "Worth",    6,  NULL);
