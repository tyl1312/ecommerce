import fs from 'fs';

const json = fs.readFileSync('C:/Users/alter/Downloads/websecproject-e89b0-firebase-adminsdk-fbsvc-631c36b10a.json', 'utf8');
console.log(JSON.stringify(JSON.parse(json)));