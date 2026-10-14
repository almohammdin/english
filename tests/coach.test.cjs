const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={};vm.createContext(ctx);for(const f of ['data.js','curriculum.js','coach-data.js','exams.js','coach.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx);
const run=s=>vm.runInContext(s,ctx);
assert.equal(run('COURSE.pdfPages'),376);
assert.equal(run('COURSE.sections.length'),13);
assert.equal(run('validCoach(freshCoach())'),true);
assert.equal(run('validCoach({...freshCoach(),unit:13})'),false);
assert.equal(run('validCoach({...freshCoach(),work:{u1:{draft:42}}})'),false);
assert.equal(run('validCoach({...freshCoach(),checks:{bad:true}})'),false);
assert.equal(run('wordCount("  One two\\nthree  ")'),3);
for(let n=1;n<=12;n++){
 assert.ok(run(`COURSE.workbook[${n-1}]>=219`));
 assert.ok(run(`UNITS[${n-1}].page+13<=195`));
 assert.equal(run(`LESSONS.find(l=>l.id==='u${n}g').testQuestions.length`),4);
 assert.equal(run(`LESSONS.find(l=>l.id==='u${n}g').testQuestions.some(q=>UNITS[${n-1}].grammar.some(t=>t.prompt===q.prompt))`),false);
 assert.ok(run(`LESSONS.find(l=>l.id==='u${n}g').testQuestions.every(q=>q.answer>=0&&q.answer<q.options.length&&new Set(q.options).size===q.options.length)`));
}
run(`var state={coach:freshCoach(),attempts:[{answers:[{prompt:'x',ok:false},{prompt:'y',ok:false}]},{answers:[{prompt:'x',ok:true}]}]};`);
assert.equal(run('unresolvedErrors().length'),1);
assert.equal(run('unresolvedErrors()[0].prompt'),'y');
console.log('PASS: 1448 page map, 48 independent grammar questions, portfolio schema and latest-answer error tracking.');
