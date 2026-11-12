# Tellurium (Sonne – Erde – Mond)

Bewegliches Modell von Sonne, Erde und Mond: als interaktive Webseite und als 3D-druckbares Zahnradgetriebe.

## Webversion

Die aktuelle Webversion ist öffentlich unter [voltar.ch/tellurium](https://voltar.ch/tellurium/).

Sie zeigt Bahn, Jahreszeiten, Tag und Nacht sowie Mondphasen. Der aktuelle Stand liegt in `webgl/kids/tellurium_einfach.html` (gebaut aus `webgl/kids/einfach_template.html`).

## 3D-druckbares Zahnradgetriebe

Parametrisches OpenSCAD-Modell (`tellurium.scad`, BOSL2), Modul 1, 20° Eingriffswinkel, Zahnbreite 6 mm, Flankenspiel 0,15 mm, Bohrungsspiel 0,25 mm.
Sockel 200 × 200 mm, Schwenkkreis der Mondbahn Ø ≈ 250 mm, Höhe ≈ 180 mm (Oberkante Sonne).
Teil ausgeben: `openscad -D 'part="arm"' -o arm.stl tellurium.scad` (Teilnamen siehe Dateiende). `part="assembly"|"exploded"|"gears"` für Ansichten.

## Funktionsprinzip
Eine Handkurbel sitzt **auf dem Jahresarm**. Ihr Ritzel P10 läuft am **feststehenden Sonnenrad F48** ab → der Arm wandert um die Sonne (4,8 Kurbelumdrehungen = 1 Jahr).
* **Parallelführung (Ebene über dem Arm):** F48 (fest) → Zwischenrad I32 → Erdhalterrad E48. Gleiche Zähnezahl F=E + ein Zwischenrad ⇒ der Erdhalter dreht sich absolut **nicht**; die Erdachse (23,44°) zeigt immer in dieselbe Raumrichtung (Jahreszeiten!).
* **Tagesgetriebe (unter dem Arm):** Kurbelrad 34 → Umkehrrad J16 → Zentral-Doppelrad 12/68 (lose auf der Sonnenachse) → Zwischenwellen-Doppelrad 12/66 → Erdritzel 14 auf der 3-mm-Erdwelle. Die Welle läuft im Erdachsrohr nach oben und treibt über ein Mini-Kardangelenk die geneigte Erdachse.
* **Mondgetriebe:** Die Zwischenwelle trägt oben das Mondritzel 11 → Mondrad 69 (dreht auf dem Erdachsrohr) mit Mondarm (r = 40 mm).

## Übersetzungen (bezogen auf 1 Armumlauf = 1 Jahr)
| Größe | Kette | Modell | Soll | Abweichung |
|---|---|---|---|---|
| Kurbelumdrehungen/Jahr | 48/10 | 4,8 | – | – |
| Erdhalter absolut | 48/32·32/48, 1 Zwischenrad | 0 | 0 | exakt |
| Sonnentage/Jahr | 4,8·34/12·68/12·66/14 | 363,31 | 365,24 | −0,53 % |
| Sterntage/Jahr | +1 | 364,31 | 366,24 | −0,53 % |
| Synod. Monate/Jahr | 4,8·34/12·68/12·11/69 | 12,286 | 12,368 | −0,67 % |
| Tage pro synod. Monat | 363,31/12,286 | 29,57 | 29,53 | +0,14 % |

Fehler nach 1 Jahr: ca. 2 Tage bei der Erddrehung, Mondphase ca. 2,4 Tage – für ein Demonstrationsmodell sehr gut.

## Achsabstände (geprüft mit BOSL2 `gear_dist`, Profilverschiebungen x·m)
F48(−0,4)/I32(+0,4) = 40 · I32/E48(−0,4) = 40 → Erdbahnradius 80 mm · F48/P10(+0,4) = 29 · 68(−0,3)/12(+0,3) = 40 · 66(−0,2)/14(+0,2) = 40 · 11(+0,4)/69(−0,4) = 40 · Kurbelrad34/J16(+0,1) = 25,10 und J16/12(+0,3) = 14,37 (J liegt bei (−7,20 | 12,43)).
Kleine Ritzel haben positive, ihre Gegenräder gleich große negative Profilverschiebung (V-Null) → keine Unterschneidung, Normachsabstände.

## Teileliste Druck (alle passen auf 250×210 mm, alle STL wasserdicht geprüft)
| Datei (stl/) | Maße mm | Material / Einstellungen | Stk |
|---|---|---|---|
| sockel | 200×200×50 | PLA, 0,2 mm, 3 Wände, 15 % Gyroid, ohne Stütze | 1 |
| arm | 127×34×8 | PLA, 0,2 mm, 4 Wände, 40 %; Lagertasche nach unten (liegt so) | 1 |
| sonnenrad (F48) | Ø49×13,5 | Zahnräder generell: 0,12–0,16 mm, 4 Wände, 50 %, ohne Stütze, flach | 1 |
| parallelrad (I32) | Ø35×6 | dto. | 1 |
| erdhalterrad (E48) | Ø49×6 | dto. | 1 |
| kurbelritzel (P10) | Ø12×6 | dto., 100 % | 1 |
| kurbelrad34 | Ø36×6 | dto. | 1 |
| umkehrrad (J16) | Ø18×6 | dto. | 1 |
| zentralrad (68/12) | Ø69×13,5 | dto., großes Rad nach unten | 1 |
| zwischenwelle_rad (66/12) | Ø68×13,5 | dto., großes Rad nach unten | 1 |
| mondritzel (11) | Ø14×6 | dto., 100 % | 1 |
| erdritzel (14) | Ø16×22 | dto., Rad nach unten | 1 |
| mondrad (69 + Rohr) | Ø70×17,5 | dto. | 1 |
| erdachsrohr | Ø8×42 | stehend, 100 %, 0,12 mm (oder Messingrohr 8×2,5) | 1 |
| huelse | Ø9,6×9 | stehend, 100 % | 1 |
| neigungskopf | 20×22×32 | stehend, Baum-Stütze nur für schrägen Erdachs-Stutzen | 1 |
| mondarm | 54×20×10 | flach, ohne Stütze | 1 |
| kurbelknopf | Ø36×22 | flach, ohne Stütze | 1 |
| sonne_unten / sonne_oben | Ø50×25 | Schnittfläche auf Bett, 0,16 mm, gelbes PLA | je 1 |
| erde_unten / erde_oben | Ø24×12,5 | dto., blaues PLA | je 1 |
| mond | Ø10 | mit Stütze, oder Stahl-/Messingkugel Ø10 kaufen | 1 |

## Stückliste Kaufteile
| Teil | Menge |
|---|---|
| Silberstahl Ø6 h9 × 150 mm (Sonnenachse) | 1 |
| Silberstahl Ø4 × 50 mm (Kurbelwelle, Zwischenwelle) | 2 |
| Silberstahl Ø3 × 70 mm (Erd-Drehwelle), Ø3 × 35 mm (Erdachse), Ø3 × 16 mm (Stift J) | je 1 |
| Stahl-/Messingdraht Ø2 × 55 mm (Mondstab) | 1 |
| Rillenkugellager 626-2Z (6×19×6) – Arm-Drehlager | 1 |
| Mini-Kardangelenk 3/3 mm (Modellbau, Ø ≤ 12, L ≈ 20–24) | 1 |
| Madenschrauben M3×6 (Sockel, Sonnenrad, Kurbelknopf, Mondarm) | 4 |
| Unterlegscheiben Ø6 (Zentralrad), Ø4 (Zwischenrad/Kurbel), PTFE oder Messing | 6 |
| Gummifüße Ø10 | 4 |
| 2K-Epoxid oder Sekundenkleber, etwas PTFE-Fett | – |
| Optional: Kugeln Messing Ø50 (Sonne), Ø25 (Erde), Ø10 (Mond), gebohrt | – |
Optional für Metallversion: 684ZZ (4×9×4) für Kurbel-/Zwischenwelle, Sinterbronze-Buchsen für Erdachsrohr, Wellen mit D-Fläche statt Kleben.

## Zusammenbau (von unten nach oben)
1. 6-mm-Achse in den Sockel bis Anschlag, M3-Madenschraube anziehen. Distanzhülse aufstecken, Scheibe, **Zentralrad** (68 unten) lose aufsetzen.
2. **Arm vorbereiten:** 626-Lager von unten in die Tasche pressen. Stift J (3×16) von unten in den Arm pressen, **Umkehrrad J16** aufstecken (mit Sicherungs-Tropfen auf Stiftende/Scheibe).
3. Kurbelwelle (4×50) durch den Arm: unten **Kurbelrad 34**, oben **Kurbelritzel P10** aufkleben (D-Fläche empfohlen); leichtgängig, ca. 0,3 mm Axialspiel.
4. Zwischenwelle (4×50): unten **Doppelrad 66/12** (66 unten) aufkleben, durch den Arm, oben **Parallelrad I32** lose aufstecken, darüber **Mondritzel 11** aufkleben.
5. Erdachsrohr durch die Erdbohrung des Arms, **Erdhalterrad E48** auf Höhe Armoberseite+1,5 mm aufkleben. 3-mm-Erdwelle von unten durchs Rohr, **Erdritzel 14** unten aufkleben (Nabe stützt sich am Rohrende ab).
6. Arm auf die Sonnenachse schieben, bis das Kurbelrad 34/J16 mit dem Zentralritzel 12 und das 66 mit dem Erdritzel kämmt. Lager-Innenring mit Loctite 638 auf der Achse fixieren (Arm hängt am Lager, ca. 0,5 mm über dem Zentralrad).
7. **Sonnenrad F48** auf die Achse, kämmt mit P10 und I32; ausrichten und Madenschraube anziehen. Ab jetzt ist F feststehend.
8. **Mondrad 69** aufs Erdachsrohr, **Mondarm** auf dessen Rohrende (Madenschraube), Mondstab + Mond.
9. **Neigungskopf** aufs Erdachsrohr kleben: Neigung zeigt in eine feste Raumrichtung (z. B. Juni-Sonnenwende: Nordpol zur Sonne). Kardangelenk auf Erdwelle, Erdachse durch Schrägbohrung ins Gelenk, Erdhälften aufkleben.
10. **Sonne** (Hälften verkleben) auf die Achse, **Kurbelknopf** auf die Kurbelwelle. Probelauf: 4,8 Kurbelumdrehungen = 1 Jahr, ca. 76 Erdumdrehungen je Kurbelumdrehung.

## Hinweise / Grenzen
* Mondbahnneigung 5,1° ist nicht umgesetzt (Mond läuft in der Ebene; eine fest geneigte Bahn würde die Knotenwanderung falsch zeigen). Der Mond-Stab kann für die Optik aber leicht schräg gebogen werden.
* Größenverhältnisse/Abstände sind nicht maßstäblich (wie bei jedem Tellurium).
* Erdtag-Übersetzung ist leicht reduziert (363,3 statt 365,24 Tage).
* Die Kopplung zur geneigten Erdachse nutzt ein gekauftes Kardangelenk (Alternative: kurzer Silikonschlauch 3 mm).
* Zahnräder sind in den Renders nicht zahnphasenrichtig gedreht – rein optisch.
* Für CNC in Messing/Alu: Modul 1 und alle Achsabstände bleiben; Bohrungen auf H7/g6 anpassen, Klebestellen durch Querstifte/Madenschrauben ersetzen. `CL`, `BL` im Kopf der Datei zentral einstellbar.

Renders: `renders/assembly.png`, `renders/exploded.png`, `renders/gears.png`, `renders/top.png`. Prüfskripte: `verify.py` (Wasserdichtheit/Bettgröße), `ratios.py` (Übersetzungen).
