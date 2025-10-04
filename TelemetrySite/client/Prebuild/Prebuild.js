const fs = require('fs');
const lock = JSON.parse(fs.readFileSync('./package-lock.json', 'utf-8'));

// Get the root project version
const version = lock.version;

fs.writeFileSync('../src/Footer/version.txt', `REACT_APP_VERSION=${version}\n`);