const path = require('path');
const fs = require('fs').promises;

const readResource = (...paths) => fs.readFile(path.join(process.cwd(), ...paths), { encoding: 'utf-8' });

module.exports = {
    readResource
};
