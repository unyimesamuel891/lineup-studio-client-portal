import { buildSeedData } from "../data/seed";
import { Appointment, AppointmentStatus, Barber, PortalData, Review, Service, User } from "../types";

const DATA_KEY = "lineup-studio:data:v1";
const SESSION_KEY = "lineup-studio:session:v1";

export const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const loadData = (): PortalData => {
  const stored = window.localStorage.getItem(DATA_KEY);
  if (!stored) {
    const seeded = buildSeedData();
    saveData(seeded);
    return seeded;
  }

  try {
    return JSON.parse(stored) as PortalData;
  } catch {
    const seeded = buildSeedData();
    saveData(seeded);
    return seeded;
  }
};

export const saveData = (data: PortalData) => {
  window.localStorage.setItem(DATA_KEY, JSON.stringify(data));
};

export const resetData = () => {
  const seeded = buildSeedData();
  saveData(seeded);
  return seeded;
};

export const loadSession = () => window.localStorage.getItem(SESSION_KEY);

export const saveSession = (userId: string) => window.localStorage.setItem(SESSION_KEY, userId);

export const clearSession = () => window.localStorage.removeItem(SESSION_KEY);

export const authenticate = (data: PortalData, email: string, password: string) =>
  data.users.find(
    (user) => user.email.toLowerCase() === email.trim().toLowerCase() && user.password === password
  );

export const registerCustomer = (
  data: PortalData,
  payload: Pick<User, "name" | "email" | "phone"> & { password: string }
): { data: PortalData; user: User } => {
  if (data.users.some((user) => user.email.toLowerCase() === payload.email.trim().toLowerCase())) {
    throw new Error("An account with this email already exists.");
  }

  const user: User = {
    id: uid("usr"),
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
    role: "customer",
    phone: payload.phone.trim(),
    createdAt: new Date().toISOString()
  };

  return { data: { ...data, users: [...data.users, user] }, user };
};

export const upsertUser = (data: PortalData, user: User): PortalData => ({
  ...data,
  users: data.users.map((item) => (item.id === user.id ? user : item))
});

export const upsertService = (data: PortalData, service: Service): PortalData => ({
  ...data,
  services: data.services.some((item) => item.id === service.id)
    ? data.services.map((item) => (item.id === service.id ? service : item))
    : [...data.services, service]
});

export const upsertBarber = (data: PortalData, barber: Barber): PortalData => ({
  ...data,
  barbers: data.barbers.some((item) => item.id === barber.id)
    ? data.barbers.map((item) => (item.id === barber.id ? barber : item))
    : [...data.barbers, barber]
});

export const addAppointment = (
  data: PortalData,
  appointment: Omit<Appointment, "id" | "createdAt" | "status">
): PortalData => ({
  ...data,
  appointments: [
    ...data.appointments,
    {
      ...appointment,
      id: uid("apt"),
      status: "pending",
      createdAt: new Date().toISOString()
    }
  ]
});

export const updateAppointment = (
  data: PortalData,
  appointmentId: string,
  update: Partial<Appointment>
): PortalData => ({
  ...data,
  appointments: data.appointments.map((appointment) =>
    appointment.id === appointmentId ? { ...appointment, ...update } : appointment
  )
});

export const changeAppointmentStatus = (
  data: PortalData,
  appointmentId: string,
  status: AppointmentStatus
) => updateAppointment(data, appointmentId, { status });

export const addReview = (
  data: PortalData,
  review: Omit<Review, "id" | "createdAt">
): PortalData => ({
  ...data,
  reviews: [
    ...data.reviews,
    {
      ...review,
      id: uid("rev"),
      createdAt: new Date().toISOString()
    }
  ]
});
