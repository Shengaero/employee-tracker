CREATE TABLE IF NOT EXISTS departments_table(
    id      INT         NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name    VARCHAR(30) NOT NULL
);

CREATE TABLE IF NOT EXISTS roles_table(
    id              INT         NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(30) NOT NULL,
    salery          DECIMAL     NOT NULL,
    department_id   INT         NOT NULL,

    FOREIGN KEY (department_id)         -- Creates a foreign key relating department_id to departments_table.id
    REFERENCES departments_table(id)    -- Upon deletion of the departments_table.id, this will cascade into the
        ON DELETE CASCADE               -- deletion of the deletion of the representing row here as well
);

CREATE TABLE IF NOT EXISTS employees_table(
    id          INT         NOT NULL AUTO_INCREMENT PRIMARY KEY,
    first_name  VARCHAR(30) NOT NULL,
    last_name   VARCHAR(30) NOT NULL,
    role_id     INT         NOT NULL,
    manager_id  INT         DEFAULT NULL,

    FOREIGN KEY (role_id)               -- Creates a foreign key relating role_id to roles_table.id
    REFERENCES  roles_table(id)         -- Upon deletion of the roles_table.id this will cascade into
        ON DELETE CASCADE,              -- deletion of the representing row here as well

    FOREIGN KEY (manager_id)            -- Creates a foreign key relating manager_id to id
    REFERENCES  employees_table(id)     -- Upon deletion of the id, this will cascade into the
        ON DELETE SET NULL              -- manager_id being set to null here
);
