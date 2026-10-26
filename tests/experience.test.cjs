const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={};vm.createContext(ctx);
for(const f of ['data.js','curriculum.js','experience.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx);
const run=s=>vm.runInContext(s,ctx);
assert.equal(run('CHANGE_SCENES.length'),5);
assert.equal(run('CHANGE_TEST.length'),5);
assert.equal(run('CHANGE_TEST.some(t=>CHANGE_PRACTICE.some(p=>p.prompt===t.prompt))'),false);
assert.equal(run('CHANGE_TEST.every(q=>q.answer>=0&&q.answer<q.options.length&&new Set(q.options).size===q.options.length&&q.why&&q.skill)'),true);
// Exercise all five rendered stages and answer handlers without external services.
run(`
var nodes={}, options=[], sceneButtons=[], pieceButtons=[],removeButtons=[];
function node(id){return nodes[id]||(nodes[id]={innerHTML:'',value:'',disabled:false,focus(){},querySelectorAll:select});}
function select(s){return s==='[data-change-answer]'?options:s==='[data-change-scene]'?sceneButtons:s==='[data-change-piece]'?pieceButtons:s==='[data-change-remove]'?removeButtons:[];}
var $=id=>node(id),esc=s=>String(s).replaceAll('<','&lt;'),head=()=>'',activeLesson=null,state={notes:[],attempts:[]},saved=0,save=()=>saved++,speak=()=>{},window={},quiz=null;
function startQuiz(l,mode,questions){quiz={l,mode,questions};}
changeExperience(true);
`);
assert.match(run("nodes['#change-body'].innerHTML"),/غير الوقت/);
run("nodes['#change-next'].onclick()");
for(let i=0;i<5;i++){
 run(`options=[0,1,2].map(i=>({dataset:{changeAnswer:String(i)},disabled:false,classList:{add(){}}}));changeBody();`);
 run(`options[${i===0?0:[1,0,2,0,1][i]}].onclick()`);
 assert.equal(run('options.every(b=>b.disabled)'),true);
 run("nodes['#change-next'].onclick()");
}
assert.equal(run('changeRun.step'),2);
run("changeRun.pieces=[3,0,4,2,1];changeBody();nodes['#change-check'].onclick()");
assert.match(run("nodes['#change-feedback'].innerHTML"),/جرب الترتيب/);
run("changeRun.pieces=[0,1,2,3,4];changeBody();nodes['#change-check'].onclick();nodes['#change-next'].onclick()");
assert.equal(run('changeRun.step'),3);
run("node('#change-draft').value='My neighborhood has changed.';nodes['#change-writing'].onsubmit({preventDefault(){}})");
assert.equal(run('saved'),1);assert.equal(run('changeSaved()'),'My neighborhood has changed.');
run("nodes['#change-test'].onclick()");assert.equal(run('quiz.mode'),'test');assert.equal(run('quiz.questions.length'),5);assert.equal(run('quiz.l.id'),'u1-scene');
run("state.attempts=[{lesson:'u1-scene',mode:'test',correct:4,total:5,score:80,answers:[{ok:false,why:'Review past simple'}]}]");
assert.match(run('changeFollowup()'),/80%/);assert.match(run('changeFollowup()'),/Review past simple/);
assert.match(run('changeFollowup()'),/My neighborhood has changed/);
console.log('PASS: five experience stages, wrong/correct answers, sentence retry, writing persistence, independent quiz and parent summary.');
