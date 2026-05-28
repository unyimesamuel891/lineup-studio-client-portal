import { Appointment, Barber, PortalData, Service, User } from "../types";

const isoDate = (offsetDays: number, hour: number, minute = 0) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

const createdAt = new Date().toISOString();

export const seedUsers: User[] = [
  {
    id: "usr-admin-maya",
    name: "Maya Brooks",
    email: "owner@lineup.test",
    password: "password123",
    role: "admin",
    phone: "(555) 217-8800",
    notes: "Owner and front desk lead.",
    createdAt
  },
  {
    id: "usr-staff-eli",
    name: "Eli Carter",
    email: "staff@lineup.test",
    password: "password123",
    role: "staff",
    phone: "(555) 217-8810",
    createdAt
  },
  {
    id: "usr-customer-jordan",
    name: "Jordan Ellis",
    email: "jordan@lineup.test",
    password: "password123",
    role: "customer",
    phone: "(555) 310-4490",
    notes: "Prefers mid fade and beard shape-up.",
    createdAt
  },
  {
    id: "usr-customer-noah",
    name: "Noah Price",
    email: "noah@lineup.test",
    password: "password123",
    role: "customer",
    phone: "(555) 763-1102",
    notes: "Usually books Saturday morning.",
    createdAt
  },
  {
    id: "usr-customer-avery",
    name: "Avery Coleman",
    email: "avery@lineup.test",
    password: "password123",
    role: "customer",
    phone: "(555) 418-2201",
    notes: "Sensitive scalp; use low heat.",
    createdAt
  },
  {
    id: "usr-customer-miles",
    name: "Miles Harris",
    email: "miles@lineup.test",
    password: "password123",
    role: "customer",
    phone: "(555) 519-7742",
    createdAt
  },
  {
    id: "usr-customer-cam",
    name: "Cam Johnson",
    email: "cam@lineup.test",
    password: "password123",
    role: "customer",
    phone: "(555) 645-1297",
    createdAt
  }
];

export const seedBarbers: Barber[] = [
  {
    id: "barber-dre",
    name: "Dre Wallace",
    title: "Fade Specialist",
    specialties: ["Skin fades", "Lineups", "Beard work"],
    active: true,
    availability: [
      { day: 1, start: "09:00", end: "17:00" },
      { day: 2, start: "09:00", end: "17:00" },
      { day: 3, start: "10:00", end: "18:00" },
      { day: 4, start: "09:00", end: "17:00" },
      { day: 5, start: "09:00", end: "18:00" },
      { day: 6, start: "09:00", end: "15:00" }
    ]
  },
  {
    id: "barber-renee",
    name: "Renee King",
    title: "Grooming Lead",
    specialties: ["Premium grooming", "Scissor cuts", "Consultations"],
    active: true,
    availability: [
      { day: 1, start: "11:00", end: "19:00" },
      { day: 2, start: "11:00", end: "19:00" },
      { day: 3, start: "11:00", end: "19:00" },
      { day: 4, start: "11:00", end: "19:00" },
      { day: 5, start: "10:00", end: "18:00" }
    ]
  },
  {
    id: "barber-malik",
    name: "Malik Grant",
    title: "Classic Cuts",
    specialties: ["Kids cuts", "Classic taper", "Hot towel"],
    active: true,
    availability: [
      { day: 2, start: "09:00", end: "16:00" },
      { day: 3, start: "09:00", end: "16:00" },
      { day: 4, start: "09:00", end: "16:00" },
      { day: 5, start: "09:00", end: "16:00" },
      { day: 6, start: "08:00", end: "14:00" }
    ]
  }
];

export const seedServices: Service[] = [
  {
    id: "svc-haircut",
    name: "Haircut",
    description: "Tailored cut, clean neckline, and light styling.",
    price: 35,
    duration: 35,
    active: true
  },
  {
    id: "svc-beard",
    name: "Beard Trim",
    description: "Shape, edge, and finish for a crisp beard profile.",
    price: 22,
    duration: 25,
    active: true
  },
  {
    id: "svc-combo",
    name: "Haircut + Beard",
    description: "Full cut with beard detail, razor line, and finish.",
    price: 52,
    duration: 55,
    active: true
  },
  {
    id: "svc-kids",
    name: "Kids Cut",
    description: "Patient, clean cut for ages 12 and under.",
    price: 25,
    duration: 30,
    active: true
  },
  {
    id: "svc-premium",
    name: "Premium Grooming",
    description: "Consultation, cut, beard, hot towel, and scalp care.",
    price: 78,
    duration: 80,
    active: true
  }
];

export const buildSeedData = (): PortalData => {
  const appointments: Appointment[] = [
    {
      id: "apt-001",
      customerId: "usr-customer-jordan",
      barberId: "barber-dre",
      serviceId: "svc-combo",
      startsAt: isoDate(0, 9, 30),
      status: "confirmed",
      customerNote: "Keep the beard fuller than last time.",
      internalNote: "Repeat client; likes matte finish.",
      createdAt
    },
    {
      id: "apt-002",
      customerId: "usr-customer-noah",
      barberId: "barber-renee",
      serviceId: "svc-premium",
      startsAt: isoDate(0, 12),
      status: "pending",
      createdAt
    },
    {
      id: "apt-003",
      customerId: "usr-customer-avery",
      barberId: "barber-malik",
      serviceId: "svc-kids",
      startsAt: isoDate(0, 14),
      status: "cancellation_requested",
      cancellationReason: "Customer has a school event conflict.",
      createdAt
    },
    {
      id: "apt-004",
      customerId: "usr-customer-miles",
      barberId: "barber-dre",
      serviceId: "svc-haircut",
      startsAt: isoDate(1, 10),
      status: "confirmed",
      createdAt
    },
    {
      id: "apt-005",
      customerId: "usr-customer-cam",
      barberId: "barber-renee",
      serviceId: "svc-beard",
      startsAt: isoDate(2, 16, 30),
      status: "pending",
      createdAt
    },
    {
      id: "apt-006",
      customerId: "usr-customer-jordan",
      barberId: "barber-dre",
      serviceId: "svc-haircut",
      startsAt: isoDate(-6, 11),
      status: "completed",
      createdAt
    },
    {
      id: "apt-007",
      customerId: "usr-customer-noah",
      barberId: "barber-malik",
      serviceId: "svc-kids",
      startsAt: isoDate(-3, 15),
      status: "completed",
      createdAt
    },
    {
      id: "apt-008",
      customerId: "usr-customer-avery",
      barberId: "barber-renee",
      serviceId: "svc-combo",
      startsAt: isoDate(-2, 13),
      status: "no_show",
      internalNote: "Call before confirming next booking.",
      createdAt
    }
  ];

  return {
    users: seedUsers,
    barbers: seedBarbers,
    services: seedServices,
    appointments,
    reviews: [
      {
        id: "rev-001",
        appointmentId: "apt-006",
        customerId: "usr-customer-jordan",
        barberId: "barber-dre",
        serviceId: "svc-haircut",
        rating: 5,
        comment: "Sharp cut and right on time.",
        createdAt
      }
    ],
    settings: {
      shopName: "Lineup Studio",
      timezone: "America/New_York",
      cancellationCutoffHours: 4,
      slotIntervalMinutes: 15,
      currency: "USD"
    }
  };
};
