export interface LegalSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LegalDocument {
  title: string;
  updated: string;
  intro?: string;
  sections: LegalSection[];
}

export interface LegalContent {
  privacy: LegalDocument;
  terms: LegalDocument;
}
