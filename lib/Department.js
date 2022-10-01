class Department {
    /**
     * @param {Number}  id the ID of the Department
     * @param {String}  name the name of the Department
     */
    constructor(id, name) {
        /**
         * the ID of the Department
         * @type {Number}
         */
        this.id = id;
        /**
         * the name of the Department
         * @type {String}
         */
        this.name = name;
    }
}

module.exports = Department;
