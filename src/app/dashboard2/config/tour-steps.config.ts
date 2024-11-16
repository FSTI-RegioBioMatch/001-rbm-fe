// src/app/dashboard2/config/tour-steps.config.ts
export interface TourStep {
  element: string;
  title: string;
  text: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    element: '.pt-sidebar-home',
    title: 'Übersicht',
    text: 'In der Übersicht findest Du Schnellinformationen über Deine Aktivitäten.',
  },
  {
    element: '.pt-sidebar-recipe',
    title: 'Meine Rezepte',
    text: 'Erstelle, bearbeite oder schaue Dir Deine Rezepte an.',
  },
  {
    element: '.pt-sidebar-menus',
    title: 'Meine Menüs',
    text: 'Hier findest Du Deine Menüs. Du kannst Menüs erstellen, eine Einkaufsliste erstellen sowie ansehen und Angebote in Deiner Region finden.',
  },
  {
    element: '.pt-sidebar-orders',
    title: 'Bestellungen',
    text: 'Den aktuellen Stand Deiner Bestellungen findest Du hier.',
  },
  {
    element: '.pt-toolbar-betrieb',
    title: 'Betrieb',
    text: 'Wechsle bei Bedarf zwischen Deinen Betrieben.',
  },
  {
    element: '.pt-toolbar-help',
    title: 'Tour | Hilfe',
    text: 'Für eine Schritt-für-Schritt-Erklärung kannst Du auf jeder Seite diesen Knopf drücken, um die Tour zu starten.',
  },
  {
    element: '.pt-toolbar-profile',
    title: 'Profil',
    text: 'Hier findest Du alle Informationen über Dich und Dein Unternehmen.',
  },
  {
    element: '.pt-dashboard-home',
    title: 'Übersicht',
    text: 'In der Übersicht findest Du vier Reiter. Wir befinden uns aktuell in der Übersicht.',
  },
  {
    element: '.pt-dashboard-search',
    title: 'Suche',
    text: 'Suche hier nach regionalen Angeboten, Rezepten oder Menüs.',
  },
  {
    element: '.pt-dashboard-map',
    title: 'Karte',
    text: 'Auf der Karte findest Du farbig markierte Standorte von Anbietern. Klicke auf einen Standort, um die verfügbaren Produkte und weitere Informationen zu sehen.',
  },
  {
    element: '.pt-dashboard-match',
    title: 'Empfehlungen',
    text: 'Unter Empfehlungen erhältst Du Rezeptvorschläge, die ein Algorithmus anhand lokaler Angebote für Dich erstellt.',
  },
  {
    element: '.pt-dashboard-saison',
    title: 'Saisonkalender',
    text: 'Entdecke hier die passenden Produkte für jede Saison.',
  },
  {
    element: '.pt-dashboard-tops',
    title: 'Statistiken',
    text: 'Hier findest Du weitere informative Statistiken und Auswertungen.',
  },
];
