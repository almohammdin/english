const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync('data.js','utf8')+'\n'+fs.readFileSync('curriculum.js','utf8')+'\nthis.result={LESSONS,UNITS,PATHS};',ctx);const {LESSONS,UNITS,PATHS}=ctx.result;
assert.equal(UNITS.length,12);assert.equal(LESSONS.length,52);assert.equal(PATHS.length,1);assert.equal(new Set(LESSONS.map(l=>l.id)).size,52);
let questions=0;for(const l of LESSONS){assert.ok(l.title&&l.explain&&l.example&&l.questions.length);for(const q of l.questions){questions++;assert.ok(q.prompt&&q.why&&q.skill);if(q.type!=='dictation'){assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.options.length);assert.equal(new Set(q.options).size,q.options.length)}if(q.skill==='reading')assert.ok(q.context,'Reading questions must include the passage')}}
for(const u of UNITS){assert.equal(LESSONS.filter(l=>l.unit===u.n&&!l.id.startsWith('exp')).length,4);assert.ok(u.write&&u.checks.length===3&&u.dictation.length===3)}
console.log(`Validated ${UNITS.length} units, ${LESSONS.length} lessons/reviews and ${questions} question entries.`);
