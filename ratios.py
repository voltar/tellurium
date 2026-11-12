# Übersetzungen relativ zum Jahresarm (Arm = +1 Umlauf/Jahr)
crank = 48/10                    # F48 fest, Kurbelritzel P10
center = crank*34/12             # Kurbelrad34 -> J16 -> Zentralritzel12 (2 Eingriffe, gleiche Richtung)
idler = -center*68/12            # Zentralrad68 -> Ritzel12
spin = -idler*66/14              # Rad66 -> Erdritzel14
moon = -idler*11/69              # Mondritzel11 -> Mondrad69
holder = -1*(48/32)*(-32/48)*-1  # F->I->E : Erdhalter rel. Arm = -1 -> absolut 0
print("Kurbel/Jahr", crank)
print("Sonnentage/Jahr (rel. Arm)", spin, "Soll 365.2422", (spin/365.2422-1)*100)
print("Sterntage/Jahr", spin+1, "Soll 366.2422", ((spin+1)/366.2422-1)*100)
print("synod. Monate/Jahr", moon, "Soll 12.3683", (moon/12.3683-1)*100)
print("siderisch", moon+1, "Soll 13.3683", ((moon+1)/13.3683-1)*100)
print("Erdhalter absolut", 1+holder)
