const Department = require("../lib/Department");

const createDummyDepartment = (id = 1, name = 'Test') => new Department(id, name);

describe('Department class tests', () => {
    describe('object equality', () => {
        test('basic equality', () => {
            const department = new Department(1, 'Test');
            expect(department).toEqual(department);
        });
        test('deep equality is not basic equality', () => {
            const department1 = new Department(1, 'Test One');
            const department2 = new Department(1, 'Test One');
            expect(department1 === department2).toBeFalsy();
        });
        test('equality after id is set', () => {
            const department = new Department(1, 'Test');
            const reference = department;
            department.id = 2;
            expect(reference === department).toBeTruthy();
        });
        test('equality after name is set', () => {
            const department = new Department(1, 'Test');
            const reference = department;
            department.name = 'Testing';
            expect(reference === department).toBeTruthy();
        })
    });
    describe('has property', () => {
        test('id', () => expect(createDummyDepartment().id).toBeDefined());
        test('name', () => expect(createDummyDepartment().name).toBeDefined());
    });
    describe('has expected value', () => {
        test('id', () => expect(createDummyDepartment().id).toBe(1));
        test('name', () => expect(createDummyDepartment().name).toBe('Test'));
    });
});
