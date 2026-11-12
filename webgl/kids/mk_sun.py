import numpy as np
from PIL import Image
W,H=1024,512;rng=np.random.default_rng(7)
lon=np.linspace(0,2*np.pi,W,endpoint=False);lat=np.linspace(np.pi/2,-np.pi/2,H)
LO,LA=np.meshgrid(lon,lat);P=np.stack([np.cos(LA)*np.cos(LO),np.cos(LA)*np.sin(LO),np.sin(LA)],-1)
def cells(n,s):
    from scipy.spatial import cKDTree
    pts=rng.normal(size=(n,3));pts/=np.linalg.norm(pts,axis=1)[:,None]
    dd,_=cKDTree(pts).query(P.reshape(-1,3),k=2);dd=dd.reshape(H,W,2)
    return np.clip((dd[...,1]-dd[...,0])*s,0,1)
g=0.6*cells(6000,25)+0.4*cells(1500,12)
spots=0
for _ in range(5):
    c=rng.normal(size=3);c[2]*=0.4;c/=np.linalg.norm(c);spots+=np.exp(-np.linalg.norm(P-c,axis=-1)**2/0.002)
v=np.clip(g*(1-0.7*np.clip(spots,0,1)),0,1)[...,None]
col=np.array([0.55,0.08,0.0])*(1-v)+np.array([1.0,0.55,0.12])*v+np.array([0.0,0.25,0.15])*v**4
Image.fromarray((np.clip(col,0,1)*255).astype(np.uint8)).save('sun.jpg',quality=85)
