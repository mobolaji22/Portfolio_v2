# Contact sheet of screencast frames: python3 frames-sheet.py <name> <n> <out.png> [crop]
import sys,glob,json
from PIL import Image, ImageDraw
name,n,out=sys.argv[1],int(sys.argv[2]),sys.argv[3]
crop=tuple(int(x) for x in sys.argv[4].split(',')) if len(sys.argv)>4 else None
files=sorted(glob.glob(f'/tmp/{name}-*.jpg')); ts=json.load(open(f'/tmp/{name}.json'))
idx=[round(i*(len(files)-1)/(n-1)) for i in range(n)]
ims=[]
for i in idx:
    im=Image.open(files[i]).convert('RGB')
    if crop: im=im.crop(crop)
    im=im.resize((im.width//2*1, im.height//2*1)) if im.width>900 else im
    d=ImageDraw.Draw(im); d.rectangle((0,0,70,16),fill=(0,0,0)); d.text((3,2),f'{ts[i]*1000:.0f}ms',fill=(255,255,0))
    ims.append(im)
cols=min(n,4 if ims[0].width<500 else 3)
rows=(n+cols-1)//cols
W,H=ims[0].size
sheet=Image.new('RGB',(W*cols,H*rows),'white')
for k,im in enumerate(ims): sheet.paste(im,((k%cols)*W,(k//cols)*H))
sheet.save(out)
print(sheet.size)
