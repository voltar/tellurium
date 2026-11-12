import os; os.environ['PYOPENGL_PLATFORM']='egl'
import numpy as np, trimesh, pyrender, sys
from PIL import Image
T=23.44; K=[-36.25,0]; J=[-8.99706,15.542]; W=[50,0]; E=[100,0]; O=[0,0]
ZH,ZB3,ZB2,ZB1,ZA,ZL1,ZL2,ZMT,ZCAP=98,100,108.5,117,125.5,135,143.5,156,163.5
JC=np.array([100,0,178.5]); EC=np.array([100,16.7071,217.034]); SC=np.array([0,0,EC[2]])
BRASS=(0.78,0.6,0.28); DARK=(0.09,0.08,0.075); SIL=(0.85,0.86,0.88)
def Rz(a): return trimesh.transformations.rotation_matrix(np.radians(a),[0,0,1])
def Rx(a): return trimesh.transformations.rotation_matrix(np.radians(a),[1,0,0])
def Tr(v): return trimesh.transformations.translation_matrix(v)
P=[ # name, pos, z, explode-mult, rotz, colour, metal, rough
 ('sockel',O,0,0,0,DARK,0.2,0.45),('datumsring_inlay',O,0,0,0,BRASS,1,0.3),
 ('huelse',O,ZH,0.5,0,SIL,1,0.3),('zentralrad',O,ZB2,-3,0,BRASS,1,0.3),
 ('kurbelrad34',K,ZB1,-1,0,BRASS,1,0.3),('umkehrrad',J,ZB1,-1,0,BRASS,1,0.3),
 ('arm',O,ZA,0,0,DARK,0.3,0.4),('sonnenrad',O,ZL1,2,0,BRASS,1,0.28),
 ('parallelrad',W,ZL1,2,180/32,BRASS,1,0.3),('erdhalterrad',E,ZL1,2,0,BRASS,1,0.3),
 ('kurbelritzel',K,ZL1,2,0,BRASS,1,0.3),('zwischenwelle_rad',W,ZB3,-5,0,BRASS,1,0.3),
 ('mondritzel',W,ZL2,4,0,BRASS,1,0.3),('erdritzel',E,ZB3,-5,0,BRASS,1,0.3),
 ('erdachsrohr',E,ZA,1,0,SIL,1,0.3),('mondrad',E,ZL2,4,180/69,BRASS,1,0.3),
 ('mondarm',E,ZMT,6,-35,SIL,1,0.25),('neigungskopf',E,ZCAP,7,0,BRASS,1,0.3),
 ('kurbelknopf',K,ZL2+7+3,5,0,DARK,0.2,0.4)]
def mat(c,m,r): return pyrender.MetallicRoughnessMaterial(baseColorFactor=(*c,1),metallicFactor=m,roughnessFactor=r)
def load(n): return trimesh.load(f'stl/{n}.stl')
def scene(e=0, paint=False):
    s=pyrender.Scene(bg_color=(0.93,0.92,0.9,1),ambient_light=(0.25,0.25,0.25))
    def add(m,M,c,me=0,ro=0.5): s.add(pyrender.Mesh.from_trimesh(m,material=mat(c,me,ro),smooth=False),pose=M)
    for n,p,z,k,rz,c,me,ro in P: add(load(n),Tr([p[0],p[1],z+k*e])@Rz(rz),c,me,ro)
    def rod(d,z0,z1,p=(0,0)):
        add(trimesh.creation.cylinder(d/2,z1-z0,sections=32),Tr([p[0],p[1],(z0+z1)/2]),SIL,1,0.2)
    rod(6,10,SC[2]);rod(4,ZB1,ZL2+7+12,K);rod(4,ZB3,ZL2+7,W);rod(3,ZB1,ZA+8,J);rod(3,ZB3,JC[2]-8,E)
    up=Tr([0,0,8*e])
    add(trimesh.creation.cylinder(1.5,57,sections=24),up@Tr(JC)@Rx(-T)@Tr([0,0,25]),SIL,1,0.2)
    add(trimesh.creation.icosphere(3,4.5),up@Tr(JC),(0.3,0.3,0.32),1,0.3)
    SUN=(1.0,0.55,0.12); EO=(0.12,0.3,0.6); EL=(0.25,0.5,0.22); MO=(0.8,0.8,0.82)
    sb=up@Tr(SC); flip=Rx(180)
    if paint:
        add(load('mal_sonne_oben'),sb,SUN,0,0.6); add(load('mal_sonne_unten'),sb@flip,SUN,0,0.6)
    else:
        add(load('sonne_oben'),sb,SUN,0,0.6); add(load('sonne_unten'),sb@flip,SUN,0,0.6)
    eb=up@Tr(EC)@Rx(-T)
    add(load('erde_oben_ozean'),eb,EO,0,0.35); add(load('erde_unten_ozean'),eb@flip,EO,0,0.35)
    add(load('erde_oben_land'),eb,EL,0,0.7); add(load('erde_unten_land'),eb@flip,EL,0,0.7)
    a=np.radians(-35); mp=np.array([100+52*np.cos(a),52*np.sin(a)])
    add(trimesh.creation.cylinder(1,EC[2]-ZMT,sections=16),up@Tr([mp[0],mp[1],(EC[2]+ZMT)/2]),SIL,1,0.2)
    add(load('mond'),up@Tr([mp[0],mp[1],EC[2]]),MO,0.6,0.4)
    return s
def look(eye,tgt):
    eye=np.array(eye,float); f=np.array(tgt)-eye; f/=np.linalg.norm(f)
    r=np.cross(f,[0,0,1]); r/=np.linalg.norm(r); u=np.cross(r,f)
    M=np.eye(4); M[:3,0]=r; M[:3,1]=u; M[:3,2]=-f; M[:3,3]=eye; return M
def shot(s,eye,tgt,fn,yf=np.pi/7,W=1600,H=1200):
    cam=s.add(pyrender.PerspectiveCamera(yfov=yf),pose=look(eye,tgt))
    for ld in [([300,-400,600],5),([-500,200,300],2),([100,500,200],1.5)]:
        s.add(pyrender.DirectionalLight(intensity=ld[1]),pose=look(ld[0],[0,0,0]))
    r=pyrender.OffscreenRenderer(W,H); c,_=r.render(s,flags=pyrender.RenderFlags.SHADOWS_DIRECTIONAL); r.delete()
    Image.fromarray(c).save('renders/'+fn); print(fn)
shot(scene(),[430,-520,380],[20,0,120],'gesamt.png')
shot(scene(),[-380,-420,300],[20,0,130],'gesamt_links.png')
shot(scene(),[220,-120,260],[100,10,205],'detail_erde.png',np.pi/9)
shot(scene(),[180,-260,90],[30,0,135],'detail_getriebe.png',np.pi/8)
shot(scene(),[0,-1,700],[0,0,0],'draufsicht_datumsring.png',np.pi/5)
shot(scene(e=10),[520,-620,420],[20,0,150],'explosion.png')
shot(scene(paint=True),[220,-120,260],[100,10,205],'detail_mal_variante.png',np.pi/9)
