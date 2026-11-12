import base64
t=open('template.html').read()
earth='data:image/jpeg;base64,'+base64.b64encode(open('../ellipse/earth.jpg','rb').read()).decode()
t=t.replace('__EARTH__',earth)
open('tellurium.html','w').write(t.replace('__THREE__','https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js').replace('__ADDONS__','https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/'))
b=lambda p:'data:text/javascript;base64,'+base64.b64encode(open(p,'rb').read()).decode()
off=t.replace('"three/addons/":"__ADDONS__"','"three/addons/controls/OrbitControls.js":"'+b('node_modules/three/examples/jsm/controls/OrbitControls.js')+'"').replace('__THREE__',b('node_modules/three/build/three.module.min.js'))
open('tellurium_offline.html','w').write(off)
