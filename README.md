# Feder–Masse-System

Ein minimalistisches JavaScript-Applet zu Beispiel 1.3.18. Gestaltung angelehnt an https://github.com/mauricevenutti/partialbruch-applet.

## Lokal starten

`npm start` und http://127.0.0.1:5173 öffnen. Benötigt Python 3, keine npm-Abhängigkeiten und keinen Build. Der Ordner `dist/` kann direkt auf einem statischen Webserver bereitgestellt werden.

## Bedienung

- A und B werden als Zahlen eingegeben und legen das Schubintervall `A ≤ t < B` fest (0–30 Sekunden). Beim Überkreuzen wird der andere Zeitpunkt mitverschoben; A = B bedeutet keinen Schub.
- Start/Pause und Zurücksetzen steuern die Animation.
- Zeitleiste oder Klicken/Ziehen im Plot setzen den gemeinsamen Zeitpunkt.
- Das Zeitfenster ist wählbar und erweitert sich beim Abspielen automatisch.
- Änderungen an A/B aktualisieren die gesamte exakte Lösung bei der aktuellen Zeit.

Das Modell ist `x″ + x = f` mit `x(0) = x′(0) = 0` und `f = u(t−A)−u(t−B)`. Keine Dämpfung. Die Rakete bewegt sich mit der Masse, ihr Schub zeigt immer nach rechts. Die Zeichnung verwendet 90 SVG-Einheiten pro Auslenkungseinheit.

## Prüfung

`npm test` prüft Anfangsbedingungen, Schaltzeitpunkte, Stetigkeit, Differentialgleichung und Energieerhaltung nach dem Schub.
