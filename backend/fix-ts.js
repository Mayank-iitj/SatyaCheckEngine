const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/modules/**/*.ts');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Fix Express res.json/send returns
  if (content.includes('return res.json(') || content.includes('return res.status(') || content.includes('return res.send(') || content.includes('return res.redirect(')) {
    content = content.replace(/return\s+res\.status\((.*?)\)\.json\((.*?)\);/g, 'res.status($1).json($2);\n    return;');
    content = content.replace(/return\s+res\.json\((.*?)\);/g, 'res.json($1);\n    return;');
    content = content.replace(/return\s+res\.send\((.*?)\);/g, 'res.send($1);\n    return;');
    content = content.replace(/return\s+res\.redirect\((.*?)\);/g, 'res.redirect($1);\n    return;');
    changed = true;
  }
  
  if (file.includes('integrity.routes.ts')) {
    content = content.replace(/institution:/g, 'institutionId:');
    changed = true;
  }
  if (file.includes('jobs.routes.ts')) {
    content = content.replace(/company: true,/g, '');
    content = content.replace(/result\.text\(\)/g, '(result.text ? result.text() : "")');
    content = content.replace(/recruiter:/g, 'recruiterId:');
    changed = true;
  }
  if (file.includes('recovery.routes.ts')) {
    content = content.replace(/student:/g, 'studentId:');
    changed = true;
  }
  if (file.includes('skills.routes.ts')) {
    content = content.replace(/entries:/g, '/*entries:*/');
    content = content.replace(/user:/g, '/*user:*/');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
}
