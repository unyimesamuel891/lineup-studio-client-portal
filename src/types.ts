export type Role = "customer" | "staff" | "admin";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "cancellation_requested"
  | "no_show";

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  phone: string;
  notes?: string;
  createdAt: string;
};

export type AvailabilityWindow = {
  day: number;
  start: string;
  end: string;
};

export type Barber = {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  active: boolean;
  availability: AvailabilityWindow[];
};

export type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  active: boolean;
};

export type Appointment = {
  id: string;
  customerId: string;
  barberId: string;
  serviceId: string;
  startsAt: string;
  status: AppointmentStatus;
  customerNote?: string;
  internalNote?: string;
  cancellationReason?: string;
  createdAt: string;
};

export type Review = {
  id: string;
  appointmentId: string;
  customerId: string;
  barberId: string;
  serviceId: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type BusinessSettings = {
  shopName: string;
  timezone: string;
  cancellationCutoffHours: number;
  slotIntervalMinutes: number;
  currency: string;
};

export type PortalData = {
  users: User[];
  barbers: Barber[];
  services: Service[];
  appointments: Appointment[];
  reviews: Review[];
  settings: BusinessSettings;
};

export type Toast = {
  type: "success" | "error" | "info";
  message: string;
};
