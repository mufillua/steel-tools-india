from extract_col import objects
from cutout import cutout
import os
OUT='/home/claude/steel-tools-india/public/assets/products'
M='machine-tool-accessories'; C='lathe-centres'; H='industrial-hand-tools'
MAP={
 2:[(M,'bt-50-er-collet-chuck'),(M,'bt-50-stub-milling-arbor'),(M,'bt-50-stub-milling-arbor-flange-type'),(M,'bt-50-side-lock-holder'),(M,'bt-50-milling-reduction-socket'),(M,'bt-50-bt-40-reduction-adaptor'),(M,'bt-50-drill-chuck-arbor')],
 3:[(M,'iso-50-e-40-collet-chuck'),(M,'iso-50-er-collet-chuck'),(M,'iso-50-stub-milling-arbor'),(M,'iso-50-stub-milling-arbor-flange-type'),(M,'iso-50-side-lock-holder'),(M,'iso-50-milling-reduction-socket'),(M,'iso-50-drill-chuck-arbor')],
 4:[(M,'t-slot-nut'),(M,'flange-nut')],
 5:[(M,'e-40-collets'),(M,'e-40-collets-tail'),None,None,(M,'r8-m1tr-collets'),(M,'traub-collets'),(M,'traub-collets-end'),(M,'traub-collet-fingers')],
 6:[(C,'male-revolving-centre-standard'),(C,'male-revolving-centre-triple-bearing'),(C,'male-revolving-centre-four-bearing'),(C,'cnc-heavy-duty-revolving-centre')],
 7:[(C,'cnc-hd-r-centre-interchangeable'),'SPARE',None,None,(C,'dead-centre-carbide-tipped'),(C,'cnc-dead-centre-with-draw-off-nut')],
 8:[(C,'special-carbide-tipped-dead-centre'),(C,'full-carbide-dead-centre')],
 9:[(H,'adjustable-tap-handle-steel'),(H,'round-die-handle'),(H,'engineers-precision-try-square'),(H,'expanding-adjustable-hand-reamer')],
 10:[(H,'t-handle-tap-wrench'),(H,'protractor-with-graduated-steel-ruler'),(H,'depth-gauge'),(H,'thread-gauge'),(H,'radius-gauge')],
}
n=0
for page,items in MAP.items():
    im,boxes=objects(f'hi/rr26x-{page:02d}.png')
    boxes=[b for b in boxes if b[1]<3050]
    for i,it in enumerate(items):
        if it is None: continue
        if it=='SPARE':
            bs=boxes[1:4]; b=(min(x[0] for x in bs),min(x[1] for x in bs),max(x[2] for x in bs),max(x[3] for x in bs))
            c=cutout(im,b,keep='all'); cat,name=C,'carbide-tipped-spare-points'
        else:
            cat,name=it
            keep='all' if name in ('traub-collet-fingers','thread-gauge','radius-gauge') else 'largest'
            c=cutout(im,boxes[i],keep=keep)
        os.makedirs(f'{OUT}/{cat}',exist_ok=True)
        c.save(f'{OUT}/{cat}/{name}.webp','WEBP',quality=86,method=6); n+=1
print(n)
