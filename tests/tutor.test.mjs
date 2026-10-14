import assert from 'node:assert/strict';
import {retrieveCourse} from '../course-search.mjs';
const course={documents:[{id:'p8',page:8,unit:1,book:'student',title:'Grammar',text:'present perfect present progressive'},{id:'p219',page:219,unit:1,book:'workbook',title:'Practice',text:'past simple'},{id:'p22',page:22,unit:2,book:'student',title:'Careers',text:'present perfect'}]};
assert.deepEqual(retrieveCourse(course,{query:'اشرح صفحة ٢١٩',page:8}).map(d=>d.id),['p219']);
assert.equal(retrieveCourse(course,{query:'page 999'}).length,0);
assert.deepEqual(retrieveCourse(course,{query:'المضارع التام',unit:1,book:'student'}).map(d=>d.id),['p8']);
assert.deepEqual(retrieveCourse(course,{unit:1,book:'workbook'}).map(d=>d.id),['p219']);
assert.equal(retrieveCourse(null,{}).length,0);
console.log('PASS: explicit Arabic/English page lookup, missing page, unit/book isolation and absent index.');
