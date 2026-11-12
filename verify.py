import trimesh,glob,os
print(f"{'Teil':20s} {'X':>6} {'Y':>6} {'Z':>6} wasserdicht  passt250x210  Vol_cm3")
for f in sorted(glob.glob('stl/*.stl')):
    m=trimesh.load(f); e=m.extents; s=sorted(e[:2])
    fit = (max(s)<=250 and min(s)<=210 and e[2]<=250)
    print(f"{os.path.basename(f)[:-4]:20s} {e[0]:6.1f} {e[1]:6.1f} {e[2]:6.1f} {str(m.is_watertight):10s} {str(fit):12s} {m.volume/1000:6.1f}")
