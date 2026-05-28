import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  DollarSign,
  MoreHorizontal,
  Search,
  Star,
  UserRound
} from "lucide-react";
import { Appointment, AppointmentStatus, Barber, Service, User } from "../types";
import { currency, initials, longDate, statusLabel, timeLabel } from "../lib/format";

export const statusTone: Record<AppointmentStatus, string> = {
  pending: "warning",
  confirmed: "good",
  completed: "neutral",
  cancelled: "danger",
  cancellation_requested: "warning",
  no_show: "danger"
};

export function Avatar({ name }: { name: string }) {
  return <span className="avatar">{initials(name)}</span>;
}

export function Badge({ status }: { status: AppointmentStatus }) {
  return <span className={`badge ${statusTone[status]}`}>{statusLabel(status)}</span>;
}

export function EmptyState({
  title,
  copy,
  icon = "calendar"
}: {
  title: string;
  copy: string;
  icon?: "calendar" | "search" | "user";
}) {
  const Icon = icon === "search" ? Search : icon === "user" ? UserRound : CalendarDays;
  return (
    <div className="empty-state">
      <Icon size={28} />
      <strong>{title}</strong>
      <span>{copy}</span>
    </div>
  );
}

export function ToastMessage({ type, message }: { type: "success" | "error" | "info"; message: string }) {
  const Icon = type === "success" ? CheckCircle2 : type === "error" ? AlertCircle : MoreHorizontal;
  return (
    <div className={`toast ${type}`} role="status">
      <Icon size={18} />
      {message}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon
}: {
  label: string;
  value: string;
  hint: string;
  icon: "calendar" | "money" | "star" | "clock";
}) {
  const Icon = icon === "money" ? DollarSign : icon === "star" ? Star : icon === "clock" ? Clock : CalendarDays;
  return (
    <div className="stat-card">
      <span className="stat-icon">
        <Icon size={18} />
      </span>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </div>
  );
}

export function AppointmentRow({
  appointment,
  customer,
  barber,
  service,
  children
}: {
  appointment: Appointment;
  customer: User;
  barber: Barber;
  service: Service;
  children?: React.ReactNode;
}) {
  return (
    <div className="appointment-row">
      <div className="row-person">
        <Avatar name={customer.name} />
        <div>
          <strong>{customer.name}</strong>
          <span>{service.name}</span>
        </div>
      </div>
      <div>
        <strong>{longDate(appointment.startsAt)}</strong>
        <span>{timeLabel(appointment.startsAt)}</span>
      </div>
      <div>
        <strong>{barber.name}</strong>
        <span>{currency(service.price)} · {service.duration} min</span>
      </div>
      <Badge status={appointment.status} />
      {children ? <div className="row-actions">{children}</div> : null}
    </div>
  );
}

export function MiniBarChart({
  data,
  formatter = (value: number) => String(value)
}: {
  data: { label: string; value: number }[];
  formatter?: (value: number) => string;
}) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <div className="mini-bars">
      {data.map((item) => (
        <div className="bar-line" key={item.label}>
          <span>{item.label}</span>
          <div className="bar-track">
            <span style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
          <strong>{formatter(item.value)}</strong>
        </div>
      ))}
    </div>
  );
}
