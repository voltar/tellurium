#!/bin/bash
# Exportiert alle Mechanik-Teile (Koerper -> bodies.py)
P="datumsring_inlay huelse zentralrad kurbelrad34 umkehrrad kurbelritzel kurbelknopf arm sonnenrad parallelrad erdhalterrad zwischenwelle_rad mondritzel erdritzel erdachsrohr mondrad mondarm neigungskopf"
echo $P | tr ' ' '\n' | xargs -P 7 -I{} sh -c 'openscad -o stl/{}.stl -D "part=\"{}\"" tellurium_v2.scad >logs_{}.txt 2>&1; echo done {}'
