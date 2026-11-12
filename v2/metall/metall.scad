// 2D-Konturen (DXF) fuer Laserschnitt aus 3 mm Messing. Bohrungen = Laser-Vormass (Endmass - 0,2), danach reiben.
include <../tellurium_v2.scad>
W_SP=3.5;          // Speichen fuer Metall etwas breiter (>= Blechdicke)
part="none"; P="";
BV=0.2;            // Vormass fuer Reiben
module g2(z,x,bore) projection(cut=true) translate([0,0,-T/2]) zr(z,x,bore-BV);
if(P=="sonnenrad48")   g2(zF,xF,8);
if(P=="erdhalterrad48")g2(zE,xE,8);
if(P=="parallelrad32") g2(zI,xI,8);
if(P=="zentralrad68")  g2(zC2,xC2,8);
if(P=="zentralritzel12") g2(zC1,xC1,6);
if(P=="zwischenrad66") g2(zW2,xW2,8);
if(P=="zwischenritzel12") g2(zW1,xW1,4);
if(P=="kurbelrad34")   g2(zK,xK,4);
if(P=="umkehrrad16")   g2(zJ,xJ,3);
if(P=="erdritzel14")   g2(zS,xS,3);
if(P=="kurbelritzel10")g2(zP,xP,4);
if(P=="mondritzel11")  g2(zW3,xW3,4);
if(P=="mondrad69")     g2(zMo,xMo,8.4);
if(P=="arm")     projection(cut=true) translate([0,0,-1]) arm();   // Schnitt im Lagersitz: Ø19 H7 fuer 626ZZ (Lager in Messingbuchse, s. README)
if(P=="mondarm") projection(cut=true) translate([0,0,-1]) mondarm();
