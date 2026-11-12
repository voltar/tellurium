# Tellurium v2 – Metallversion (Laserteile aus 3 mm Messing)

## Inhalt
- `dxf/*.dxf`: 15 Einzelteile. Masse in mm ($INSUNITS=4), Layer `CUT`, geschlossene LWPOLYLINEs, jede Datei auf die Teilemitte zentriert.
- `dxf/_nesting_alle_teile.dxf`: alle Teile auf einer Tafel von 300 × 230 mm mit 5 mm Abstand.
- `nesting_uebersicht.png` / `.pdf`: Nesting-Übersicht.
- `teile.json`: Masse, Fläche und Schnittlänge je Teil.
- `metall.scad` und `konv.py`: Quellen. Die DXFs sind 2D-Schnitte aus `tellurium_v2.scad`, erzeugt mit OpenSCAD 2021.01 und konvertiert mit ezdxf.

## Material
- Zahnräder, Arm und Mondarm aus Messingblech 3 mm, CuZn39Pb3 (Ms58, gut zerspanbar) oder CuZn37 (Ms63, gut lötbar). Für die Räder ist Ms58 besser.
- Achsen aus Silberstahl 1.2210 h8: Ø6 (Hauptachse), Ø4 (Kurbel- und Zwischenwelle), Ø3 (Erdachse).
- Rohr Ø8 / 6 für Erdhalter und Mond.
- Lager 626ZZ.
- Gesamtgewicht der Messingteile etwa 0,41 kg (162 cm² × 3 mm × 8,5 g/cm³).

## Stückliste (je 1 Stück)
| Datei | Zähne / x | Aussenmass mm | Endbohrung | Schnittlänge mm |
|---|---|---|---|---|
| sonnenrad48 | 48 / −0,4 | 61,5 | Ø8 H7 (Nabe) | 762 |
| erdhalterrad48 | 48 / −0,4 | 61,5 | Ø8 H7 (Nabe/Rohr) | 762 |
| parallelrad32 | 32 / +0,4 | 43,5 | Ø8 H7 (Nabe) | 268 |
| zentralrad68 | 68 / −0,3 | 86,7 | Ø8 H7 (Nabe) | 1142 |
| zentralritzel12 | 12 / +0,3 | 18,2 | Ø6 H7 | 110 |
| zwischenrad66 | 66 / −0,2 | 84,4 | Ø8 H7 (Nabe) | 1103 |
| zwischenritzel12 | 12 / +0,3 | 18,2 | Ø4 H7 | 104 |
| kurbelrad34 | 34 / 0 | 45,0 | Ø4 H7 | 277 |
| umkehrrad16 | 16 / +0,1 | 22,7 | Ø3 H7 | 134 |
| erdritzel14 | 14 / +0,2 | 20,5 | Ø3 H7 | 117 |
| kurbelritzel10 | 10 / +0,4 | 15,9 | Ø4 H7 | 87 |
| mondritzel11 | 11 / +0,4 | 17,1 | Ø4 H7 | 95 |
| mondrad69 | 69 / −0,4 | 87,7 | Ø8,4 (lose auf Rohr) | 1164 |
| arm | – | 155 × 37,5 | Lagersitz Ø19 H7 und Achsbohrungen | 545 |
| mondarm | – | 66,5 × 20 | wie FDM | 202 |

Summe: 6,9 m Schnittlänge, 47 Konturen, 162 cm² Teilefläche, Tafel 300 × 230 mm.
Verzahnung: Modul 1,25, Eingriffswinkel 20°, Flankenspiel 0,15 mm. Die Profilverschiebungen und Achsabstände sind wie im FDM-Modell, die Übersetzungen bleiben unverändert.

