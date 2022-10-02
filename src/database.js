const mysql = require('mysql2/promise');

const Department = require('../lib/Department');
const Employee = require('../lib/Employee');
const Role = require('../lib/Role');

const { readResource } = require('./util');

let _started = false;
let _connection = null;
const _cache = {
    /** @type {Array<Department>} */
    departments: [],
    /** @type {Array<Role>} */
    roles: [],
    /** @type {Array<Employee>} */
    employees: []
};

const databaseName = 'employees_db';
const connectOptions = {
    host: 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASS || 'root',
    multipleStatements: true
};

const preventManualSetting = (prop) => {
    throw new Error(`"${prop}" property cannot be set!`);
};

class Database {
    /** @type {mysql.Connection} */
    get conn() {
        return _connection;
    }
    /** @type {Array<Department>} */
    get departments() {
        return Array.from(_cache.departments);
    }
    /** @type {Array<Role>} */
    get roles() {
        return Array.from(_cache.roles);
    }
    /** @type {Array<Employee>} */
    get employees() {
        return Array.from(_cache.employees);
    }
    /** @type {Boolean} */
    get isClosed() {
        return !_started;
    }

    set conn(_) {
        preventManualSetting('conn');
    }
    set departments(_) {
        preventManualSetting('departments');
    }
    set roles(_) {
        preventManualSetting('roles');
    }
    set employees(_) {
        preventManualSetting('employees');
    }
    set isClosed(_) {
        preventManualSetting('isClosed');
    }

    /**
     * Gets a Department by ID, or `null` if one isn't found with the specified ID.
     * 
     * @param {Number} id the ID to search for
     * @returns {Department|null} the Department found, or `null` if none was found
     */
    getDepartmentById(id) {
        const found = _cache.departments.find(department => department.id === parseInt(id));    // try to find a department with a matching ID
        if(found)                                                                               // if one was found
            return found;                                                                           // return it
        return null;                                                                            // otherwise return null
    }

    /**
     * Gets a Role by ID, or `null` if one isn't found with the specified ID.
     * 
     * @param {Number} id the ID to search for
     * @returns {Role|null} the Role found, or `null` if none was found
     */
    getRoleById(id) {
        const found = _cache.roles.find(role => role.id === parseInt(id));      // try to find a role with a matching ID
        if(found)                                                               // if one was found
            return found;                                                           // return it
        return null;                                                            // otherwise return null
    }

    /**
     * Gets a Employee by ID, or `null` if one isn't found with the specified ID.
     * 
     * @param {Number} id the ID to search for
     * @returns {Employee|null} the Employee found, or `null` if none was found
     */
    getEmployeeById(id) {
        const found = _cache.employees.find(employee => employee.id === parseInt(id));      // try to find an employee with a matching ID
        if(found)                                                                           // if one was found
            return found;                                                                       // return it
        return null;                                                                        // otherwise return null
    }

    /**
     * Adds a Department to the Database.
     * 
     * @param {Department} department the Department to add
     */
    async addDepartment(department) {
        // execute prepared insert statement
        const [rows] = await this.conn.execute(
            'INSERT INTO departments_table(name) VALUES (?);',
            [department.name]
        );
        // set department ID to the one sent back by the insert
        department.id = rows.insertId;
        // push to cache
        _cache.departments.push(department);
    }

    /**
     * Adds a Role to the Database.
     * 
     * @param {Role} role the Role to add
     */
    async addRole(role) {
        // execute prepared insert statement
        const [rows] = await this.conn.execute(
            'INSERT INTO roles_table(title, salery, department_id) VALUES (?, ?, ?);',
            [role.title, role.salary, role.departmentId]
        );
        // set role ID to the one sent back by the insert
        role.id = rows.insertId;
        // push to cache
        _cache.roles.push(role);
    }

    /**
     * Adds a Employee to the Database.
     * 
     * @param {Employee} employee the Employee to add
     */
    async addEmployee(employee) {
        // execute prepared insert statement
        const [rows] = await this.conn.execute(
            'INSERT INTO employees_table(first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?);',
            [employee.firstName, employee.lastName, employee.roleId, employee.managerId]
        );
        // set employee ID to the one sent back by the insert
        employee.id = rows.insertId;
        // push to cache
        _cache.employees.push(employee);
    }

