export interface Sale {
  id: string;
  type: "Flight Booking" | "Hotel Booking" | "Voyage Organisé" | "Car Rental" | "Travel Insurance";
  clientName: string;
  phoneNumber: string;
  pnr?: string;
  buyingPrice: number;
  sellingPrice: number;
  system: "TTP" | "AR";
  agent: "Ahmed" | "Mehdi" | "Achraf" | "Asri";
  departureDate: Date;
  departureTime: string;
  notes?: string;
  createdAt: Date;
  profit: number;
}

export interface SaleFormData {
  type: Sale["type"];
  clientName: string;
  phoneNumber: string;
  pnr?: string;
  buyingPrice: number | string;
  sellingPrice: number | string;
  system: Sale["system"];
  agent: Sale["agent"];
  departureDate: Date;
  departureTime: string;
  notes?: string;
}