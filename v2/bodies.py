# Erzeugt Sonne/Erde/Mond: AMS-Teile, Mal-Varianten, Vollfarb-Modelle (OBJ/MTL/PNG + 3MF)
import numpy as np, manifold3d as m3, trimesh, os, zipfile
from PIL import Image, ImageFilter
from scipy.ndimage import gaussian_filter, map_coordinates
O='bodies'; os.makedirs(O,exist_ok=True); os.makedirs('stl',exist_ok=True)
D_SUN,D_EARTH,D_MOON=66,46,13; D_ROD,D_ES,D_MR=6,3,2
def img(f,s=None):
    a=np.asarray(Image.open('tex/'+f).convert('RGB'),float)/255; return a
def gray(a): return a@[0.3,0.59,0.11]
def sampler(H):  # H: 2D Feld equirect (Zeile 0 = Nordpol, Spalte 0 = -180°)
    h,w=H.shape
    def f(lat,lon):
        y=(90-lat)/180*(h-1); x=((lon+180)%360)/360*w
        return map_coordinates(np.pad(H,((0,0),(0,1)),mode='wrap'),[y,x],order=1)
    return f
# Reliefkarten (0..1)
E_=img('earth.jpg'); land=((E_[...,0]+E_[...,1])/2 > E_[...,2]*0.9).astype(float)
land=gaussian_filter(land,1.5); land=np.clip((land-0.3)/0.4,0,1)
S_=gray(img('sun.jpg')); sunr=S_-gaussian_filter(S_,12); sunr=(sunr-sunr.min())/(np.ptp(sunr))
Mo=gray(img('moon.jpg')); moonr=gaussian_filter(Mo,1.2); moonr=(moonr-moonr.min())/np.ptp(moonr)
R={'erde':sampler(land),'sonne':sampler(sunr),'mond':sampler(moonr)}
def sphere(d,relief,amp,n=360,base=0.0):
    r=d/2; lats=np.linspace(90,-90,n//2+1)[1:-1]; lons=np.linspace(-180,180,n,endpoint=False)
    LA,LO=np.meshgrid(lats,lons,indexing='ij')
    h=relief(LA.ravel(),LO.ravel()) if relief else 0*LA.ravel()
    rr=r+base+amp*(h-(0 if relief is R['erde'] else 0.5)) if relief else r+0*h
    la,lo=np.radians(LA.ravel()),np.radians(LO.ravel())
    V=np.c_[rr*np.cos(la)*np.cos(lo),rr*np.cos(la)*np.sin(lo),rr*np.sin(la)]
    V=np.vstack([V,[0,0,r+base],[0,0,-r-base]]); N=len(V)-2; iN,iS=N,N+1
    nr,nc=len(lats),n; F=[]
    idx=lambda i,j:i*nc+j%nc
    for j in range(nc): F.append([iN,idx(0,j),idx(0,j+1)]); F.append([iS,idx(nr-1,j+1),idx(nr-1,j)])
    for i in range(nr-1):
        for j in range(nc):
            a,b,c,dd=idx(i,j),idx(i,j+1),idx(i+1,j),idx(i+1,j+1)
            F+= [[a,c,b],[b,c,dd]]
    t=trimesh.Trimesh(V,np.array(F),process=False)
    if t.volume<0: t.invert()
    return m3.Manifold(m3.Mesh(vert_properties=np.asarray(t.vertices,np.float32),tri_verts=np.asarray(t.faces,np.uint32)))
def cyl(d,h,z0=0,fn=48): return m3.Manifold.cylinder(h,d/2,d/2,fn).translate([0,0,z0])
def tomesh(M):
    g=M.to_mesh(); t=trimesh.Trimesh(g.vert_properties[:,:3],g.tri_verts); t.merge_vertices(); return t
def save(M,name):
    t=tomesh(M); t.export(f'stl/{name}.stl'); print(name,t.is_watertight,np.round(t.extents,1))
BIG=200
def top(M): return M ^ m3.Manifold.cube([BIG,BIG,BIG]).translate([-BIG/2,-BIG/2,0])
def bot(M): return (M ^ m3.Manifold.cube([BIG,BIG,BIG]).translate([-BIG/2,-BIG/2,-BIG])).rotate([180,0,0])
def pins(M,d,z=0): # Passstift-Loecher Ø2,2 x3 in Schnittebene
    return M - m3.Manifold.cylinder(6,1.1,1.1,16).translate([d*0.3,0,-3]) - m3.Manifold.cylinder(6,1.1,1.1,16).translate([-d*0.3,0,-3])
def ch_pin(lat=47.0,lon=8.0,d=1.3,depth=6,r=23):
    v=np.array([np.cos(np.radians(lat))*np.cos(np.radians(lon)),np.cos(np.radians(lat))*np.sin(np.radians(lon)),np.sin(np.radians(lat))])
    c=m3.Manifold.cylinder(depth+3,d/2,d/2,16).translate([0,0,-depth])
    # Richtung z -> v
    th=np.degrees(np.arccos(v[2])); ph=np.degrees(np.arctan2(v[1],v[0]))
    return c.rotate([0,th,0]).rotate([0,0,ph]).translate(list(v*(r+1.5)))
def holes(kind,d):
    if kind=='sonne': return cyl(D_ROD+0.1,d*0.75,-d/2-1)
    if kind=='erde': return cyl(D_ES+0.1,d*0.6,-d/2-1)+ch_pin(r=d/2)
    if kind=='mond': return cyl(D_MR+0.05,d*0.5,-d/2-1,24)
DS={'sonne':D_SUN,'erde':D_EARTH,'mond':D_MOON}
# ---------- 1) AMS / Standard (feine Struktur) ----------
s=sphere(D_SUN,R['sonne'],0.5)-holes('sonne',D_SUN)
save(pins(top(s),D_SUN),'sonne_oben'); save(pins(bot(s),D_SUN),'sonne_unten')
ocean=sphere(D_EARTH,None,0)
landb=(sphere(D_EARTH,R['erde'],0.8,base=-0.05)-sphere(D_EARTH-0.02,None,0))
ocean=ocean-holes('erde',D_EARTH); landb=landb-holes('erde',D_EARTH)
save(pins(top(ocean),D_EARTH),'erde_oben_ozean'); save(top(landb),'erde_oben_land')
save(pins(bot(ocean),D_EARTH),'erde_unten_ozean'); save(bot(landb),'erde_unten_land')
save((sphere(D_MOON,R['mond'],0.3,n=200)-holes('mond',D_MOON)),'mond')
# ---------- 2) Mal-Varianten (ein Koerper, tieferes Relief) ----------
s=sphere(D_SUN,R['sonne'],1.0)-holes('sonne',D_SUN)
save(pins(top(s),D_SUN),'mal_sonne_oben'); save(pins(bot(s),D_SUN),'mal_sonne_unten')
e=sphere(D_EARTH,R['erde'],1.3)-holes('erde',D_EARTH)
save(pins(top(e),D_EARTH),'mal_erde_oben'); save(pins(bot(e),D_EARTH),'mal_erde_unten')
save(sphere(D_MOON,R['mond'],0.6,n=240)-holes('mond',D_MOON),'mal_mond')
# ---------- 3) Vollfarbe: ganze Kugeln, OBJ+MTL+PNG und 3MF ----------
os.makedirs('vollfarbe',exist_ok=True)
for k,tx,amp in [('sonne','sun.jpg',0.3),('erde','earth.jpg',0.4),('mond','moon.jpg',0.2)]:
    d=DS[k]; M=sphere(d,R[k],amp,n=400)-holes(k,d); t=tomesh(M)
    V=t.vertices; Fc=t.faces; rr=np.linalg.norm(V,axis=1)
    lat=np.degrees(np.arcsin(np.clip(V[:,2]/np.maximum(rr,1e-9),-1,1))); lon=np.degrees(np.arctan2(V[:,1],V[:,0]))
    u=(lon+180)/360; v=(lat+90)/180
    U=u[Fc]; # Naht-Korrektur pro Dreieck
    fix=(U.max(1)-U.min(1))>0.5; U[fix]=np.where(U[fix]<0.5,U[fix]+1,U[fix])
    VV=v[Fc]
    im=Image.open('tex/'+tx).convert('RGB'); im.save(f'vollfarbe/{k}.png')
    with open(f'vollfarbe/{k}.mtl','w') as f: f.write(f'newmtl {k}\nKd 1 1 1\nmap_Kd {k}.png\n')
    with open(f'vollfarbe/{k}.obj','w') as f:
        f.write(f'# {k} Ø{d} mm, Einheit mm\nmtllib {k}.mtl\nusemtl {k}\n')
        f.writelines(f'v {a:.4f} {b:.4f} {c:.4f}\n' for a,b,c in V)
        f.writelines(f'vt {a:.5f} {b:.5f}\n' for a,b in zip(U.ravel(),VV.ravel()))
        for i,fc in enumerate(Fc): f.write(f'f {fc[0]+1}/{3*i+1} {fc[1]+1}/{3*i+2} {fc[2]+1}/{3*i+3}\n')
    # 3MF mit Farbe je Dreieck (aus Textur abgetastet; 3MF Core colorgroup, von allen Diensten lesbar)
    A=np.asarray(im,float); h,w,_=A.shape
    uc=(U.mean(1)%1)*(w-1); vc=(1-VV.mean(1))*(h-1)
    C=A[vc.astype(int),uc.astype(int)].astype(int)
    q=(C//8)*8+4; q=np.clip(q,0,255); keys,inv=np.unique(q,axis=0,return_inverse=True); inv=inv.ravel()
    x=['<?xml version="1.0" encoding="UTF-8"?>\n<model unit="millimeter" xml:lang="de-DE" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02" xmlns:m="http://schemas.microsoft.com/3dmanufacturing/material/2015/02">\n<resources>\n<m:colorgroup id="1">']
    x+= [f'<m:color color="#{r:02X}{g:02X}{b:02X}"/>' for r,g,b in keys]
    x.append('</m:colorgroup>\n<object id="2" type="model" pid="1" pindex="0"><mesh><vertices>')
    x+= [f'<vertex x="{a:.4f}" y="{b:.4f}" z="{c:.4f}"/>' for a,b,c in V]
    x.append('</vertices><triangles>')
    x+= [f'<triangle v1="{a}" v2="{b}" v3="{c}" pid="1" p1="{i}"/>' for (a,b,c),i in zip(Fc,inv)]
    x.append('</triangles></mesh></object>\n</resources>\n<build><item objectid="2"/></build>\n</model>\n')
    with zipfile.ZipFile(f'vollfarbe/{k}.3mf','w',zipfile.ZIP_DEFLATED) as z:
        z.writestr('[Content_Types].xml','<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>')
        z.writestr('_rels/.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>')
        z.writestr('3D/3dmodel.model',''.join(x))
    print(k,'vollfarbe',len(Fc),t.is_watertight)
