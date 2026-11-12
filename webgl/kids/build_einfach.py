import base64,os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
t=open('einfach_template.html').read()
t=t.replace('__EARTH__','data:image/jpeg;base64,'+base64.b64encode(open('../../ellipse/earth.jpg','rb').read()).decode())
t=t.replace('__SUN__','data:image/jpeg;base64,'+base64.b64encode(open('sun_tex.jpg','rb').read()).decode())
b=lambda p:'data:text/javascript;base64,'+base64.b64encode(open(p,'rb').read()).decode()
# prefer local node_modules, fall back to webgl/offline copies
import os.path as op
three=('../node_modules/three/build/three.module.min.js' if op.exists('../node_modules/three/build/three.module.min.js') else '../offline/three.module.min.js')
orbit=('../node_modules/three/examples/jsm/controls/OrbitControls.js' if op.exists('../node_modules/three/examples/jsm/controls/OrbitControls.js') else '../offline/OrbitControls.js')
t=t.replace('"three/addons/":"__ADDONS__"','"three/addons/controls/OrbitControls.js":"'+b(orbit)+'"').replace('__THREE__',b(three))
open('tellurium_einfach.html','w').write(t)
print('wrote tellurium_einfach.html', len(t), 'bytes')
