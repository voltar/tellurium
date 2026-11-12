import numpy as np, math, sys, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W,H=1280,720; S=2; WW,HH=W*S,H*S
F=lambda s,b=False: ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf'%('-Bold' if b else ''),s)
tex=np.asarray(Image.open('earth.jpg').convert('RGB')).astype(np.float32)/255
TH,TW=tex.shape[:2]
EPS=math.radians(23.44); LP=math.radians(102.9)
E_VIS=0.25; E_REAL=0.0167; A=4.3
RS,RE,RM,RMO=0.62,0.40,0.12,0.80
POLE=np.array([0,math.sin(EPS),math.cos(EPS)])  # tilted toward lon 90 => toward sun at June solstice (Earth at L=270)
# camera
az=LP+math.pi/2+math.pi; el=math.radians(40); dist=15
cpos=dist*np.array([math.cos(el)*math.cos(az),math.cos(el)*math.sin(az),math.sin(el)])
fwd=-cpos/np.linalg.norm(cpos); right=np.cross(fwd,[0,0,1]); right/=np.linalg.norm(right); up=np.cross(right,fwd)
FOC=1180*S; CX,CY=WW*0.58,HH*0.45
shift=np.array([-A*E_VIS*0.0,0,0])
def proj(p):
    d=np.asarray(p)-cpos; z=d@fwd
    return CX+FOC*(d@right)/z, CY-FOC*(d@up)/z, z
def kepler(M,e):
    E=M.copy() if isinstance(M,np.ndarray) else M
    for _ in range(30): E=E-(E-e*np.sin(E)-M)/(1-e*np.cos(E))
    return E
def nu_of_M(M,e):
    E=kepler(M,e); return 2*np.arctan2(math.sqrt(1+e)*np.sin(E/2),math.sqrt(1-e)*np.cos(E/2))
def pos(nu,e=E_VIS):
    r=A*(1-e*e)/(1+e*np.cos(nu)); L=nu+LP
    return np.stack([r*np.cos(L),r*np.sin(L),0*r],-1)
MON=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']
ML=[31,28,31,30,31,30,31,31,30,31,30,31]
def real_date(nu):  # real calendar date at which Earth has this true anomaly (real e)
    e=E_REAL; E=2*math.atan2(math.sqrt(1-e)*math.sin(nu/2),math.sqrt(1+e)*math.cos(nu/2))
    M=E-e*math.sin(E); d=(M/(2*math.pi)*365.25+2.5)%365.25
    m=0
    while m<11 and d>=ML[m]: d-=ML[m]; m+=1
    return int(d)+1,m
# ---------- static background ----------
rng=np.random.default_rng(3)
bg=Image.new('RGB',(WW,HH),(4,5,12)); dr=ImageDraw.Draw(bg)
for _ in range(1400):
    x,y=rng.uniform(0,WW),rng.uniform(0,HH); b=int(rng.uniform(40,220)*rng.uniform(.3,1)); r=rng.choice([1,1,1,2,3])
    dr.ellipse([x-r,y-r,x+r,y+r],fill=(b,b,int(b*1.05)))
