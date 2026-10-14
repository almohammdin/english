#!/usr/bin/env python3
"""Build a private per-page text index from the supplied 376-page 1448 PDF.
Requires Poppler pdftotext. Never put the output in GitHub Pages public assets.
"""
import argparse, hashlib, json, subprocess
from pathlib import Path
p=argparse.ArgumentParser()
p.add_argument('pdf',type=Path)
p.add_argument('--output',type=Path,default=Path('private/course.json'))
a=p.parse_args()
text=subprocess.check_output(['pdftotext','-layout',str(a.pdf),'-'],text=True)
pages=text.split('\f')
if not pages[-1].strip(): pages.pop()
if len(pages)!=376: raise SystemExit('Expected the verified 376-page 1448 edition; map a different edition before indexing.')
student=[6,20,34,54,68,82,106,120,134,154,168,182]
workbook=[219,229,239,255,265,275,291,301,311,327,337,347]
names=['Big Changes','Careers','What Will Be, Will Be','The Art of Advertising','Did You Hurt Yourself?','Take My Advice','You’ve Got Mail!','Wishful Thinking','Complaints, Complaints','I Wonder What Happened','If It Hadn’t Happened','What They Said']
docs=[]
for physical,content in enumerate(pages,1):
 printed=physical-6
 if not (2<=printed<=211 or 219<=printed<=370): continue
 book='student' if printed<=211 else 'workbook'
 starts=student if book=='student' else workbook
 unit=next((i+1 for i,start in enumerate(starts) if start<=printed<start+(14 if book=='student' else 10)),0)
 clean='\n'.join(line.rstrip() for line in content.splitlines()).strip()
 docs.append({'id':f'p{printed}','page':printed,'pdfPage':physical,'book':book,'unit':unit,'title':names[unit-1] if unit else 'Review and reference','text':clean})
a.output.parent.mkdir(parents=True,exist_ok=True)
a.output.write_text(json.dumps({'edition':'2026 / 1448','pdfPages':376,'sourceSha256':hashlib.sha256(a.pdf.read_bytes()).hexdigest(),'documents':docs},ensure_ascii=False),encoding='utf-8')
print(f'Indexed {len(docs)} content pages privately; source has 376 pages. Images/audio are not indexed.')
