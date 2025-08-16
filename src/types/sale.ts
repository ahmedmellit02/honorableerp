export interface Sale {
  id: string;
  numericId: number;
  type: "Flight Confirmed" | "Boat Booking" | "Extra Baggage" | "Flight Changing" | "Flight On Hold" | "Hotel Booking" | "RW 1" | "RW 2" | "E-VISA" | "Organized Travel" | "Travel Insurance";
  clientName: string;
  phoneNumber: string;
  pnr?: string;
  buyingPrice: number;
  sellingPrice: number;
  system: "Divers" | "TTP" | "AR" | "CIH Hjira" | "CIH Mehdi" | "BP Ahmed" | "BP Hajj" | "BP Hajja";
  agent: "Ahmed" | "Mehdi" | "Achraf" | "Asri";
  departureDate: Date;
  departureTime: string;
  notes?: string;
  createdAt: Date;
  profit: number;
  cashedIn: boolean;
  cashedInAt?: Date;
  cashedInBy?: string;
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