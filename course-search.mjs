const normalize=t=>String(t).toLowerCase().replace(/[أإآ]/g,'ا').replace(/[ًٌٍَُِّْـ]/g,'');
const words=t=>normalize(t).match(/[\p{L}\p{N}]+/gu)||[];
const aliases={'الماضي':'past','المضارع':'present','المستقبل':'future','التام':'perfect','المستمر':'progressive','قواعد':'grammar','القراءة':'reading','الكتابة':'writing','المهن':'careers','مقارنة':'comparatives','الشرط':'conditional','النصيحة':'advice','شكوى':'complaint','النشاط':'workbook'};
export function retrieveCourse(course,{query='',unit=0,page=0,book='all',limit=4}={}){
 if(!course)return [];
 const normalizedQuery=String(query).replace(/[٠-٩]/g,c=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(c)));
 const specified=normalizedQuery.match(/(?:page|صفحة|صفحه|ص)\s*(\d{1,3})\b/i);
 // A page explicitly typed by the learner overrides the currently open lesson page.
 const wanted=specified?Number(specified[1]):Number(page)||0;
 let pool=course.documents;
 if(wanted){const exact=pool.find(d=>d.page===wanted);return exact?[exact]:[]}
 if(book==='student'||book==='workbook')pool=pool.filter(d=>d.book===book);
 if(unit)pool=pool.filter(d=>d.unit===unit);
 const terms=[...new Set(words(query).flatMap(w=>[w,aliases[w]].filter(Boolean)))].filter(w=>w.length>1);
 return pool.map(d=>{const tokens=words(d.text+' '+d.title);const counts=new Map();for(const t of tokens)counts.set(t,(counts.get(t)||0)+1);const score=terms.reduce((sum,t)=>sum+(counts.has(t)?1+Math.log(counts.get(t)):0),0);return {d,score}}).sort((a,b)=>b.score-a.score||a.d.page-b.d.page).slice(0,Math.max(1,Math.min(limit,6))).map(x=>x.d);
}
export function sourceSummary(d){return {id:d.id,page:d.page,pdfPage:d.pdfPage,unit:d.unit,book:d.book,title:d.title}}
