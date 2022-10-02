const inquirer = require('inquirer');
const database = require('./database').getInstance();

const Department = require('../lib/Department');
const Employee = require('../lib/Employee');
const Role = require('../lib/Role');

require('console.table');

const mapEmployeesForMenu = (employee) =>
    new Option(`${employee.firstName} ${employee.lastName}`, employee);

class Option {
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
}

async function viewAllDepartments() {
    const departments = database.departments;
    console.table('Departments', departments);
    return false;
}

async function viewAllRoles() {
    const roles = database.roles;
    console.table('Roles', roles.map(roles => roles.toTableObject()));
    return false;
}

async function viewAllEmployees() {
    const employees = database.employees;
    console.table('Employees', employees.map(employee => employee.toTableObject()));
    return false;
}

async function addDepartment() {
    const { name } = await inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'Enter the new department name:'
    });
    const department = new Department(-1, name);
    await database.addDepartment(department);
    return false;
}

async function addRole() {
    const { title, salary, department } = await inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: 'Enter the new role title:'
        },
        {
            type: 'input',
            name: 'salary',
            message: 'Enter the new role salary:'
        },
        {
            type: 'list',
            name: 'department',
            message: 'Select the department this role should be a part of:',
            choices: database.departments.map(department => new Option(department.name, department))
        }
    ]);

    const role = new Role(-1, title, salary, department);
    await database.addRole(role);
    return false;
}

async function addEmployee() {
    const { firstName, lastName, role, manager } = await inquirer.prompt([
        {
            type: 'input',
            name: 'firstName',
            message: "Enter the new employee's first name:"
        },
        {
            type: 'input',
            name: 'lastName',
            message: "Enter the new employee's last name:"
        },
        {
            type: 'list',
            name: 'role',
            message: "Select the new employee's role:",
            choices: database.roles.map(role => new Option(role.title, role))
        },
        {
            type: 'list',
            name: 'manager',
            message: "Select the new employee's manager:",
            choices: [
                ...database.employees.map(mapEmployeesForMenu),
                new Option('None', null)
            ]
        }
    ]);

    const employee = new Employee(-1, firstName, lastName, role, manager);
    await database.addEmployee(employee);
    return false;
}

async function updateEmployeeRole() {
    const { employee, role } = await inquirer.prompt([
        {
            type: 'list',
            name: 'employee',
            message: 'Select an employee to update:',
            choices: database.employees.map(mapEmployeesForMenu)
        },
        {
            type: 'list',
            name: 'role',
            message: 'Select a role to give the employee',
            choices: database.roles.map(role => new Option(role.title, role)),
        }
    ]);

    await database.updateEmployeeRole(employee, role);
    return false;
}

const prompt = {
    type: 'list',
    name: 'option',
    message: 'What would you like to do?',
    choices: [
        new Option('View All Departments', viewAllDepartments),
        new Option('View All Roles', viewAllRoles),
        new Option('View All Employees', viewAllEmployees),
        new Option('Add Department', addDepartment),
        new Option('Add Role', addRole),
        new Option('Add Employee', addEmployee),
        new Option('Update Employee Role', updateEmployeeRole),
        new Option('Close Database', () => true)
    ],
    loop: false
};

module.exports = async function gui() {
    const { option } = await inquirer.prompt(prompt);
    const shouldQuit = option ? await option() : false;
    if(shouldQuit) return;
    return await gui();
};
