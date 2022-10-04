const Department = require("../lib/Department");
const Employee = require("../lib/Employee");
const Role = require("../lib/Role");

const createDummyEmployee = (
    role = null,
    manager = null,
    id = 1,
    firstName = 'Test',
    lastName = 'Testing'
) => new Employee(id, firstName, lastName, role || new Role(1, 'Test', 0.5, new Department(1, 'Test')), manager);

describe('Employee class tests', () => {
    describe('has property', () => {
        test('id', () => expect(createDummyEmployee().id).toBeDefined());
        test('firstName', () => expect(createDummyEmployee().firstName).toBeDefined());
        test('lastName', () => expect(createDummyEmployee().lastName).toBeDefined());
        test('role', () => expect(createDummyEmployee().role).toBeDefined());
        test('roleId', () => expect(createDummyEmployee().roleId).toBeDefined());
        test('manager', () => expect(createDummyEmployee().manager).toBeDefined());
        test('managerId', () => expect(createDummyEmployee().managerId).toBeDefined());
    });

    describe('has correct value', () => {
        test('id', () => expect(createDummyEmployee().id).toBe(1));
        test('firstName', () => expect(createDummyEmployee().firstName).toBe('Test'));
        test('lastName', () => expect(createDummyEmployee().lastName).toBe('Testing'));
        test('role', () => {
            const role = new Role(1, 'Test', 0.5, new Department(1, 'Test'));
            expect(createDummyEmployee(role).role).toBe(role);
        });
        test('roleId', () => {
            const role = new Role(1, 'Test', 0.5, new Department(1, 'Test'));
            expect(createDummyEmployee(role).role).toBe(role);
        });
        test('manager', () => {
            const manager = createDummyEmployee();
            expect(createDummyEmployee(null, manager).manager).toBe(manager);
        });
        test('managerId', () => {
            const manager = createDummyEmployee();
            expect(createDummyEmployee(null, manager).managerId).toBe(manager.id);
        });
        test('manager is null', () => expect(createDummyEmployee().manager).toBeNull());
        test('managerId is null', () => expect(createDummyEmployee().managerId).toBeNull());
    });
});
