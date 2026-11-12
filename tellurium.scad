// =====================================================================
//  Tellurium (Sonne-Erde-Mond) mit echtem Zahnradgetriebe
//  Parametrisch, OpenSCAD >= 2021 + BOSL2 (https://github.com/BelfrySCAD/BOSL2)
//  Alle Maße in mm. Modul m = 1, Eingriffswinkel 20°.
//
//  part = "assembly" | "exploded" | "gears" | <Teilname> (siehe ganz unten)
// =====================================================================
include <BOSL2/std.scad>
include <BOSL2/gears.scad>

part = "assembly";
$fn = 64;

// ---------- Globale Parameter ----------
M      = 1;       // Modul
PA     = 20;      // Eingriffswinkel
BL     = 0.15;    // Flankenspiel (Backlash) je Zahnpaar
T      = 6;       // Zahnradbreite
G      = 1.5;     // Abstand zwischen Zahnradebenen
CL     = 0.25;    // Spiel für Bohrungen (lose Passung)
TILT   = 23.44;   // Achsneigung der Erde
D_ROD  = 6;       // Zentralachse (Silberstahl 6 mm)
D_SH   = 4;       // Kurbel- und Zwischenwelle (4 mm)
D_ES   = 3;       // Erd-Drehwelle / Erdachse (3 mm)
D_MR   = 2;       // Mondstab (2 mm)

// ---------- Zähnezahlen & Profilverschiebungen (x*m) ----------
// Parallelführung (Ebene L1, über dem Arm): F fest, I Zwischenrad, E Erdhalter
zF=48; xF=-0.4;   zI=32; xI=0.4;   zE=48; xE=-0.4;
zP=10; xP= 0.4;                     // Kurbelritzel kämmt mit F
// Tages-Getriebe (unter dem Arm)
zK=34; xK=0;   zJ=16; xJ=0.1;  zC1=12; xC1=0.3;   // Ebene B1: Kurbelrad -> Umkehrrad J -> Zentralritzel
zC2=68; xC2=-0.3; zW1=12; xW1=0.3;                 // Ebene B2: Zentralrad -> Zwischenwellenritzel
zW2=66; xW2=-0.2; zS=14;  xS=0.2;                  // Ebene B3: Zwischenwellenrad -> Erdritzel
// Mond-Getriebe (Ebene L2, über dem Arm)
zW3=11; xW3=0.4; zMo=69; xMo=-0.4;

// ---------- Achsabstände ----------
function cd(z1,z2,x1,x2) = gear_dist(mod=M, teeth1=z1, teeth2=z2, profile_shift1=x1, profile_shift2=x2);
A_FI = cd(zF,zI,xF,xI);          // 40
A_IE = cd(zI,zE,xI,xE);          // 40
R_E  = A_FI + A_IE;              // Bahnradius der Erde = 80
A_FP = cd(zF,zP,xF,xP);          // 29
A_KJ = cd(zK,zJ,xK,xJ);
A_JC = cd(zJ,zC1,xJ,xC1);
// Lage des Umkehrrades J (Dreieck Zentrum O, Kurbel K)
jx = (A_JC*A_JC - A_KJ*A_KJ + A_FP*A_FP)/(2*A_FP);
POS_O = [0,0];   POS_K = [-A_FP,0];   POS_W = [A_FI,0];   POS_E = [R_E,0];
POS_J = [-jx, sqrt(A_JC*A_JC - jx*jx)];
echo(str("CHECK A_FI=",A_FI," A_IE=",A_IE," A_FP=",A_FP,
  " A_C2W1=",cd(zC2,zW1,xC2,xW1)," A_W2S=",cd(zW2,zS,xW2,xS),
  " A_W3Mo=",cd(zW3,zMo,xW3,xMo)," A_KJ=",A_KJ," A_JC=",A_JC," J=",POS_J,
  " |J-K|=",norm(POS_J-POS_K)));

