const Role = require("./Role");

class Employee {
    /**
     * @param {Number}      id the ID of the Employee
     * @param {String}      firstName the first name of the Employee
     * @param {String}      lastName the last name of the Employee
     * @param {Role}        role the Employee's designated Role
     * @param {?Employee}   manager the manager Employee which this Employee is assigned to,
     *                              or `null` if this Employee has no manager
     */
    constructor(id, firstName, lastName, role, manager) {
        /**
         * the ID of the Employee
         * @type {Number}
         */
        this.id = id;
        /**
         * the first name of the Employee
         * @type {String}
         */
        this.firstName = firstName;
        /**
         * the last name of the Employee
         * @type {String}
         */
        this.lastName = lastName;
        /**
         * the Employee's designated Role
         * @type {Role}
         */
        this.role = role;
        /**
         * the manager Employee which this Employee is assigned to,
         * or `null` if this Employee has no manager
         * @type {?Employee}
         */
        this.manager = manager;
    }

    /**
     * the ID of the Employee's designated Role
     * @type {Number}
     */
    get roleId() {
        return this.role.id;
    }

    /**
     * the ID of the manager Employee which this Employee is
     * assigned to, or `null` if this Employee has no manager
     * @type {?Number}
     */
    get managerId() {
        if(this.manager !== null) {
            return this.manager.id;
        }
        return null;
    }
}

module.exports = Employee;
