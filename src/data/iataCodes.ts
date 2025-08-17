export interface IAταCode {
  code: string;
  city: string;
  country: string;
  airport: string;
}

export const iataCodes: IAταCode[] = [
  // Morocco
  { code: "CMN", city: "Casablanca", country: "Morocco", airport: "Mohammed V International Airport" },
  { code: "RAB", city: "Rabat", country: "Morocco", airport: "Rabat-Salé Airport" },
  { code: "FEZ", city: "Fes", country: "Morocco", airport: "Fès–Saïs Airport" },
  { code: "TNG", city: "Tangier", country: "Morocco", airport: "Ibn Battouta Airport" },
  { code: "AGA", city: "Agadir", country: "Morocco", airport: "Agadir–Al Massira Airport" },
  { code: "OUD", city: "Oujda", country: "Morocco", airport: "Oujda Angads Airport" },
  { code: "ERH", city: "Errachidia", country: "Morocco", airport: "Moulay Ali Cherif Airport" },
  { code: "EUN", city: "Laayoune", country: "Morocco", airport: "Hassan I Airport" },
  { code: "NDR", city: "Nador", country: "Morocco", airport: "Nador International Airport" },
  { code: "AHU", city: "Al Hoceima", country: "Morocco", airport: "Cote du Rif Airport" },
  { code: "OZZ", city: "Ouarzazate", country: "Morocco", airport: "Ouarzazate Airport" },
  { code: "ESU", city: "Essaouira", country: "Morocco", airport: "Mogador Airport" },
  { code: "TTU", city: "Tetouan", country: "Morocco", airport: "Sania Ramel Airport" },
  
  // France
  { code: "CDG", city: "Paris", country: "France", airport: "Charles de Gaulle Airport" },
  { code: "ORY", city: "Paris", country: "France", airport: "Orly Airport" },
  { code: "NCE", city: "Nice", country: "France", airport: "Nice Côte d'Azur Airport" },
  { code: "LYS", city: "Lyon", country: "France", airport: "Lyon–Saint-Exupéry Airport" },
  { code: "MRS", city: "Marseille", country: "France", airport: "Marseille Provence Airport" },
  { code: "TLS", city: "Toulouse", country: "France", airport: "Toulouse-Blagnac Airport" },
  { code: "NTE", city: "Nantes", country: "France", airport: "Nantes Atlantique Airport" },
  { code: "BOD", city: "Bordeaux", country: "France", airport: "Bordeaux–Mérignac Airport" },
  { code: "SXB", city: "Strasbourg", country: "France", airport: "Strasbourg Airport" },
  { code: "LIL", city: "Lille", country: "France", airport: "Lille Airport" },
  
  // Spain
  { code: "MAD", city: "Madrid", country: "Spain", airport: "Adolfo Suárez Madrid–Barajas Airport" },
  { code: "BCN", city: "Barcelona", country: "Spain", airport: "Barcelona–El Prat Airport" },
  { code: "VLC", city: "Valencia", country: "Spain", airport: "Valencia Airport" },
  { code: "SVQ", city: "Seville", country: "Spain", airport: "Seville Airport" },
  { code: "BIO", city: "Bilbao", country: "Spain", airport: "Bilbao Airport" },
  { code: "PMI", city: "Palma", country: "Spain", airport: "Palma de Mallorca Airport" },
  { code: "LPA", city: "Las Palmas", country: "Spain", airport: "Las Palmas Airport" },
  { code: "TFS", city: "Tenerife", country: "Spain", airport: "Tenerife South Airport" },
  { code: "AGP", city: "Malaga", country: "Spain", airport: "Málaga-Costa del Sol Airport" },
  { code: "ALC", city: "Alicante", country: "Spain", airport: "Alicante-Elche Airport" },
  
  // Italy
  { code: "FCO", city: "Rome", country: "Italy", airport: "Leonardo da Vinci International Airport" },
  { code: "CIA", city: "Rome", country: "Italy", airport: "Ciampino Airport" },
  { code: "MXP", city: "Milan", country: "Italy", airport: "Milan Malpensa Airport" },
  { code: "LIN", city: "Milan", country: "Italy", airport: "Milan Linate Airport" },
  { code: "NAP", city: "Naples", country: "Italy", airport: "Naples International Airport" },
  { code: "VCE", city: "Venice", country: "Italy", airport: "Venice Marco Polo Airport" },
  { code: "BLQ", city: "Bologna", country: "Italy", airport: "Bologna Guglielmo Marconi Airport" },
  { code: "FLR", city: "Florence", country: "Italy", airport: "Florence Airport" },
  { code: "PSA", city: "Pisa", country: "Italy", airport: "Pisa International Airport" },
  { code: "CTA", city: "Catania", country: "Italy", airport: "Catania-Fontanarossa Airport" },
  
  // Turkey
  { code: "IST", city: "Istanbul", country: "Turkey", airport: "Istanbul Airport" },
  { code: "SAW", city: "Istanbul", country: "Turkey", airport: "Sabiha Gökçen International Airport" },
  { code: "ESB", city: "Ankara", country: "Turkey", airport: "Esenboğa International Airport" },
  { code: "AYT", city: "Antalya", country: "Turkey", airport: "Antalya Airport" },
  { code: "IZM", city: "Izmir", country: "Turkey", airport: "Adnan Menderes Airport" },
  { code: "ADB", city: "Izmir", country: "Turkey", airport: "Adnan Menderes Airport" },
  { code: "TZX", city: "Trabzon", country: "Turkey", airport: "Trabzon Airport" },
  { code: "ASR", city: "Kayseri", country: "Turkey", airport: "Kayseri Airport" },
  
  // UAE
  { code: "DXB", city: "Dubai", country: "UAE", airport: "Dubai International Airport" },
  { code: "DWC", city: "Dubai", country: "UAE", airport: "Al Maktoum International Airport" },
  { code: "AUH", city: "Abu Dhabi", country: "UAE", airport: "Abu Dhabi International Airport" },
  { code: "SHJ", city: "Sharjah", country: "UAE", airport: "Sharjah International Airport" },
  
  // Saudi Arabia
  { code: "RUH", city: "Riyadh", country: "Saudi Arabia", airport: "King Khalid International Airport" },
  { code: "JED", city: "Jeddah", country: "Saudi Arabia", airport: "King Abdulaziz International Airport" },
  { code: "DMM", city: "Dammam", country: "Saudi Arabia", airport: "King Fahd International Airport" },
  { code: "MED", city: "Medina", country: "Saudi Arabia", airport: "Prince Mohammad Bin Abdulaziz Airport" },
  
  // UK
  { code: "LHR", city: "London", country: "UK", airport: "Heathrow Airport" },
  { code: "LGW", city: "London", country: "UK", airport: "Gatwick Airport" },
  { code: "STN", city: "London", country: "UK", airport: "Stansted Airport" },
  { code: "LTN", city: "London", country: "UK", airport: "Luton Airport" },
  { code: "MAN", city: "Manchester", country: "UK", airport: "Manchester Airport" },
  { code: "EDI", city: "Edinburgh", country: "UK", airport: "Edinburgh Airport" },
  { code: "GLA", city: "Glasgow", country: "UK", airport: "Glasgow Airport" },
  { code: "BHX", city: "Birmingham", country: "UK", airport: "Birmingham Airport" },
  
  // Germany
  { code: "FRA", city: "Frankfurt", country: "Germany", airport: "Frankfurt Airport" },
  { code: "MUC", city: "Munich", country: "Germany", airport: "Munich Airport" },
  { code: "TXL", city: "Berlin", country: "Germany", airport: "Berlin Tegel Airport" },
  { code: "BER", city: "Berlin", country: "Germany", airport: "Berlin Brandenburg Airport" },
  { code: "DUS", city: "Düsseldorf", country: "Germany", airport: "Düsseldorf Airport" },
  { code: "HAM", city: "Hamburg", country: "Germany", airport: "Hamburg Airport" },
  { code: "CGN", city: "Cologne", country: "Germany", airport: "Cologne Bonn Airport" },
  { code: "STR", city: "Stuttgart", country: "Germany", airport: "Stuttgart Airport" },
  
  // Netherlands
  { code: "AMS", city: "Amsterdam", country: "Netherlands", airport: "Amsterdam Airport Schiphol" },
  { code: "RTM", city: "Rotterdam", country: "Netherlands", airport: "Rotterdam The Hague Airport" },
  { code: "EIN", city: "Eindhoven", country: "Netherlands", airport: "Eindhoven Airport" },
  
  // Belgium
  { code: "BRU", city: "Brussels", country: "Belgium", airport: "Brussels Airport" },
  { code: "CRL", city: "Brussels", country: "Belgium", airport: "Brussels South Charleroi Airport" },
  { code: "ANR", city: "Antwerp", country: "Belgium", airport: "Antwerp International Airport" },
  
  // Egypt
  { code: "CAI", city: "Cairo", country: "Egypt", airport: "Cairo International Airport" },
  { code: "SSH", city: "Sharm El Sheikh", country: "Egypt", airport: "Sharm el-Sheikh International Airport" },
  { code: "HRG", city: "Hurghada", country: "Egypt", airport: "Hurghada International Airport" },
  { code: "LXR", city: "Luxor", country: "Egypt", airport: "Luxor International Airport" },
  { code: "ASW", city: "Aswan", country: "Egypt", airport: "Aswan International Airport" },
  
  // Qatar
  { code: "DOH", city: "Doha", country: "Qatar", airport: "Hamad International Airport" },
  
  // Other major destinations
  { code: "JFK", city: "New York", country: "USA", airport: "John F. Kennedy International Airport" },
  { code: "LAX", city: "Los Angeles", country: "USA", airport: "Los Angeles International Airport" },
  { code: "ORD", city: "Chicago", country: "USA", airport: "O'Hare International Airport" },
  { code: "YYZ", city: "Toronto", country: "Canada", airport: "Toronto Pearson International Airport" },
  { code: "YUL", city: "Montreal", country: "Canada", airport: "Montreal-Pierre Elliott Trudeau International Airport" },
  { code: "NRT", city: "Tokyo", country: "Japan", airport: "Narita International Airport" },
  { code: "ICN", city: "Seoul", country: "South Korea", airport: "Incheon International Airport" },
  { code: "SIN", city: "Singapore", country: "Singapore", airport: "Singapore Changi Airport" },
  { code: "BKK", city: "Bangkok", country: "Thailand", airport: "Suvarnabhumi Airport" },
  { code: "KUL", city: "Kuala Lumpur", country: "Malaysia", airport: "Kuala Lumpur International Airport" },
  { code: "SYD", city: "Sydney", country: "Australia", airport: "Kingsford Smith Airport" },
  { code: "MEL", city: "Melbourne", country: "Australia", airport: "Melbourne Airport" },
  { code: "GRU", city: "São Paulo", country: "Brazil", airport: "São Paulo–Guarulhos International Airport" },
  { code: "GIG", city: "Rio de Janeiro", country: "Brazil", airport: "Rio de Janeiro–Galeão International Airport" },
];
