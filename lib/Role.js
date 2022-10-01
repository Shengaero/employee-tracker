const Department = require("./Department");

class Role {
    /**
     * @param {number}      id the ID of the Role
     * @param {string}      title the title of the Role
     * @param {number}      salary the salary of the Role 
     * @param {Department}  department the Department which the Role belongs to
     */
    constructor(id, title, salary, department) {
        /**
         * the ID of the Role
         * @type {Number}
         */
        this.id = id;
        /**
         * the title of the Role
         * @type {String}
         */
        this.title = title;
        /**
         * the salary of the Role
         * @type {Number}
         */
        this.salary = salary;
        /**
         * the Department which the Role belongs to
         * @type {Department}
         */
        this.department = department;
    }

    /**
     * the ID of the Department which the Role belongs to
     * @type {Number}
     */
    get departmentId() {
        return this.department.id;
    }
}

module.exports = Role;
