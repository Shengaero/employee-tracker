[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
# employee-tracker
Manage all your employees in one place with one program.

## Table of Contents
* [Installation](#installation)
* [Usage](#usage)
* [Contribution](#contribution)
* [Testing](#testing)
* [Questions](#questions)

## Installation
This program will require you have `node.js` and `mysql` installed.

It will also require that you have environment variables `MYSQL_USER` and `MYSQL_PASS` set to your root mysql username and password respectively.

> If you have the username and password both set to `root`, you do not need to worry about setting the environment variables up, although this is not recommended.

Once you have both `node.js` and `mysql` installed, you can clone this repository by using the following via command line:
```bash
git clone git@github.com:Shengaero/employee-tracker.git
```

Finally, navigate to the installation directory and install the dependencies via npm:
```bash
npm i
```

## Usage
To run this application, simply navigate to the installation directory and run the following via command line:
```bash
npm run app
# or
node index.js
```

You will be presented with a menu with various options to help manipulate the database of employees.

[Here's a video showing how it works](https://www.youtube.com/watch?v=e6DSWWRFmjk)

## Contibution
Currently not accepting contributions, but feel free to star the project!

## Testing
To run tests, run the following command:
```bash
npm run test
```

> ### Note
> The tests were made for development purposes only and may not work correctly on certain machines. The source code of all unit tests is available [in the test directory of this repository](https://github.com/Shengaero/employee-tracker/tree/main/test).

## Questions
For questions or other inquiries, feel free to reach out to me via either [GitHub](https://github.com/Shengaero) or send an email to kaidangustave@yahoo.com
