# KI-Adventskalender Demonstrator: Fabrik-Roboter mit Reinforcement Learning

## 🤖 Übersicht

Dieser Demonstrator veranschaulicht die Grundprinzipien des Reinforcement Learning anhand eines simulierten Fabrik-Roboters. Die Anwendung zeigt, wie ein KI-Agent durch Exploration und Exploitation lernt, den optimalen Weg durch eine Fabrikhalle zu finden, während er Hindernissen ausweicht.

## 📋 Funktionen

- **Interaktive Simulation**: Beobachte in Echtzeit, wie der Roboter lernt und seine Strategie verbessert
- **Einstellbare Parameter**: Passe die Balance zwischen Exploration und Exploitation an
- **Verschiedene Belohnungsfunktionen**: Experimentiere mit unterschiedlichen Belohnungssystemen
- **Live-Statistiken**: Verfolge die Leistung des Lernalgorithmus in Echtzeit
- **Visualisierung des Lernfortschritts**: Graphische Darstellung der Belohnungen pro Episode

## 🛠️ Technische Details

Der Demonstrator verwendet:
- **Q-Learning**: Ein modellfreier Reinforcement-Learning-Algorithmus
- **Dash**: Ein Python-Framework für interaktive Webanwendungen
- **Plotly**: Für interaktive Visualisierungen und Graphen

## 🚀 Starten der Anwendung

Um die Anwendung zu starten:

1. Stelle sicher, dass alle erforderlichen Pakete installiert sind:
   ```bash
   pip install dash plotly numpy pandas
   ```

2. Führe die Datei KI_Advent.py aus:
   ```bash
   python KI_Advent.py
   ```

3. Öffne einen Webbrowser und navigiere zu:
   ```
   http://127.0.0.1:8050/
   ```

## 🎮 Bedienung

- **Start/Stopp**: Starte oder pausiere die Simulation mit dem entsprechenden Button
- **Reset**: Setze die Simulation zurück, um von vorne zu beginnen
- **Exploration vs. Exploitation**: Nutze den Schieberegler, um das Verhältnis zwischen zufälligen Aktionen (Exploration) und dem Ausnutzen bekannter guter Aktionen (Exploitation) anzupassen
- **Belohnungsfunktion**: Wähle zwischen verschiedenen Belohnungssystemen, die unterschiedliche Verhaltensweisen fördern:
  - Standard: Ausgeglichenes Verhältnis zwischen Zielerreichung und Vermeidung von Hindernissen
  - Effizienz: Höhere Belohnung für schnelles Erreichen des Ziels
  - Sicherheit: Stärkere Bestrafung für Kollisionen
  - Neugierig: Ermutigt zur Erkundung mit positiven Schrittbelohnungen

## 📊 Interpretation der Ergebnisse

- **Epsiode**: Anzahl der abgeschlossenen Durchläufe
- **Schritte**: Anzahl der vom Roboter in der aktuellen Episode ausgeführten Schritte
- **Belohnung**: Gesamtbelohnung in der aktuellen Episode
- **Ø letzte 10**: Durchschnittliche Belohnung der letzten 10 Episoden (zeigt langfristigen Lernfortschritt)
- **Lernfortschritt-Graph**: Zeigt die Entwicklung der Belohnungen über alle Episoden

## 🧠 Lernziele

Dieser Demonstrator hilft beim Verständnis wichtiger Konzepte im Bereich des maschinellen Lernens:

- **Reinforcement Learning**: Lernen durch Interaktion mit der Umgebung
- **Exploration vs. Exploitation**: Balance zwischen dem Erkunden unbekannter Optionen und dem Ausnutzen bekannten Wissens
- **Belohnungssysteme**: Wie unterschiedliche Anreize das Lernverhalten beeinflussen
- **Q-Learning**: Wie ein Agent Aktionswerte lernt, ohne ein Modell der Umwelt zu haben

## 💡 Tipps für Experimente

- Beginne mit hoher Exploration (Epsilon) und reduziere sie langsam, während der Agent lernt
- Vergleiche, wie verschiedene Belohnungsfunktionen das Verhalten des Roboters beeinflussen
- Beobachte, wie der Agent mit zunehmender Erfahrung effizienter wird
- Verfolge den Lernfortschritt im Graphen und beobachte, wie die durchschnittliche Belohnung mit der Zeit steigt

---

Erstellt als Teil des KI-Adventskalender-Projekts, 2025.
