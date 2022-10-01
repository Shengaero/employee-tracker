const mysql = require('mysql2/promise');
const { readResource } = require('./util');
const Department = require('../lib/Department');
const Employee = require('../lib/Employee');
const Role = require('../lib/Role');

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
    user: 'root',
    password: 'root',
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

    /**
     * Gets a Department by ID, or `null` if one isn't found with the specified ID.
     * 
     * @param {Number} id the ID to search for
     * @returns {Department|null} the Department found, or `null` if none was found
     */
    getDepartmentById(id) {
        const found = _cache.departments.find(department => department.id === parseInt(id));
        if(found)
            return found;
        return null;
    }

    /**
     * Gets a Role by ID, or `null` if one isn't found with the specified ID.
     * 
     * @param {Number} id the ID to search for
     * @returns {Role|null} the Role found, or `null` if none was found
     */
    getRoleById(id) {
        const found = _cache.roles.find(role => role.id === parseInt(id));
        if(found)
            return found;
        return null;
    }

    /**
     * Gets a Employee by ID, or `null` if one isn't found with the specified ID.
     * 
     * @param {Number} id the ID to search for
     * @returns {Employee|null} the Employee found, or `null` if none was found
     */
    getEmployeeById(id) {
        const found = _cache.employees.find(employee => employee.id === parseInt(id));
        if(found)
            return found;
        return null;
    }

    async refreshCaches() {
        await this.refreshDepartmentsCache();
        await this.refreshRolesCache();
        await this.refreshEmployeesCache();
    }

    async refreshDepartmentsCache() {
        const [rows] = await this.conn.query('SELECT * FROM departments_table;');

        _cache.departments = rows.map(row => {
            const { id, name } = row;
            const department = new Department(parseInt(id), name);
            return department;
        });

        return this.departments;
    }

    async refreshRolesCache() {
        const [rows] = await this.conn.query('SELECT * FROM roles_table;');

        _cache.roles = rows.map(row => {
            const { id, title, salery, department_id } = row;
            const department = this.departments.find(department => department.id === parseInt(department_id));
            const role = new Role(parseInt(id), title, parseFloat(salery), department);
            return role;
        });

        return this.roles;
    }

    async refreshEmployeesCache() {
        const [rows] = await this.conn.query('SELECT * FROM employees_table;');

        const temp = rows.map(row => {
            const { id, first_name, last_name, role_id, manager_id } = row;
            const role = this.roles.find(role => role.id === parseInt(role_id));
            const employee = new Employee(id, first_name, last_name, role, null);
            return { employee: employee, managerId: parseInt(manager_id) };
        });

        for(let { employee, managerId } of temp) {
            if(managerId === null)
                continue;
            for(let pair of temp) {
                if(pair.employee.id === managerId) {
                    employee.manager = pair.employee;
                    break;
                }
            }
        }

        _cache.employees = temp;
        return this.employees;
    }
}

async function start() {
    if(_started)
        throw new Error('Database has already been started!');

    _connection = await mysql.createConnection(connectOptions);

    const database = new Database();
    const script = await readResource('db', 'schema.sql');

    await database.conn.query(`CREATE DATABASE IF NOT EXISTS ${databaseName};`);
    await database.conn.query(`USE ${databaseName};`);
    await database.conn.query(script);

    _started = true;

    await database.refreshCaches();

    return database;
}

module.exports = { start };