## Bohrungen und Toleranzen
- Alle Bohrungen sind im DXF mit **Endmass −0,2 mm** gelasert, also als Vormass. Danach werden sie auf das Endmass gerieben: H7 für Press- oder Klebesitz (Loctite 638), bei lose laufenden Rädern etwa +0,03 mm (F7).
- Wer nicht reiben will, kann das Endmass direkt lasern lassen (`BV=0` in `metall.scad`). Fiberlaser erreichen ±0,05–0,1 mm, das reicht für Klebesitze.
- Allgemeintoleranz ISO 9013 bzw. ±0,1 mm. Für die Zahnflanken ist Fiberlaser mit Stickstoff Pflicht.

## Fertigungsgrenzen
- **Fiberlaser:** Modul 1,25 ist gut machbar, die Zahnlücke am Fuss ist etwa 1,5–2 mm breit. Die Schnittfuge von 0,1–0,2 mm gleicht der Betrieb aus (Kerf-Kompensation). Die DXFs sind Nennkontur.
- Die Speichen wurden für Metall auf **3,5 mm** verbreitert (FDM: 3,2 mm). Steg und Kranz sind überall mindestens 3 mm breit, also mindestens Blechdicke.
- **Wasserstrahl:** Die Fuge ist 0,8–1 mm breit, und die Schnittkanten werden konisch. Für Zahnräder mit Modul 1,25 ist das **ungeeignet**. Wasserstrahl taugt nur für Arm und Mondarm; Zahnräder erst ab etwa Modul 2,5.
- Die Ritzel mit 10–12 Zähnen sind sehr klein. Alternativen: Messing-Normritzel M1,25 (zum Beispiel Mädler) kaufen, oder zwei Lagen lasern, verlöten und das Zahnprofil nachfeilen.

## Änderungen gegenüber FDM: Dicke und Stapelung
- FDM-Breiten 7–18 mm werden zu **3 mm**. Die Räder sind dadurch flache Scheiben, die Höhenlagen (Z_B1…Z_L2) bleiben gleich.
- Die Distanz zwischen den Rädern bilden **Messingnaben**: gedrehte Hülsen Ø8 h6 mit Bund Ø14 × 2, Bohrung nach Achse, Länge = FDM-Breite − 3. Die Nabe wird ins Rad gepresst oder weichgelötet und mit einem Gewindestift M3 auf der Achse fixiert. Ersatzweise gehen gedruckte Naben (PETG/PA, Ø8-Zapfen eingeklebt).
- **Doppelräder** (Zentralrad 68+12, Zwischenwelle 66+12): Beide Scheiben sitzen auf einer gemeinsamen Nabe, mit einer Distanzscheibe von 2 mm dazwischen, und werden weichgelötet. Mit einem Ø2-Stift ausrichten.
- **Arm:** FDM 8 mm entspricht 2 Lagen 3 mm mit einer Zwischenlage von 2 mm, oder 1 Lage plus eine Messingbuchse Ø24 × 7 als Gehäuse für das Lager 626 (6 mm breit). Ein 3-mm-Blech allein trägt das Lager nicht.
- Achslängen: wie FDM. Silberstahl auf Länge sägen, Enden anfasen.

## Nachbearbeitung
1. Entgraten: Schlackenbart unten mit Dreikantschaber oder Schleifvlies entfernen. Zahnflanken nur leicht mit einer Nadelfeile brechen.
2. Bohrungen reiben (siehe oben). Planschleifen auf Glasplatte mit Korn 400 → 800 → 1200 nass.
3. Polieren: Filzscheibe mit Polierpaste (Tripel, dann Blau), oder Trowalisieren beim Laserbetrieb bestellen. Entfetten mit Isopropanol.
4. Schützen: Zaponlack (Nitro-Klarlack für Messing) dünn spritzen, alternativ Renaissance Wax. Die Zahnflanken nicht lackieren, sondern mit einem Hauch Uhrenöl oder Trockenschmierstoff (PTFE) versehen.
5. Ausrichten der Achsabstände: 50 mm (alle) und 36,25 mm (Kurbel). Eine Grundplatte als Lehre (Messing 4 mm, Bohrungen nach POS_* aus der SCAD) erleichtert die Montage.
