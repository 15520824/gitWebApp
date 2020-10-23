const fs = require('fs');

var html = fs.readFileSync('./index.tpl.html', 'utf-8');
var js = fs.readFileSync('../dist/app.bundle.js');
var ps = html.split('___YOUR___CODE___');
var out = ps[0]+ js +  ps[1];

fs.writeFileSync('../dist/index.html',out, 'utf8');
fs.writeFileSync('../android/app/src/main/assets/index.html',out, 'utf8');