    /**
     * Updates an Employee's Role.
     * 
     * @param {Employee} employee the Employee to update
     * @param {Role} role the Role to give the Employee
     */
    async updateEmployeeRole(employee, role) {
        // execute prepared update statement
        await this.conn.execute(
            'UPDATE employees_table SET role_id = ? WHERE id = ?;',
            [role.id, employee.id]
        );
        // set the employee's role
        employee.role = role;
    }

    async refreshCaches() {
        await this.refreshDepartmentsCache();
        await this.refreshRolesCache();
        await this.refreshEmployeesCache();
    }

    async refreshDepartmentsCache() {
        const [rows] = await this.conn.query('SELECT * FROM departments_table;');       // retrieve all rows from departments table in database
        _cache.departments = rows.map(row => {                                          // replace the existing cache by...
            const { id, name } = row;                                                       // desconstructing the row
            const department = new Department(parseInt(id), name);                          // creating a new Department object using the parts
            return department;                                                              // return the Department
        });
        return this.departments;                                                        // return the database departments
    }

    async refreshRolesCache() {
        const [rows] = await this.conn.query('SELECT * FROM roles_table;');                                     // retrieve all rows from the roles table in the database
        _cache.roles = rows.map(row => {                                                                        // replace the existing cache by...
            const { id, title, salery, department_id } = row;                                                       // deconstructing the row
            const department = this.departments.find(department => department.id === parseInt(department_id));      // searching the department cache for a matching Department object
            const role = new Role(parseInt(id), title, parseFloat(salery), department);                             // creating a new Role object using the parts
            return role;                                                                                            // return the Role
        });
        return this.roles;                                                                                      // return the database roles
    }

    async refreshEmployeesCache() {
        const [rows] = await this.conn.query('SELECT * FROM employees_table;');     // retrieve all rows from the employees table in the database
        const temp = rows.map(row => {                                              // create a temporary working cache by...
            const { id, first_name, last_name, role_id, manager_id } = row;             // deconstructing the row
            const role = this.roles.find(role => role.id === parseInt(role_id));        // searching the role cache for a matching Role object
            const employee = new Employee(id, first_name, last_name, role, null);       // creating a new Employee object using the parts
            return { employee: employee, managerId: parseInt(manager_id) };             // return a pairing of the new Employee object and the manager ID
        });
        for(let { employee, managerId } of temp) {                                  // iterate over all the pairs
            if(managerId === null)                                                      // if the manager ID is null
                continue;                                                                   // skip the rest of the loop
            for(let pair of temp) {                                                     // otherwise, for each pair
                if(pair.employee.id === managerId) {                                        // if the pair's employee ID equals the manager ID
                    employee.manager = pair.employee;                                           // set the manager of the employee to the pair's employee
                    break;                                                                      // break out of this loop
                }
            }
        }
        _cache.employees = temp.map(pair => pair.employee);                         // map the employees from the pairs and replace the existing cache
        return this.employees;                                                      // return the database employees
    }

    close() {
        this.conn.end();        // close the database connection
        _connection = null;     // set the global reference to the connection to null
        _started = false;       // set the global started variable to false incase we'd need to ever restart the database
    }
}

async function start() {
    if(_started)                                                                    // if the database has already started
        throw new Error('Database has already been started!');                          // throw an error, we shouldn't start a database again
    _connection = await mysql.createConnection(connectOptions);                     // create the internal connection
    const database = new Database();                                                // initialize a new Database object
    const script = await readResource('db', 'schema.sql');                          // load the schema script
    await database.conn.query(`CREATE DATABASE IF NOT EXISTS ${databaseName};`);    // create the database
    await database.conn.query(`USE ${databaseName};`);                              // set the connection to use the new database
    await database.conn.query(script);                                              // run the schema script
    _started = true;                                                                // set started to true
    await database.refreshCaches();                                                 // initial cache refresh to populate it
    return database;                                                                // return the new Database
}

module.exports = {
    start,
    getInstance() {
        return new Database();
    }
};
