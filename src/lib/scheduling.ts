import { Appointment, Barber, PortalData, Service } from "../types";
import { dateKey } from "./format";

const minutesFromTime = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const setMinutes = (date: string, minutes: number) => {
  const next = new Date(`${date}T00:00:00`);
  next.setMinutes(minutes);
  return next;
};

const rangesOverlap = (startA: Date, endA: Date, startB: Date, endB: Date) =>
  startA < endB && startB < endA;

export const appointmentEnd = (appointment: Appointment, service: Service) => {
  const end = new Date(appointment.startsAt);
  end.setMinutes(end.getMinutes() + service.duration);
  return end;
};

export const getAvailableSlots = (
  data: PortalData,
  barberId: string,
  serviceId: string,
  date: string,
  excludeAppointmentId?: string
) => {
  const barber = data.barbers.find((item) => item.id === barberId);
  const service = data.services.find((item) => item.id === serviceId);
  if (!barber || !service) return [];

  const requestedDate = new Date(`${date}T12:00:00`);
  const windows = barber.availability.filter((item) => item.day === requestedDate.getDay());
  const appointments = data.appointments.filter(
    (appointment) =>
      appointment.barberId === barberId &&
      appointment.id !== excludeAppointmentId &&
      !["cancelled", "no_show"].includes(appointment.status) &&
      dateKey(appointment.startsAt) === date
  );

  const slots: string[] = [];
  windows.forEach((window) => {
    const start = minutesFromTime(window.start);
    const end = minutesFromTime(window.end);
    for (let minute = start; minute + service.duration <= end; minute += data.settings.slotIntervalMinutes) {
      const slotStart = setMinutes(date, minute);
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + service.duration);

      const hasConflict = appointments.some((appointment) => {
        const bookedService = data.services.find((item) => item.id === appointment.serviceId);
        if (!bookedService) return false;
        return rangesOverlap(slotStart, slotEnd, new Date(appointment.startsAt), appointmentEnd(appointment, bookedService));
      });

      if (!hasConflict && slotStart > new Date()) {
        slots.push(slotStart.toISOString());
      }
    }
  });

  return slots;
};

export const canCustomerModify = (startsAt: string, cutoffHours: number) => {
  const cutoff = new Date(startsAt);
  cutoff.setHours(cutoff.getHours() - cutoffHours);
  return new Date() < cutoff;
};

export const nextSevenDays = () =>
  Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date.toISOString().slice(0, 10);
  });
