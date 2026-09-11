export interface ServiceRequest {
  name: string;
  category:
    | "Haircut & Styling"
    | "Beard & Grooming"
    | "Skin & Facials"
    | "Spa & Massage"
    | "Bridal & Makeover"
    | "Hair Color & Highlights";
  price: number;
  durationMinutes: number;
  description: string;
}