// ---------- Höhen (Unterkanten) ----------
Z_HUB = 50;               // Oberkante Sockelsäule
Z_B3  = 52;               // Zwischenwellenrad 66 / Erdritzel 14
Z_B2  = Z_B3+T+G;         // Zentralrad 68 / Ritzel 12
Z_B1  = Z_B2+T+G;         // Kurbelrad 34 / J / Zentralritzel 12
Z_ARM = Z_B1+T+G;  ARM_T = 8;
Z_L1  = Z_ARM+ARM_T+1.5;  // F48, I32, E48, P10
Z_L2  = Z_L1+T+G;         // Mondritzel 11 / Mondrad 69
Z_MT  = Z_L2+T+5.5;       // Oberkante Mondrohr / Mondarm-Nabe (Unterkante)
Z_CAP = Z_MT+7.5;         // Neigungskopf
JC    = [R_E,0,Z_CAP+15]; // Mittelpunkt Kardangelenk
L_EA  = 30;               // Abstand Gelenk -> Erdmittelpunkt
EARTH_C = JC + L_EA*[0,sin(TILT),cos(TILT)];
D_SUN=50; D_EARTH=24; D_MOON=10; R_MOON=40;
SUN_C = [0,0,EARTH_C.z];

// ---------- Grundbausteine ----------
module zr(z,x,bore,th=T) spur_gear(mod=M, teeth=z, thickness=th, shaft_diam=bore,
    profile_shift=x, pressure_angle=PA, backlash=BL, anchor=BOT);
module tube(od,id,h) difference(){ cylinder(d=od,h=h); translate([0,0,-1]) cylinder(d=id,h=h+2); }
module grub_hole(zc,len=15) translate([0,0,zc]) rotate([0,90,0]) cylinder(d=2.5,h=len,$fn=16); // M3-Madenschraube direkt ins PLA

// ---------- Teile ----------
module sockel(){   // 200x200 Grundplatte mit Säule, Zentralachse eingepresst + M3 Madenschraube
  difference(){
    union(){
      cuboid([200,200,8], rounding=6, edges="Z", anchor=BOT);
      cylinder(d1=60,d2=30,h=20);
      cylinder(d=30,h=Z_HUB);
    }
    translate([0,0,10]) cylinder(d=D_ROD+0.1,h=100);
    grub_hole(35,20);
    for(sx=[-1,1],sy=[-1,1]) translate([sx*85,sy*85,-1]) cylinder(d=10.5,h=2.5); // Gummifüße
  }
}
module huelse() tube(9.6, D_ROD+0.3, Z_B2-Z_HUB-0.5);            // Distanzhülse
module zentralrad(){ // Doppelrad 68/12, lose auf der Zentralachse
  difference(){ union(){ zr(zC2,xC2,0); translate([0,0,T-0.01]) cylinder(d=9,h=G+0.02); translate([0,0,T+G]) zr(zC1,xC1,0);}
    translate([0,0,-1]) cylinder(d=D_ROD+0.3,h=50); }
}
module kurbelrad34() zr(zK,xK,D_SH);
module umkehrrad()   difference(){ zr(zJ,xJ,0); translate([0,0,-1]) cylinder(d=D_ES+0.3,h=20);}
module kurbelritzel() difference(){ union(){ zr(zP,xP,0); } translate([0,0,-1]) cylinder(d=D_SH,h=20);}
module kurbelknopf(){ // Drehrad Ø36 mit Griffzapfen
  difference(){ union(){ cyl(d=36,h=6,rounding=1.5,anchor=BOT); translate([12,0,0]) cyl(d=8,h=22,rounding2=3,anchor=BOT);
      cylinder(d=12,h=10);}
    translate([0,0,-1]) cylinder(d=D_SH,h=30); grub_hole(7,10);}
}
module arm(){ // Jahresarm, 626-Lager im Zentrum (Lager von unten einpressen, Schulter oben)
  difference(){
    hull(){ cylinder(r=17,h=ARM_T); translate(POS_K) cylinder(r=9,h=ARM_T);
            translate(POS_J) cylinder(r=5,h=ARM_T); translate(POS_E) cylinder(r=9,h=ARM_T); }
    translate([0,0,-1]) cylinder(d=19.1,h=6+1);          // 626ZZ 6x19x6
    translate([0,0,-1]) cylinder(d=12,h=20);
    translate(concat(POS_K,-1)) cylinder(d=D_SH+CL,h=20);
    translate(concat(POS_W,-1)) cylinder(d=D_SH+CL,h=20);
    translate(concat(POS_J,-1)) cylinder(d=D_ES-0.1,h=20);  // Stift J eingepresst
    translate(concat(POS_E,-1)) cylinder(d=8+CL,h=20);      // Erdachsrohr
    // Gewichtserleichterung
    for(x=[22,58]) translate([x,0,-1]) cyl(d=14,h=20,anchor=BOT);
  }
}
module sonnenrad() difference(){ union(){ zr(zF,xF,0); cylinder(d=14,h=T+G+T);} translate([0,0,-1]) cylinder(d=D_ROD+0.05,h=30); grub_hole(T+G+T/2);}
module parallelrad() zr(zI,xI,D_SH+CL);
module erdhalterrad() difference(){ zr(zE,xE,0); translate([0,0,-1]) cylinder(d=8,h=20);}  // aufs Erdachsrohr kleben
module zwischenwelle_rad() difference(){ union(){ zr(zW2,xW2,0); translate([0,0,T-0.01]) cylinder(d=9,h=G+0.02); translate([0,0,T+G]) zr(zW1,xW1,0);}
    translate([0,0,-1]) cylinder(d=D_SH,h=50);}
