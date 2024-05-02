// Dient zur verdeutlichung wie der Import bzw. das manuelle anlegen von einer Veredlung aussehen könnte.
// Diese Felder müssen zwingend vorhanden sein, damit der Import korrekt funktioniert.
export interface ProductType {
  articleRef: string; // Schwein, Tomate, Rind, Erdbeeren, ...
  refinementRequirement: string; // z.B. "Bio", "konventionell", "regional", "aus der Region", "aus Deutschland", "aus Europa", "aus Übersee"
  price: number; // Preis pro kg ... tbd ... wie werden Preise berechnet?
  quantity: number; // Menge, z.B. 1, 0.5, 2, ...
  quantityUnit: string; // kg, Stück, Liter, ...
  requiredTime: number; // Zeit, die benötigt wird, um das Produkt zu veredeln
  isCanBeDelivered: boolean; // Kann das Produkt geliefert werden?

  // Durchschnittliche Zeit, die benötigt wird, um das Produkt zu produzieren.
  // Daraus wird berechnet, wann das Produkt fertig ist. Speziell wann muss das Produkt angeliefert sein, damit es in den Plan passt.
  avgTimeToProduced: number;

  // Was wird aus dem Produkt produziert? z.B. "Schweinefleisch", "Tomatensoße", "Rindersteak", "Erdbeermarmelade", ...
  // Aus einem Schwein kann noch viel mehr gemacht werden, als nur Steaks.
  // Hier müssen wir Vorgaben treffen. Es kann weiter veredelt werden.
  produceOutcome: string[];
}