bg=bg.filter(ImageFilter.GaussianBlur(0.8)); dr=ImageDraw.Draw(bg)
nus=np.linspace(0,2*np.pi,721)
def poly(pts): return [tuple(proj(p)[:2]) for p in pts]
# comparison circle (same semi-major axis, centred at ellipse centre)
cen=-np.array([A*E_VIS*math.cos(LP),A*E_VIS*math.sin(LP),0])
circ=[cen+A*np.array([math.cos(t),math.sin(t),0]) for t in nus]
cp=poly(circ)
for i in range(0,720,8): dr.line(cp[i:i+5],fill=(110,110,140),width=2*S)
# brass ring (double line)
for k,(w,c) in enumerate([(14,(90,62,20)),(8,(205,160,70)),(3,(255,225,140))]):
    dr.line(poly(pos(nus)),fill=c,width=w*S//2*2//2*1+0,joint='curve')
def mark(p,txt,col,dy=0,anchor='mm',fs=17):
    x,y,_=proj(p); dr.ellipse([x-6*S,y-6*S,x+6*S,y+6*S],fill=col,outline=(30,20,5))
    if txt: dr.multiline_text((x,y+dy*S),txt,font=F(fs*S),fill=col,anchor=anchor,align='center')
# centre and empty focus
x,y,_=proj(cen); dr.line([x-7*S,y,x+7*S,y],fill=(150,150,170),width=2*S); dr.line([x,y-7*S,x,y+7*S],fill=(150,150,170),width=2*S)
dr.text((x,y-16*S),'Mittelpunkt',font=F(13*S),fill=(150,150,170),anchor='mm')
f2=2*cen; x,y,_=proj(f2); dr.ellipse([x-6*S,y-6*S,x+6*S,y+6*S],outline=(170,170,190),width=2*S)
dr.text((x,y+18*S),'leerer Brennpunkt',font=F(13*S),fill=(170,170,190),anchor='mm')
# major axis faint
p1,p2=proj(pos(0.0)),proj(pos(math.pi)); dr.line([p1[:2],p2[:2]],fill=(80,70,50),width=S)
mark(pos(0.0),'Perihel ~147 Mio. km\nAnfang Januar\n(~3. Jan.)',(255,200,110),dy=-70)
mark(pos(math.pi),'Aphel ~152 Mio. km\nAnfang Juli (~4. Juli)',(255,200,110),dy=48)
for L,t,ox,oy,an in [(math.pi/2,'Wintersonnenwende\n~21. Dez.',22,26,'lm'),(math.pi,'Frühlings-Tagundnachtgleiche ~20. März',0,-22,'mm'),(1.5*math.pi,'Sommersonnenwende\n~21. Juni',-22,0,'rm'),(0,'Herbst-Tagundnachtgleiche ~23. Sept.',0,-26,'mm')]:
    p=pos(L-LP); x,y,_=proj(p); dr.ellipse([x-5*S,y-5*S,x+5*S,y+5*S],fill=(140,200,255))
    dr.multiline_text((x+ox*S,y+oy*S),t,font=F(14*S),fill=(150,205,255),anchor=an,align='center')
# ---------- sphere renderer ----------
def sphere(img,glow,c,R,kind,sun=None,spin=0):
    x0,y0,z=proj(c); rp=FOC*R/z
    xa,xb=int(max(0,x0-rp-2)),int(min(WW,x0+rp+3)); ya,yb=int(max(0,y0-rp-2)),int(min(HH,y0+rp+3))
    if xa>=xb or ya>=yb: return
    X,Y=np.meshgrid(np.arange(xa,xb)+.5,np.arange(ya,yb)+.5)
    dx=(X-x0)/rp; dy=-(Y-y0)/rp; rr=dx*dx+dy*dy
    a=np.clip((1-np.sqrt(rr))*rp+0.5,0,1)[...,None]
    dz=np.sqrt(np.clip(1-rr,0,1))
    n=dx[...,None]*right+dy[...,None]*up-dz[...,None]*fwd
    reg=img[ya:yb,xa:xb]
    if kind=='sun':
        limb=(0.55+0.45*dz)[...,None]
        col=np.array([1.0,0.82,0.35])*limb+np.array([0,0.15,0.3])*dz[...,None]**3
        noise=1+0*dx
        col=np.clip(col*noise[...,None],0,1)
    else:
        Ld=sun-c; Ld/=np.linalg.norm(Ld)
        lam=n@Ld
        if kind=='earth':
            zb=POLE; xb0=np.array([1,0,0.]); xb0=xb0-zb*(xb0@zb); xb0/=np.linalg.norm(xb0); yb0=np.cross(zb,xb0)
            xr=math.cos(spin)*xb0+math.sin(spin)*yb0; yr=np.cross(zb,xr)
            lat=np.arcsin(np.clip(n@zb,-1,1)); lon=np.arctan2(n@yr,n@xr)
            u=((lon/(2*np.pi)+0.5)*TW).astype(int)%TW; v=np.clip(((0.5-lat/np.pi)*TH).astype(int),0,TH-1)
            base=tex[v,u]**0.9*1.15
            night=base*np.array([0.06,0.07,0.12])
            day=np.clip(lam,0,1)[...,None]
            t=np.clip((lam+0.08)/0.16,0,1)[...,None]
            col=night*(1-t)+base*(0.15+0.95*day)*t
            col+=np.array([0.25,0.45,1.0])*((1-dz)**3)[...,None]*0.6*np.clip(lam+0.3,0,1)[...,None]
            sp=np.clip((2*lam[...,None]*n-Ld)@(-fwd),0,1)**30
            col+=0.25*sp[...,None]*(t)
        else:
            base=np.array([0.78,0.78,0.80])*(0.85+0.15*np.sin(dx*9)*np.cos(dy*7))[...,None]
            t=np.clip((lam+0.05)/0.1,0,1)[...,None]
            col=base*(0.04+(np.clip(lam,0,1)[...,None]*0.96))*t+base*0.04*(1-t)
    reg[:]=reg*(1-a)+np.clip(col,0,1)*a
    if kind=='earth':
        # pin on Switzerland
        la,lo=math.radians(46.8),math.radians(8.2)
        pw=math.cos(la)*(math.cos(lo)*xr+math.sin(lo)*yr)+math.sin(la)*zb
        if pw@(-fwd)>0.05:
            base_p=c+pw*R; tip=c+pw*R*1.55
            return (proj(base_p),proj(tip))
    return None
GL=None
def frame(t):
    M=2*np.pi*t; nu=float(nu_of_M(np.array(M),E_VIS)); pe=pos(np.array(nu)).astype(float)
    img=Image.fromarray(BG2.copy()) if False else bg.copy()
    d=ImageDraw.Draw(img)
    sun=np.zeros(3)
    # radius vector arm (brass)
    s2,e2=proj(sun),proj(pe); d.line([s2[:2],e2[:2]],fill=(170,125,45),width=5*S)
    # moon orbit ring
    mp=[pe+RMO*np.array([math.cos(q),math.sin(q),0]) for q in np.linspace(0,2*np.pi,121)]
    d.line(poly(mp),fill=(215,218,225),width=3*S)
    # sun glow
    arr=np.asarray(img).astype(np.float32)/255
    X,Y=np.meshgrid(np.arange(WW),np.arange(HH),sparse=True)
    sx,sy,sz=proj(sun); rs=FOC*RS/sz
    rr=np.sqrt((X-sx)**2+(Y-sy)**2)/rs
    g=0.9*np.exp(-(rr-1)*1.6)*(rr>1)+0.0
    arr=np.clip(arr+np.clip(g,0,1.2)[...,None]*np.array([1,0.65,0.25])*0.75,0,1)
    # moon
    Lsun=math.atan2(-pe[1],-pe[0]); phase=2*np.pi*12.37*t
    ma=Lsun+phase+math.pi  # t=0 full moon-ish offset
    mpos=pe+RMO*np.array([math.cos(ma),math.sin(ma),0])
    spin=2*np.pi*20*t
    objs=sorted([(proj(sun)[2],'sun',sun,RS),(proj(pe)[2],'earth',pe,RE),(proj(mpos)[2],'moon',mpos,RM)],key=lambda o:-o[0])
    pin=None
    for _,k,c,R in objs:
        r=sphere(arr,None,c,R,k,sun,spin if k!='sun' else t*40)
        if k=='earth': pin=r
    img=Image.fromarray((arr*255).astype(np.uint8)); d=ImageDraw.Draw(img)
    # axis line through earth
    a1,a2=proj(pe-POLE*RE*1.7),proj(pe+POLE*RE*1.7)
    # draw only parts outside disk approx: simple full line with cap
    d.line([a2[:2],proj(pe+POLE*RE)[:2]],fill=(220,190,110),width=3*S)
    if proj(pe-POLE*RE)[2]>proj(pe)[2]-0 or True:
        pass
    d.ellipse([a2[0]-5*S,a2[1]-5*S,a2[0]+5*S,a2[1]+5*S],fill=(205,160,70))
    d.text((a2[0]+8*S,a2[1]-4*S),'N',font=F(13*S,True),fill=(230,210,150),anchor='lm')
    if pin:
        (b,tp)=pin; d.line([b[:2],tp[:2]],fill=(230,230,230),width=2*S)
        d.ellipse([tp[0]-6*S,tp[1]-6*S,tp[0]+6*S,tp[1]+6*S],fill=(230,25,25),outline=(120,0,0))
    img=img.resize((W,H),Image.LANCZOS); d=ImageDraw.Draw(img)
    d.text((24,18),'Tellurium – elliptische Erdbahn nach Kepler',font=F(26,True),fill=(240,205,120))
    dd,mm=real_date(nu)
    d.text((24,56),f'{dd}. {MON[mm]}',font=F(30,True),fill=(255,255,255))
    r_real=1.496e8*(1-E_REAL**2)/(1+E_REAL*math.cos(nu))
    v=29.78*math.sqrt(2*1.496e8/r_real-1)
    d.text((24,96),f'Abstand Sonne–Erde: {r_real/1e6:.1f} Mio. km\nBahngeschwindigkeit: {v:.2f} km/s',font=F(16),fill=(200,210,230),spacing=4)
    notes=['Exzentrizität zur Verdeutlichung übertrieben (real: 0,0167; hier 0,25)',
           'Gestrichelt: Kreis zum Vergleich · Sonne in einem Brennpunkt',
           '2. Keplersches Gesetz: In gleichen Zeiten überstreicht der Fahrstrahl gleiche Flächen –',
           'nahe dem Perihel läuft die Erde schneller, nahe dem Aphel langsamer.',
           'Erdachse 23,44° geneigt, raumfest · Eigendrehung stark verlangsamt (20 statt 365 pro Jahr)',
           'Mond: 12,37 synodische Monate pro Jahr · Größen und Abstände nicht maßstäblich · rote Nadel: Schweiz']
    ov=Image.new('RGBA',(W,H));od=ImageDraw.Draw(ov);od.rectangle([14,H-24-18*len(notes),720,H-10],fill=(0,0,0,150));img.paste(ov,(0,0),ov);d=ImageDraw.Draw(img)
    for i,s in enumerate(notes): d.text((24,H-20-18*(len(notes)-i)),s,font=F(14),fill=(185,185,200) if i else (255,190,90))
    return img
if __name__=='__main__':
    os.makedirs('frames',exist_ok=True)
    mode=sys.argv[1]
    if mode=='test':
        for name,t in [('peri',0.0),('aph',0.5),('wsw',0.97),('ssw',0.47),('spring',0.21)]:
            frame(t).save(f'v5_{name}.png')
    else:
        a,b,N=int(sys.argv[2]),int(sys.argv[3]),540
        for i in range(a,b): frame(i/N).save(f'frames/f{i:04d}.png')