module mondritzel() difference(){ zr(zW3,xW3,0); translate([0,0,-1]) cylinder(d=D_SH,h=20);}
module erdritzel() difference(){ union(){ zr(zS,xS,0); cylinder(d=9,h=Z_ARM-Z_B3-0.5);} translate([0,0,-1]) cylinder(d=D_ES,h=50);}
L_HT = Z_CAP+6 - Z_ARM;
module erdachsrohr() tube(8, D_ES+0.4, L_HT);
module mondrad() difference(){ union(){ zr(zMo,xMo,0); cylinder(d=13,h=Z_MT+6-Z_L2);} translate([0,0,-1]) cylinder(d=8+0.4,h=60);}
module mondarm(){
  difference(){
    union(){ cylinder(d=20,h=6); translate([0,-4,0]) cube([R_MOON,8,6]); translate([R_MOON,0,0]) cylinder(d=9,h=10);}
    translate([0,0,-1]) cylinder(d=13+CL,h=10);
    translate([R_MOON,0,-1]) cylinder(d=D_MR,h=20);
    translate([0,0,3]) rotate([0,-90,0]) cylinder(d=2.5,h=15,$fn=16);
  }
}
module neigungskopf(){ // sitzt fest auf dem Erdachsrohr, enthält Kardangelenk, hält Erdachse unter 23,44°
  dz = JC.z - Z_CAP;
  difference(){
    union(){ cylinder(d=20,h=dz+3);
      translate([0,0,dz]) rotate([-TILT,0,0]) cylinder(d=12,h=16); }
    translate([0,0,-1]) cylinder(d=8+0.1,h=7);                // Rohr
    translate([0,0,5.5]) cylinder(d=14,h=dz+3);               // Gelenkraum
    translate([0,0,dz]) rotate([-TILT,0,0]) cylinder(d=14,h=7);  
    translate([0,0,dz]) rotate([-TILT,0,0]) cylinder(d=D_ES+0.25,h=30); // Erdachse
    translate([0,-12,8]) cube([24,24,dz-4],center=false);     // Montagefenster (+x Seite)
  }
}
module kugel_haelfte(d,bore,blind=false){ // Hemisphäre, flach druckbar
  difference(){ intersection(){ sphere(d=d,$fn=96); translate([0,0,d/2]) cube(d+1,center=true);}
    translate([0,0,-1]) cylinder(d=bore,h=blind? d*0.35 : d);
    translate([d*0.3,0,-1]) cylinder(d=2.2,h=3,$fn=12); }  // Pass-Stift Ø2 Loch
}
module sonne_unten() kugel_haelfte(D_SUN,D_ROD+0.1);
module sonne_oben()  kugel_haelfte(D_SUN,0.01);
module erde_unten()  kugel_haelfte(D_EARTH,D_ES+0.1);
module erde_oben()   kugel_haelfte(D_EARTH,0.01);
module mond() difference(){ sphere(d=D_MOON,$fn=48); translate([0,0,-D_MOON]) cylinder(d=D_MR,h=D_MOON); }

