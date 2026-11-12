# Tellurium v2 – Sonne · Erde · Mond (Messing-Instrument-Stil)

Parametrisches OpenSCAD-Modell (`tellurium_v2.scad`, BOSL2) + Python-Generator für die Himmelskörper (`bodies.py`, manifold3d/trimesh).
Hüllmaß ca. **Ø250 × 250 mm** (Sockel Ø250, Erdbahnradius 100 mm, Sonnenoberkante 250 mm).

## Gestaltung
- Runder Stufensockel Ø250 mit Rundung, Hohlkehle, Viertelstab und gedrechselter Balustersäule.
- Gravierter **Datumsring**: 365 Tagesstriche (jeder 5. länger), Monatsgrenzen, deutsche Monatsnamen (Cormorant Garamond). Die Erde steht über ihrem Datum (Draufsicht): Sommersonnenwende „Juni“ auf der −y-Seite, weil der Nordpol fest nach +y zeigt.
  Die Gravur (0,8 mm) gibt es als separates Teil `datumsring_inlay.stl` (Gold) für AMS.
- Große Räder (≥40 Zähne) als Uhrmacher-Speichenräder (6 Speichen).
- Sonne Ø66 mit Granulation (aus Sonnen-Fotokarte), Erde Ø46 mit erhabenen Kontinenten (Landmaske aus Erdkarte), Mond Ø13 mit Maria/Kratern (aus Mondkarte). Körper „schweben“ auf schlanken Stahlstäben (6 / 3 / 2 mm).
- Erdachse 23,44° geneigt, durch Parallelführung (48-32-48) raumfest. Pin-Loch Ø1,3 auf der Schweiz (47° N, 8° O) für eine Stecknadel mit rotem Kopf.

## Getriebe (Modul 1,25, 20°, Flankenspiel 0,15, Bohrungsspiel 0,25)
| Funktion | Kette | Ist | Soll | Abw. |
|---|---|---|---|---|
| Kurbel/Jahr | F48 fest → Ritzel 10 | 4,8 U | – | – |
| Erddrehung (Sonnentage/Jahr) | 34→16→12, 68→12, 66→14 | 363,31 | 365,24 | −0,53 % |
| Sterntage/Jahr | | 364,31 | 366,24 | −0,53 % |
| Mond (synodisch/Jahr) | 68→12, 11→69 | 12,286 | 12,368 | −0,67 % |
| Erdachse | 48→32→48 | 0 (raumfest) | 0 | exakt |
Kompromiss: ganzzahlige Zähne bei gleichen Achsabständen (50 mm); Mondbahnneigung (5,1°) und Bahnellipse sind nicht mechanisch abgebildet.

## Teile, Farben, Bett
Alle Teile passen auf Bambu (256³). Prusa MK4 (250×210×220): alles **außer `sockel` und `datumsring_inlay` (Ø250)** – für MK4/Mini: in der scad `D_BASE=200` setzen (Datumsring skaliert nicht automatisch: Radien 101–123 in `datumsring_2d` um ~25 mm verringern) oder XL/Core One L nutzen.
| Teil | Maße mm | Farbe | Schicht | Ausrichtung / Stützen |
|---|---|---|---|---|
| sockel | 250×250×98 | dunkel (Schwarz/Bronze) | 0,2 | Boden unten, keine |
| datumsring_inlay | 246×246×0,8 | Gold (AMS, mit Sockel als Teil desselben Objekts) | 0,2 | keine |
| zentralrad 68/12, zwischenwelle_rad 66/12, sonnenrad 48, erdhalterrad 48, mondrad 69, parallelrad 32, kurbelrad34, umkehrrad16, erdritzel14, kurbelritzel10, mondritzel11 | 15–88 Ø | Messing/Gold Silk | 0,12–0,16 | flach, keine; 4 Wände |
| arm | 155×38×8 | dunkel | 0,2 | flach, keine (626-Lager von unten) |
| neigungskopf | 32×22×20 | Gold | 0,12 | Rohrseite unten, Baumstützen |
| erdachsrohr, huelse | – | Silber | 0,16 | stehend |
| mondarm | 66×20×10 | Silber (hellsilber) | 0,16 | flach |
| kurbelknopf | 36×36×22 | dunkel | 0,16 | Scheibe unten |
| sonne_oben/unten | 66×66×33 | Gelb-Orange | 0,12 | Schnittfläche unten, keine |
| erde_*_ozean + erde_*_land | 46×46×23 | Blau + Grün (je Hälfte als 2-Teile-Objekt laden) | 0,12 | Schnittfläche unten |
| mond | 13 Ø | Silber | 0,08 | Loch unten, Mini-Brim |
| mal_* | | eine Farbe (Grau/Weiß) | 0,08–0,12 | wie oben – Malvarianten mit tieferem Relief (Sonne 1,0, Erde 1,3, Mond 0,6 mm) |
Hälften mit 2× Ø2-Passstiften (Stahl/Filament) und Sekundenkleber/2K fügen.

## Stückliste (Kaufteile)
- Silberstahl Ø6 × 230 (Sonnensäule), Ø4 × 70 (Kurbel), Ø4 × 55 (Zwischenwelle), Ø3 × 16 (Stift J), Ø3 × 85 (Erdwelle), Ø3 × 60 (Erdachse), Ø2 × 70 (Mondstab)
- 1× Kugellager 626ZZ (6×19×6) im Arm
- 1× Mini-Kardangelenk Ø9, Bohrung 3 mm (Modellbau)
- 4× M3×4 Madenschrauben (Sockel, Sonnenrad, Kurbelknopf, Mondarm), 4× Gummifüße Ø10
- Stecknadel mit rotem Kopf (Schweiz)

