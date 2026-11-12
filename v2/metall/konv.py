import ezdxf,glob,os,math,json
from collections import defaultdict
import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
def loops(fn):
    d=ezdxf.readfile(fn); nxt={}
    k=lambda p:(round(p[0],4),round(p[1],4))
    segs=[(k(e.dxf.start),k(e.dxf.end)) for e in d.modelspace().query("LINE")]
    for a,b in segs: nxt[a]=b
    out=[];seen=set()
    for s in nxt:
        if s in seen: continue
        L=[s];seen.add(s);p=nxt[s]
        while p!=s: L.append(p);seen.add(p);p=nxt[p]
        out.append(L)
    return out
def area(L): return 0.5*sum(L[i][0]*L[i-1][1]-L[i-1][0]*L[i][1] for i in range(len(L)))
info={}
for fn in sorted(glob.glob("dxf_raw/*.dxf")):
    n=os.path.basename(fn)[:-4]; Ls=loops(fn)
    xs=[p[0] for L in Ls for p in L]; ys=[p[1] for L in Ls for p in L]
    cx,cy=(min(xs)+max(xs))/2,(min(ys)+max(ys))/2
    Ls=[[(x-cx,y-cy) for x,y in L] for L in Ls]
    doc=ezdxf.new("R2000"); doc.header["$INSUNITS"]=4; doc.header["$MEASUREMENT"]=1
    doc.layers.add("CUT",color=1); msp=doc.modelspace()
    for L in Ls: msp.add_lwpolyline(L,close=True,dxfattribs={"layer":"CUT"})
    doc.saveas(f"dxf/{n}.dxf")
    Ls.sort(key=lambda L:-abs(area(L))); A=abs(area(Ls[0]))-sum(abs(area(L)) for L in Ls[1:]); per=sum(math.dist(L[i],L[i-1]) for L in Ls for i in range(len(L)))
    info[n]=dict(w=max(xs)-min(xs),h=max(ys)-min(ys),area=abs(A),cut=per,konturen=len(Ls),loops=Ls)
# nesting: Bahnen auf Blech 300 breit
GAP=5; W=300; order=sorted(info,key=lambda n:-info[n]["h"]); x=y=GAP; rowh=0; pos={}
for n in order:
    w,h=info[n]["w"],info[n]["h"]
    if x+w+GAP>W: x=GAP; y+=rowh+GAP; rowh=0
    pos[n]=(x+w/2,y+h/2); x+=w+GAP; rowh=max(rowh,h)
H=y+rowh+GAP
nd=ezdxf.new("R2000"); nd.header["$INSUNITS"]=4; nd.layers.add("CUT",color=1); nd.layers.add("TEXT",color=3); m=nd.modelspace()
fig,ax=plt.subplots(figsize=(11.69,11.69*H/W+1))
ax.add_patch(plt.Rectangle((0,0),W,H,fill=False,ls="--",color="gray"))
for n,(px,py) in pos.items():
    for L in info[n]["loops"]:
        P=[(a+px,b+py) for a,b in L]; m.add_lwpolyline(P,close=True,dxfattribs={"layer":"CUT"})
        ax.fill(*zip(*P),facecolor="#d4af37" if L is info[n]["loops"][0] else "white",edgecolor="#6b4e00",lw=0.4)
    ax.text(px,py-info[n]["h"]/2-3.5,n,ha="center",fontsize=6)
ax.set_aspect("equal");ax.set_xlim(-5,W+5);ax.set_ylim(-8,H+5)
ax.set_title(f"Tellurium v2 – Nesting 3 mm Messing CuZn39Pb3, Tafel {W} x {H:.0f} mm (Masse mm, Abstand {GAP} mm)",fontsize=9)
fig.savefig("nesting_uebersicht.png",dpi=200,bbox_inches="tight")
with PdfPages("nesting_uebersicht.pdf") as pdf: pdf.savefig(fig,bbox_inches="tight")
nd.saveas("dxf/_nesting_alle_teile.dxf")
for v in info.values(): v.pop("loops")
json.dump(dict(teile=info,blech=[W,H]),open("teile.json","w"),indent=1)
for n,v in info.items(): print(f"{n:18s} {v['w']:6.1f} x {v['h']:6.1f}  A={v['area']/100:6.2f}cm2  Schnitt={v['cut']:6.0f}mm  K={v['konturen']}")
print("Blech",W,round(H),"Summe Flaeche cm2",round(sum(v['area'] for v in info.values())/100,1),"Schnitt m",round(sum(v['cut'] for v in info.values())/1000,2))