// ---------- Zusammenbau ----------
module place(p,z) translate(concat(p,z)) children();
module rod(d,z0,z1,p=[0,0]) color("silver") place(p,z0) cylinder(d=d,h=z1-z0);
module assembly(e=0){ // e = Explosions-Faktor
  color("SaddleBrown") sockel();
  color("gray") place(POS_O,Z_HUB+0.5*e) huelse();
  color("Gold") place(POS_O,Z_B2-3*e) zentralrad();
  color("Orange") place(POS_K,Z_B1-1*e) kurbelrad34();
  color("Tomato") place(POS_J,Z_B1-1*e) umkehrrad();
  color("SteelBlue") place(POS_O,Z_ARM) arm();
  color("Gold") place(POS_O,Z_L1+2*e) sonnenrad();
  color("Khaki") place(POS_W,Z_L1+2*e) rotate(180/zI) parallelrad();
  color("Orange") place(POS_E,Z_L1+2*e) erdhalterrad();
  color("Orange") place(POS_K,Z_L1+2*e) kurbelritzel();
  color("Goldenrod") place(POS_W,Z_B3-5*e) zwischenwelle_rad();
  color("Tomato") place(POS_W,Z_L2+4*e) mondritzel();
  color("Tomato") place(POS_E,Z_B3-5*e) erdritzel();
  color("White") place(POS_E,Z_ARM+1*e) erdachsrohr();
  color("LightSlateGray") place(POS_E,Z_L2+4*e) rotate(180/zMo) mondrad();
  color("LightSlateGray") place(POS_E,Z_MT+6*e) rotate(-35) mondarm();
  color("Ivory") place(POS_E,Z_CAP+7*e) neigungskopf();
  color("Black") place(POS_K,Z_L2+T+3+5*e) kurbelknopf();
  // Wellen
  rod(D_ROD,10,SUN_C.z);
  rod(D_SH,Z_B1,Z_L2+T+12,POS_K);
  rod(D_SH,Z_B3,Z_L2+T,POS_W);
  rod(D_ES,Z_B1,Z_ARM+ARM_T,POS_J);  // Stift J: 3x16 mm
  rod(D_ES,Z_B3,JC.z-8,POS_E);
  translate([0,0,8*e]){
    color("Gold") translate(SUN_C) sphere(d=D_SUN);
    color("RoyalBlue") translate(EARTH_C) sphere(d=D_EARTH);
    color("silver") translate(JC) rotate([-TILT,0,0]) translate([0,0,-3]) cylinder(d=D_ES,h=L_EA+15);
    color("dimgray") translate(JC) sphere(d=9);  // Kardangelenk (Kaufteil)
    m = [R_E,0,0]+R_MOON*[cos(-35),sin(-35),0];
    color("silver") translate([m.x,m.y,Z_MT]) cylinder(d=D_MR,h=EARTH_C.z-Z_MT);
    color("LightGray") translate([m.x,m.y,EARTH_C.z]) sphere(d=D_MOON);
  }
}

// ---------- Ausgabe ----------
if(part=="assembly") assembly(0);
else if(part=="exploded") assembly(6);
else if(part=="gears") difference(){ assembly(0); translate([-150,-150,Z_MT+1]) cube([400,300,200]); }
else if(part=="sockel") sockel();
else if(part=="huelse") huelse();
else if(part=="zentralrad") zentralrad();
else if(part=="kurbelrad34") kurbelrad34();
else if(part=="umkehrrad") umkehrrad();
else if(part=="kurbelritzel") kurbelritzel();
else if(part=="kurbelknopf") kurbelknopf();
else if(part=="arm") arm();
else if(part=="sonnenrad") sonnenrad();
else if(part=="parallelrad") parallelrad();
else if(part=="erdhalterrad") erdhalterrad();
else if(part=="zwischenwelle_rad") zwischenwelle_rad();
else if(part=="mondritzel") mondritzel();
else if(part=="erdritzel") erdritzel();
else if(part=="erdachsrohr") erdachsrohr();
else if(part=="mondrad") mondrad();
else if(part=="mondarm") mondarm();
else if(part=="neigungskopf") neigungskopf();
else if(part=="sonne_unten") sonne_unten();
else if(part=="sonne_oben") sonne_oben();
else if(part=="erde_unten") erde_unten();
else if(part=="erde_oben") erde_oben();
else if(part=="mond") mond();