## Zusammenbau
1. Ø6-Stab in den Sockel, Madenschraube. 2. Hülse, Zentralrad (68 unten/12 oben). 3. Arm mit Lager aufsetzen; Kurbelwelle mit Kurbelrad34 unten, Stift J mit Umkehrrad16. 4. Zwischenwelle mit Rad 66/12 unten und Mondritzel 11 oben. 5. Erdachsrohr in den Arm, Erdritzel14 + Erdwelle unten, Erdhalterrad 48 aufs Rohr kleben. 6. Sonnenrad 48 fest auf Ø6 (Madenschraube) – Kurbelritzel und Parallelrad 32 einkämmen. 7. Mondrad 69 lose aufs Rohr, Mondarm darauf, Mondstab + Mond. 8. Neigungskopf, Kardan, Erdachse, Erde. 9. Sonne auf den Stab, Kurbelknopf. Kurbel 4,8 U = 1 Jahr.
Erde vor dem Kleben so ausrichten, dass der Nordpol zur Seite „Juni → Dezember“-Achse (+y) zeigt (Juni-Datum gegenüber).

## Malanleitung (Mal-Varianten)
1. Schleifen: Nahtlinie mit 240/400er Nassschleifpapier, Relief nur leicht.
2. Grundierung: Füller-Grundierung (Spray, grau) dünn in 2 Gängen, ggf. 600er zwischenschleifen.
3. Grundfarben: Sonne Orange-Gelb, Erde Ozean Blau / Land Grün-Ocker, Mond Mittelgrau (Airbrush oder Pinsel).
4. Washes: Sonne braun-roter Wash in die Granulation; Mond schwarzbrauner Wash in Krater/Maria; Erde dunkelblau an Küsten.
5. Trockenbürsten: Sonne hellgelb, Mond hellgrau/weiß, Erde Kontinente hell-ocker.
6. Mattlack (Spray), Sonne optional seidenmatt.

## Vollfarbdruck (i.materialise / Sculpteo / JLC3DP)
Ordner `vollfarbe/`: `sonne|erde|mond.obj + .mtl + .png` (UV-Textur, bevorzugt) und `.3mf` (Farbe je Dreieck, Fallback). Maßeinheit mm, ganze Kugeln mit Montagebohrung.
- Verfahren: PolyJet (Stratasys J-Serie, beste Farben) oder Multi Jet Fusion Full Color / Gipsdruck (ColorJet, günstiger, spröde → lackieren lassen).
- Mindestwand: PolyJet ≥1 mm, Gips ≥2 mm, MJF ≥1 mm – Kugeln sind massiv, unkritisch.
- Bohrungen: Sonne Ø6,1 (Tiefe ~50 mm), Erde Ø3,1 (Tiefe ~28) + Pin Ø1,3 Schweiz, Mond Ø2,05 (Tiefe ~6). Für Gips Bohrungen nach dem Druck aufbohren.
- Relief ist dezent (0,2–0,4 mm), Farbe kommt aus der Textur.
- **Hohl (v2.3):** Sonne Wand 2,8 mm, Erde Wand 2,5 mm (Materialise PolyJet: min. 1 mm; Stratasys: ≥2 mm für satte Farben). Volumen Sonne 150,1 → 38,5 cm³, Erde 51,7 → 16,9 cm³, Mond massiv 1,1 cm³.
  Massive Nabe um die Montagebohrung (Sonne Ø14, Erde Ø9) bis zur Kugelmitte, Erde zusätzlich massiver Zapfen Ø5 um das Schweiz-Pin-Loch.
  Fluchtlöcher für Stützmaterial: Sonne Ø6,1-Bohrung unten durchgehend bis in den Hohlraum + Ø5 am Nordpol; Erde Ø3,1-Bohrung unten + Ø5 am Nordpol (nach dem Druck mit eingefärbtem Stopfen/Spachtel verschliessen). Die Hohlkörper sind schon im Modell hohl – die Hohl-Funktion von GrabCAD funktioniert bei OBJ-Texturdateien nicht. Erzeugt mit `vollfarbe.py`.

## CNC / Metall
Räder: Messing CuZn39Pb3, 5 mm Platte, Drahterodieren oder Zahnrad-Fräsen (Modul 1,25 Abwälzfräser), Profilverschiebungen in der scad. Sockel/Säule: Drehteile (Messing oder Nussbaum + Messing-Ring mit gelasertem Datumsring). Arm: Messing 6 mm, Bohrungen H7, 626-Lager. Sonne: Messing-Drehteil gestrahlt/vergoldet; Erde: emailliert oder lackiert; Mond: Neusilber. Spiel für Metall: Flankenspiel 0,05, Bohrungen H7/g6.

## Dateien & Werkzeuge
`tellurium_v2.scad` (part="assembly"|"exploded"|Teilname), `export.sh` (alle Mechanik-STL), `bodies.py` (Körper, Mal- & Vollfarbvarianten), `render.py` (Bilder, pyrender), `renders/`, `stl/`, `vollfarbe/`, `tex/`.
Geprüft mit admesh: alle STL ohne offene Kanten. Mehrteilige Shells nur bei `datumsring_inlay` (Buchstaben) und `erde_*_land` (Kontinente/Inseln) – gewollt.

Texturen: Sonne & Mond © Solar System Scope (solarsystemscope.com/textures, CC BY 4.0; Mond basiert auf NASA-Daten). Erdkarte: bisherige Projekttextur `earth.jpg` (Solar-System-Scope/NASA Blue Marble – bei Weitergabe Quelle nennen).
