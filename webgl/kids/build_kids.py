import base64,os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
t=open('kinder_template.html').read()
t=t.replace('__EARTH__','data:image/jpeg;base64,'+base64.b64encode(open('../../ellipse/earth.jpg','rb').read()).decode())
b=lambda p:'data:text/javascript;base64,'+base64.b64encode(open(p,'rb').read()).decode()
t=t.replace('"three/addons/":"__ADDONS__"','"three/addons/controls/OrbitControls.js":"'+b('../node_modules/three/examples/jsm/controls/OrbitControls.js')+'"').replace('__THREE__',b('../node_modules/three/build/three.module.min.js'))
open('tellurium_kinder.html','w').write(t)
