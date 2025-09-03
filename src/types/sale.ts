export interface Sale {
  id: string;
  numericId: number;
  type: "Flight Confirmed" | "Boat Booking" | "Extra Baggage" | "Flight Changing" | "Flight On Hold" | "Hotel Booking" | "RW 1" | "RW 2" | "E-VISA" | "Organized Travel" | "Travel Insurance";
  clientName: string;
  phoneNumber: string;
  pnr?: string;
  buyingPrice: number;
  sellingPrice: number;
  system: "Divers" | "TTP" | "AR" | "Carte";
  agent: "Ahmed" | "Mehdi" | "Achraf" | "Asri" | "Sanae";
  departureDate: Date;
  departureTime: string;
  // Flight Confirmed specific fields
  fromAirport?: string;
  toAirport?: string;
  hasRegistration?: boolean;
  // RW 1 specific fields  
  rwDate?: Date;
  rwTime?: string;
  // Legacy field for backward compatibility
  destination?: string;
  createdAt: Date;
  profit: number;
  cashedIn: boolean;
  cashedInAt?: Date;
  cashedInBy?: string;
  paymentMethod: "C" | "V"; // C for Cash, V for Virement (Bank Transfer)
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
  // Flight Confirmed specific fields
  fromAirport?: string;
  toAirport?: string;
  hasRegistration?: boolean;
  // RW 1 specific fields
  rwDate?: Date;
  rwTime?: string;
  // Legacy field for backward compatibility
  destination?: string;
  paymentMethod: "C" | "V"; // C for Cash, V for Virement (Bank Transfer)
}