const Department = require("../lib/Department");
const Role = require("../lib/Role");

const createDummyRole = (department = null, id = 1, title = 'Test', salary = 0.5) =>
    new Role(id, title, salary, department || new Department(1, 'Test'));

describe('Role class tests', () => {
    describe('has property', () => {
        test('id', () => expect(createDummyRole().id).toBeDefined());
        test('title', () => expect(createDummyRole().title).toBeDefined());
        test('salary', () => expect(createDummyRole().salary).toBeDefined());
        test('department', () => expect(createDummyRole().department).toBeDefined());
        test('departmentId', () => expect(createDummyRole().departmentId).toBeDefined());
    });
    describe('has expected value', () => {
        test('id', () => expect(createDummyRole().id).toBe(1));
        test('title', () => expect(createDummyRole().title).toBe('Test'));
        test('salary', () => expect(createDummyRole().salary).toBe(0.5));
        test('department', () => {
            const department = new Department(2, 'Deep Test');
            const role = createDummyRole(department);
            expect(role.department).toBe(department);
        });
    });
});
