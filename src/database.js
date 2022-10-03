const mysql = require('mysql2/promise');

const Department = require('../lib/Department');
const Employee = require('../lib/Employee');
const Role = require('../lib/Role');

const { readResource } = require('./util');

/** Private variable to tell if the database connection has been started */
let _started = false;
/** Private variable to hold database connection, or null if it's stopped or hasn't been started at all */
let _connection = null;
/** Private variable to hold in-runtime cache, good for reducing the number of queries to our database */
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

function deleteDepartmentFromCache(department) {
    _cache.departments.splice(_cache.departments.findIndex(d => d.id === department), 1);
}

function deleteRoleFromCache(role) {
    _cache.roles = _cache.roles.filter(r => r !== role);
}

function deleteRolesFromCache(roles) {
    _cache.roles = _cache.roles.filter(r => !roles.includes(r));
}

function deleteEmployeeFromCache(deletedEmployee) {
    _cache.employees = _cache.employees.filter(e => e !== deletedEmployee); // reset the cache to only include non-deleted employees
    for(let cacheEmployee of _cache.employees) {                            // for each cache employee
        if(cacheEmployee.manager !== null) {                                    // if the cache employee has a manager
            if(deletedEmployee === cacheEmployee.manager) {                         // if the deleted employee is the cache employee's manager
                cacheEmployee.manager = null;                                           // set the cache employee manager to null
            }
        }
    }
}

