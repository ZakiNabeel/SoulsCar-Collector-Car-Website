export type Car = {
  slug: string;
  name: string;
  year: number;
  make: string;
  model: string;
  spec: string;
  price: string;
  image: string;
  images?: string[];        // resolved Cloudinary image URLs for the gallery
  imagesFolder?: string;    // Cloudinary folder name from col Q in the sheet
  mileage: string;
  engine: string;
  transmission: string;
  color: string;
  condition: string;
  location: string;
  description: string;
  seller: "Verified" | "Private";
};

export const cars: Car[] = [
  {
    slug: "1973-porsche-911",
    name: "Porsche 911 T",
    year: 1973,
    make: "Porsche",
    model: "911 T",
    spec: "Flat-6 · Manual · 78,400 km",
    price: "PKR 4.85 Cr",
    image: "/assets/car-1.jpg",
    mileage: "78,400 km",
    engine: "2.4L Flat-6",
    transmission: "5-speed Manual",
    color: "Silver Metallic",
    condition: "Concours",
    location: "Lahore, PK",
    description:
      "An exceptional, matching-numbers 911 T finished in its original silver. Mechanicals fully sorted, paint preserved, interior original.",
    seller: "Verified",
  },
  {
    slug: "1969-mercedes-280sl",
    name: "Mercedes-Benz 280 SL",
    year: 1969,
    make: "Mercedes-Benz",
    model: "280 SL Pagoda",
    spec: "Inline-6 · Auto · 62,100 km",
    price: "PKR 3.20 Cr",
    image: "/assets/car-1.jpg",
    mileage: "62,100 km",
    engine: "2.8L Inline-6",
    transmission: "4-speed Automatic",
    color: "Cream",
    condition: "Excellent",
    location: "Karachi, PK",
    description:
      "A timeless Pagoda in cream with tan interior. Both hard and soft tops included. Fastidiously maintained by a single owner for the last 14 years.",
    seller: "Verified",
  },
  {
    slug: "1978-land-cruiser-fj40",
    name: "Toyota Land Cruiser FJ40",
    year: 1978,
    make: "Toyota",
    model: "FJ40",
    spec: "Inline-6 · Manual · 112,000 km",
    price: "PKR 1.95 Cr",
    image: "/assets/car-2.jpg",
    mileage: "112,000 km",
    engine: "4.2L Inline-6",
    transmission: "4-speed Manual",
    color: "Forest Green",
    condition: "Restored",
    location: "Islamabad, PK",
    description:
      "Frame-off restored FJ40 in its iconic forest green over white roof. New drivetrain seals, original gauges, fresh interior.",
    seller: "Private",
  },
  {
    slug: "1967-datsun-fairlady",
    name: "Datsun Fairlady 1600",
    year: 1967,
    make: "Datsun",
    model: "Fairlady 1600",
    spec: "Inline-4 · Manual · 54,300 km",
    price: "PKR 1.10 Cr",
    image: "/assets/car-3.jpg",
    mileage: "54,300 km",
    engine: "1.6L Inline-4",
    transmission: "4-speed Manual",
    color: "Signal Red",
    condition: "Excellent",
    location: "Lahore, PK",
    description:
      "A rare, early Fairlady roadster — chrome bright, body straight, mechanicals freshened. A perfect weekend collector.",
    seller: "Verified",
  },
  {
    slug: "1974-bmw-2002",
    name: "BMW 2002",
    year: 1974,
    make: "BMW",
    model: "2002",
    spec: "Inline-4 · Manual · 96,800 km",
    price: "PKR 1.45 Cr",
    image: "/assets/car-4.jpg",
    mileage: "96,800 km",
    engine: "2.0L Inline-4",
    transmission: "4-speed Manual",
    color: "Inka Orange",
    condition: "Excellent",
    location: "Karachi, PK",
    description:
      "Inka orange over black. Bumpers, glass and trim all original. The car that defined the sports sedan.",
    seller: "Verified",
  },
  {
    slug: "1969-jaguar-e-type",
    name: "Jaguar E-Type Series II",
    year: 1969,
    make: "Jaguar",
    model: "E-Type Series II",
    spec: "Inline-6 · Manual · 71,200 km",
    price: "PKR 5.60 Cr",
    image: "/assets/car-5.jpg",
    mileage: "71,200 km",
    engine: "4.2L Inline-6",
    transmission: "4-speed Manual",
    color: "British Racing Green",
    condition: "Concours",
    location: "Islamabad, PK",
    description:
      "British racing green over tan. A genuine matching-numbers Series II roadster, recently serviced and ready to drive.",
    seller: "Verified",
  },
];

export type Part = {
  slug: string;
  name: string;
  fits: string;
  condition: "New" | "Used" | "Restored";
  price: string;
  image: string;
};

export const parts: Part[] = [
  {
    slug: "fj40-hubcaps",
    name: "FJ40 Chrome Hubcaps (set of 4)",
    fits: "Toyota Land Cruiser FJ40",
    condition: "Restored",
    price: "PKR 85,000",
    image: "/assets/part-1.jpg",
  },
  {
    slug: "911-headlight",
    name: "Early 911 Headlight Assembly",
    fits: "Porsche 911 (1965–73)",
    condition: "Used",
    price: "PKR 142,000",
    image: "/assets/part-2.jpg",
  },
  {
    slug: "wood-steering-wheel",
    name: "Nardi-style Wood Steering Wheel",
    fits: "Universal",
    condition: "New",
    price: "PKR 38,500",
    image: "/assets/part-3.jpg",
  },
  {
    slug: "2002-grille",
    name: "BMW 2002 Front Grille",
    fits: "BMW 2002 (1968–76)",
    condition: "Restored",
    price: "PKR 52,000",
    image: "/assets/part-1.jpg",
  },
  {
    slug: "e-type-mirror",
    name: "E-Type Bullet Mirror (pair)",
    fits: "Jaguar E-Type",
    condition: "New",
    price: "PKR 24,800",
    image: "/assets/part-2.jpg",
  },
  {
    slug: "pagoda-emblem",
    name: "Pagoda Hood Emblem",
    fits: "Mercedes 280 SL",
    condition: "Used",
    price: "PKR 18,000",
    image: "/assets/part-3.jpg",
  },
];
