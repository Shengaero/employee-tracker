const Department = require('../lib/Department');
const Employee = require('../lib/Employee');
const Role = require('../lib/Role');

const database = require('../src/database');

const { readResource } = require('../src/util');

let resetScript = null;
let schemaScript = null;

const dummyDepartment = () => new Department(-1, 'Test');
const dummyRole = (department) => new Role(-1, 'Test', 1, department);
const dummyEmployee = (role, manager = null) => new Employee(-1, 'Test', 'Testing', role, manager);

const getRowCount = async (db, table) => {
    const [rows] = await db.conn.execute(`SELECT COUNT(*) FROM ${table};`);
    const row = rows[0];
    return row['COUNT(*)'];
};

beforeEach(async () => {
    let db = database.getInstance();
    if(db.isClosed)
        db = await database.start();
    if(resetScript === null)
        resetScript = await readResource('db', 'reset.sql');
    if(schemaScript === null)
        schemaScript = await readResource('db', 'schema.sql');

    await db.conn.query(resetScript); // tear down DB
    await db.conn.query(schemaScript); // set up again
    await db.refreshCaches(); // refresh caches
});

describe('Database tests', () => {
    describe('add functions', () => {
        test('addDepartment adds to database', async () => {
            const db = database.getInstance();
            const department = dummyDepartment();

            expect(await getRowCount(db, 'departments_table')).toBe(0);
            await db.addDepartment(department);
            expect(await getRowCount(db, 'departments_table')).toBe(1);
        });
        test('addDepartment adds to database cache', async () => {
            const db = database.getInstance();
            const department = dummyDepartment();

            expect(db.departments.length).toBe(0);
            await db.addDepartment(department);
            expect(db.departments.length).toBe(1);
        });
        test('addRole adds to database', async () => {
            const db = database.getInstance();
            const department = dummyDepartment();
            const role = dummyRole(department);

            await db.addDepartment(department);

            expect(await getRowCount(db, 'roles_table')).toBe(0);
            await db.addRole(role);
            expect(await getRowCount(db, 'roles_table')).toBe(1);
        });
        test('addRole adds to database cache', async () => {
            const db = database.getInstance();
            const department = dummyDepartment();
            const role = dummyRole(department);

            await db.addDepartment(department);

            expect(db.roles.length).toBe(0);
            await db.addRole(role);
            expect(db.roles.length).toBe(1);
        });
        test('addEmployee adds to database', async () => {
            const db = database.getInstance();
            const department = dummyDepartment();
            const role = dummyRole(department);
            const employee = dummyEmployee(role);

            await db.addDepartment(department);
            await db.addRole(role);

            expect(await getRowCount(db, 'employees_table')).toBe(0);
            await db.addEmployee(employee);
            expect(await getRowCount(db, 'employees_table')).toBe(1);
        });
        test('addEmployee adds to database cache', async () => {
            const db = database.getInstance();
            const department = dummyDepartment();
            const role = dummyRole(department);
            const employee = dummyEmployee(role);

            await db.addDepartment(department);
            await db.addRole(role);

            expect(db.employees.length).toBe(0);
            await db.addEmployee(employee);
            expect(db.employees.length).toBe(1);
        });
    });
    describe('delete functions', () => {
        beforeEach(async () => {
            const db = database.getInstance();
            const department = dummyDepartment();
            const role = dummyRole(department);
            const employee = dummyEmployee(role);

            await db.addDepartment(department);
            await db.addRole(role);
            await db.addEmployee(employee);
        });
        test('deleteEmployee deletes from database', async () => {
            const db = database.getInstance();

            expect(await getRowCount(db, 'employees_table')).toBe(1);
            await db.deleteEmployee(db.employees[0]);
            expect(await getRowCount(db, 'employees_table')).toBe(0);
        });
        test('deleteEmployee deletes from database cache', async () => {
            const db = database.getInstance();

            expect(db.employees.length).toBe(1);
            await db.deleteEmployee(db.employees[0]);
            expect(db.employees.length).toBe(0);
        });
        test('deleteEmployee sets managed employees manager to null', async () => {
            const db = database.getInstance();
            const role = db.roles[0];
            const manager = db.employees[0];
            const employee = dummyEmployee(role, manager);

            await db.addEmployee(employee);
            expect(employee.manager).not.toBeNull();
            await db.deleteEmployee(manager);
            expect(employee.manager).toBeNull();
        });
        test('deleteRole deletes from database', async () => {
            const db = database.getInstance();

            expect(await getRowCount(db, 'roles_table')).toBe(1);
            await db.deleteRole(db.roles[0]);
            expect(await getRowCount(db, 'roles_table')).toBe(0);
        });
        test('deleteRole deletes from database cache', async () => {
            const db = database.getInstance();

            expect(db.roles.length).toBe(1);
            await db.deleteRole(db.roles[0]);
            expect(db.roles.length).toBe(0);
        });
        test('deleteRole deletes employees with role from database', async () => {
            const db = database.getInstance();

            expect(await getRowCount(db, 'employees_table')).toBe(1);
            await db.deleteRole(db.roles[0]);
            expect(await getRowCount(db, 'employees_table')).toBe(0);
        });
        test('deleteRole deletes employees with role from database cache', async () => {
            const db = database.getInstance();

            expect(db.employees.length).toBe(1);
            await db.deleteRole(db.roles[0]);
            expect(db.employees.length).toBe(0);
        });
        test('deleteDepartment deletes from database', async () => {
            const db = database.getInstance();

            expect(await getRowCount(db, 'departments_table')).toBe(1);
            await db.deleteDepartment(db.departments[0]);
            expect(await getRowCount(db, 'departments_table')).toBe(0);
        });
        test('deleteDepartment deletes from database cache', async () => {
            const db = database.getInstance();

            expect(db.departments.length).toBe(1);
            await db.deleteDepartment(db.departments[0]);
            expect(db.departments.length).toBe(0);
        });
        test('deleteDepartment deletes roles in department from database', async () => {
            const db = database.getInstance();

            expect(await getRowCount(db, 'roles_table')).toBe(1);
            await db.deleteDepartment(db.departments[0]);
            expect(await getRowCount(db, 'roles_table')).toBe(0);
        });
        test('deleteDepartment deletes roles in department from database cache', async () => {
            const db = database.getInstance();

            expect(db.roles.length).toBe(1);
            await db.deleteDepartment(db.departments[0]);
            expect(db.roles.length).toBe(0);
        });
        test('deleteDepartment deletes employees in department from database', async () => {
            const db = database.getInstance();

            expect(await getRowCount(db, 'employees_table')).toBe(1);
            await db.deleteDepartment(db.departments[0]);
            expect(await getRowCount(db, 'employees_table')).toBe(0);
        });
        test('deleteDepartment deletes employees in department from database cache', async () => {
            const db = database.getInstance();

            expect(db.employees.length).toBe(1);
            await db.deleteDepartment(db.departments[0]);
            expect(db.employees.length).toBe(0);
        });
    });
});

afterAll(() => {
    const db = database.getInstance();
    if(!db.isClosed)
        db.close();
});