function deleteEmployeesFromCache(deletedEmployees) {
    _cache.employees = _cache.employees.filter(e => !deletedEmployees.includes(e)); // reset out cache to only include non-deleted employees
    for(let cacheEmployee of _cache.employees) {                                    // for each cache employee
        if(cacheEmployee.manager !== null) {                                            // if the cache employee has a manager
            if(deletedEmployees.includes(cacheEmployee.manager)) {                          // if the deleted employees contains the manager of the cache employee
                cacheEmployee.manager = null;                                                   // set the cache employee manager to null
            }
        }
    }
}

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
     * Gets Roles by a Department.
     * 
     * @param {Department} department the Department to search for
     * @returns {Array<Role>} the Roles found
     */
    getRolesByDepartment(department) {
        return this.getRolesByDepartmentId(department.id);
    }

    /**
     * Gets Roles by a Department ID.
     * 
     * @param {Number} id the Department ID to search for
     * @returns {Array<Role>} the Roles found
     */
    getRolesByDepartmentId(id) {
        return _cache.roles.filter(role => role.departmentId === id);
    }

    /**
     * Gets Employees by a Department.
     * 
     * @param {Department} department the Department to search for
     * @returns {Array<Employee>} the Employees found
     */
    getEmployeesByDepartment(department) {
        return this.getEmployeesByDepartmentId(department.id);
    }

    /**
     * Gets Employees by a Department ID.
     * 
     * @param {Number} id the Department ID to search for
     * @returns {Array<Employee>} the Employees found
     */
    getEmployeesByDepartmentId(id) {
        return _cache.employees.filter(employee => employee.role.departmentId === id);
    }

    /**
     * Gets Employees by a Role.
     * 
     * @param {Role} role the Role to search for
     * @returns {Array<Employee>} the Employees found
     */
    getEmployeesByRole(role) {
        return this.getEmployeesByRoleId(role.id);
    }

    /**
     * Gets Employees by a Role ID.
     * 
     * @param {Number} id the Role ID to search for
     * @returns {Array<Employee>} the Employees found
     */
    getEmployeesByRoleId(id) {
        return _cache.employees.filter(employee => employee.role.id === id);
    }

    /**
     * Adds a Department to the Database.
     * 
     * @param {Department} department the Department to add
     */
    async addDepartment(department) {
        const [rows] = await this.conn.execute(                     // execute prepared insert statement
            'INSERT INTO departments_table(name) VALUES (?);',
            [department.name]
        );
        department.id = rows.insertId;                              // set department ID to the one sent back by the insert
        _cache.departments.push(department);                        // push to cache
    }

    /**
     * Adds a Role to the Database.
     * 
     * @param {Role} role the Role to add
     */
    async addRole(role) {
        const [rows] = await this.conn.execute(                                             // execute prepared insert statement
            'INSERT INTO roles_table(title, salery, department_id) VALUES (?, ?, ?);',
            [role.title, role.salary, role.departmentId]
        );
        role.id = rows.insertId;                                                            // set role ID to the one sent back by the insert
        _cache.roles.push(role);                                                            // push to cache
    }

    /**
     * Adds a Employee to the Database.
     * 
     * @param {Employee} employee the Employee to add
     */
    async addEmployee(employee) {
        const [rows] = await this.conn.execute(                                                                 // execute prepared insert statement
            'INSERT INTO employees_table(first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?);',
            [employee.firstName, employee.lastName, employee.roleId, employee.managerId]
        );
        employee.id = rows.insertId;                                                                            // set employee ID to the one sent back by the insert
        _cache.employees.push(employee);                                                                        // push to cache
    }

    /**
     * Updates an Employee's Role.
     * 
     * @param {Employee} employee the Employee to update
     * @param {Role} role the Role to give the Employee
     */
    async updateEmployeeRole(employee, role) {
        await this.conn.execute(                                        // execute prepared update statement
            'UPDATE employees_table SET role_id = ? WHERE id = ?;',
            [role.id, employee.id]
        );
        employee.role = role;                                           // set the employee's role
    }

    /**
     * Updates an Employee's manager.
     * 
     * @param {Employee} employee the Employee to update
     * @param {Employee|null} manager the new manager, or null if it should be removed
     */
    async updateEmployeeManager(employee, manager) {
        await this.conn.execute(                                            // execute prepared update statement
            'UPDATE employees_table SET manager_id = ? WHERE id = ?;',
            [manager ? manager.id : null, employee.id]
        );
        employee.manager = manager;                                         // set the employee's manager
    }

    /**
     * Deletes a Department from the database.
     * 
     * @param {Department} department the department to delete
     */
    async deleteDepartment(department) {
        await this.conn.execute('DELETE FROM departments_table WHERE id = ?;', [id]);       // execute prepared delete statement
        const roles = this.getRolesByDepartmentId(id);                                      // get the roles associated with the department
        const employees = this.getEmployeesByDepartmentId(id);                              // get the employees associated with the department
        deleteDepartmentFromCache(department);                                              // delete the department from the cache
        deleteRolesFromCache(roles);                                                        // delete the roles associated with the department from the cache
        deleteEmployeesFromCache(employees);                                                // delete the employees associated with the department from the cache
    }

    /**
     * Deletes a Role from the database.
     * 
     * @param {Role} role the role to delete
     */
    async deleteRole(role) {
        await this.conn.execute('DELETE FROM roles_table WHERE id = ?;', [role.id]);    // execute prepared delete statement
        const employees = this.getEmployeesByRole(role);                                // get the employees associated with the role
        deleteRoleFromCache(role);                                                      // delete the role from the cache
        deleteEmployeesFromCache(employees);                                            // delete the employees associated with the role from the cache
    }

    /**
     * Deletes an Employee from the database.
     * 
     * @param {Employee} employee the employee to delete
     */
    async deleteEmployee(employee) {
        await this.conn.execute('DELETE FROM employees_table WHERE id = ?;', [employee.id]);    // execute prepared delete statement
        deleteEmployeeFromCache(employee);                                                      // delete the employee from the cache
    }

    /**
     * Deletes a Department from the database.
     * 
     * @param {Number} id the department ID to delete
     */
    async deleteDepartmentById(id) {
        await this.deleteDepartment(this.getDepartmentById(id));    // defer to deleteDepartment
    }

    /**
     * Deletes a Role from the database.
     * 
     * @param {Number} id the role ID to delete
     */
    async deleteRoleById(id) {
        await this.deleteRole(this.getRoleById(id));    // defer to deleteRole
    }

    /**
     * Deletes an Employee from the database.
     * 
     * @param {Number} id the employee ID to delete
     */
    async deleteEmployeeById(id) {
        await this.deleteEmployee(this.getEmployeeById(id));    // defer to deleteEmployee
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
