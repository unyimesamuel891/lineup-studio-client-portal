import { FormEvent, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Check,
  CircleDollarSign,
  ClipboardList,
  LayoutDashboard,
  Search,
  Settings,
  UsersRound,
  X
} from "lucide-react";
import {
  changeAppointmentStatus,
  resetData,
  updateAppointment,
  upsertBarber,
  upsertService,
  upsertUser,
  uid
} from "../lib/portalDb";
import { currency, dateKey, longDate, shortDate, timeLabel, todayInputValue } from "../lib/format";
import { Appointment, Barber, PortalData, Service, Toast, User } from "../types";
import { AppointmentRow, Avatar, EmptyState, MiniBarChart, StatCard } from "./Shared";

type StaffPortalProps = {
  data: PortalData;
  user: User;
  onDataChange: (data: PortalData) => void;
  onToast: (toast: Toast) => void;
  onLogout: () => void;
};

export default function StaffPortal({ data, user, onDataChange, onToast, onLogout }: StaffPortalProps) {
  const [view, setView] = useState<"dashboard" | "appointments" | "customers" | "manage" | "calendar">("dashboard");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState(todayInputValue());
  const [serviceDraft, setServiceDraft] = useState<Service>(data.services[0]);
  const [barberDraft, setBarberDraft] = useState<Barber>(data.barbers[0]);

  const lookup = useMemo(() => makeLookup(data), [data]);
  const completedAppointments = data.appointments.filter((appointment) => appointment.status === "completed");
  const weeklyAppointments = data.appointments.filter((appointment) => {
    const daysAgo = (Date.now() - new Date(appointment.startsAt).getTime()) / 86400000;
    return daysAgo >= 0 && daysAgo <= 7;
  });
  const todayAppointments = data.appointments
    .filter((appointment) => dateKey(appointment.startsAt) === todayInputValue())
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  const weeklyRevenue = weeklyAppointments
    .filter((appointment) => appointment.status === "completed")
    .reduce((sum, appointment) => sum + (lookup.services.get(appointment.serviceId)?.price ?? 0), 0);
  const repeatCustomers = data.users.filter((item) => {
    if (item.role !== "customer") return false;
    return data.appointments.filter((appointment) => appointment.customerId === item.id).length > 1;
  }).length;
  const pendingCancellations = data.appointments.filter((appointment) => appointment.status === "cancellation_requested").length;

  const appointmentList = data.appointments
    .filter((appointment) => {
      const customer = lookup.users.get(appointment.customerId);
      const barber = lookup.barbers.get(appointment.barberId);
      const service = lookup.services.get(appointment.serviceId);
      const haystack = `${customer?.name} ${customer?.email} ${barber?.name} ${service?.name}`.toLowerCase();
      const matchesQuery = haystack.includes(query.toLowerCase());
      const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
      return matchesQuery && matchesStatus;
    })
    .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());

  const customers = data.users
    .filter((item) => item.role === "customer")
    .filter((customer) => `${customer.name} ${customer.email} ${customer.phone}`.toLowerCase().includes(query.toLowerCase()));

  const servicePopularity = data.services.map((service) => ({
    label: service.name,
    value: data.appointments.filter((appointment) => appointment.serviceId === service.id).length
  }));

  const revenueByDay = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = dateKey(date);
    const total = data.appointments
      .filter((appointment) => appointment.status === "completed" && dateKey(appointment.startsAt) === key)
      .reduce((sum, appointment) => sum + (lookup.services.get(appointment.serviceId)?.price ?? 0), 0);
    return { label: shortDate(date.toISOString()), value: total };
  });

  const setStatus = (appointment: Appointment, status: Appointment["status"]) => {
    onDataChange(changeAppointmentStatus(data, appointment.id, status));
    onToast({ type: "success", message: `Appointment marked ${status.replace("_", " ")}.` });
  };

  const saveService = (event: FormEvent) => {
    event.preventDefault();
    if (!serviceDraft.name.trim() || serviceDraft.price < 0 || serviceDraft.duration < 10) {
      onToast({ type: "error", message: "Services need a name, price, and duration of at least 10 minutes." });
      return;
    }
    onDataChange(upsertService(data, serviceDraft));
    onToast({ type: "success", message: "Service saved." });
  };

  const saveBarber = (event: FormEvent) => {
    event.preventDefault();
    if (!barberDraft.name.trim() || !barberDraft.title.trim()) {
      onToast({ type: "error", message: "Barbers need a name and title." });
      return;
    }
    onDataChange(upsertBarber(data, barberDraft));
    onToast({ type: "success", message: "Barber saved." });
  };

  const resetDemo = () => {
    const seeded = resetData();
    onDataChange(seeded);
    setServiceDraft(seeded.services[0]);
    setBarberDraft(seeded.barbers[0]);
    onToast({ type: "info", message: "Demo data reset." });
  };

  return (
    <main className="staff-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <span className="brand-mark">LS</span>
          <div>
            <strong>Lineup Studio</strong>
            <span>{user.role === "admin" ? "Owner console" : "Staff console"}</span>
          </div>
        </div>
        <nav className="side-nav" aria-label="Staff navigation">
          <button className={view === "dashboard" ? "active" : ""} onClick={() => setView("dashboard")}>
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button className={view === "appointments" ? "active" : ""} onClick={() => setView("appointments")}>
            <ClipboardList size={18} /> Appointments
          </button>
          <button className={view === "customers" ? "active" : ""} onClick={() => setView("customers")}>
            <UsersRound size={18} /> Customers
          </button>
          <button className={view === "manage" ? "active" : ""} onClick={() => setView("manage")}>
            <Settings size={18} /> Manage
          </button>
          <button className={view === "calendar" ? "active" : ""} onClick={() => setView("calendar")}>
            <CalendarDays size={18} /> Calendar
          </button>
        </nav>
        <button className="ghost-btn" onClick={onLogout}>
          Sign out
        </button>
      </aside>

      <section className="staff-content">
        <header className="topbar">
          <div>
            <span className="eyebrow">{view}</span>
            <h1>{viewTitle[view]}</h1>
          </div>
          <div className="toolbar">
            <button className="ghost-btn" onClick={resetDemo}>Reset demo</button>
          </div>
        </header>

        {view === "dashboard" ? (
          <Dashboard
            todayAppointments={todayAppointments}
            lookup={lookup}
            weeklyRevenue={weeklyRevenue}
            completedAppointments={completedAppointments}
            repeatCustomers={repeatCustomers}
            pendingCancellations={pendingCancellations}
            servicePopularity={servicePopularity}
            revenueByDay={revenueByDay}
            setStatus={setStatus}
          />
        ) : null}

        {view === "appointments" ? (
          <section className="panel">
            <ListTools
              query={query}
              setQuery={setQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />
            <div className="appointment-list">
              {appointmentList.length ? (
                appointmentList.map((appointment) => (
                  <AppointmentItem
                    appointment={appointment}
                    data={data}
                    key={appointment.id}
                    setStatus={setStatus}
                    updateNote={(note) => {
                      onDataChange(updateAppointment(data, appointment.id, { internalNote: note }));
                      onToast({ type: "success", message: "Appointment note saved." });
                    }}
                  />
                ))
              ) : (
                <EmptyState title="No appointments found" copy="Change the search or status filter." icon="search" />
              )}
            </div>
          </section>
        ) : null}

        {view === "customers" ? (
          <section className="panel">
            <div className="list-tools">
              <label className="search-field">
                <Search size={18} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customers" />
              </label>
            </div>
            <div className="customer-directory">
              {customers.map((customer) => (
                <CustomerDirectoryCard
                  customer={customer}
                  data={data}
                  key={customer.id}
                  saveNote={(note) => {
                    onDataChange(upsertUser(data, { ...customer, notes: note }));
                    onToast({ type: "success", message: "Customer note saved." });
                  }}
                />
              ))}
            </div>
          </section>
        ) : null}

        {view === "manage" ? (
          <section className="manage-grid">
            <form className="panel stack-form" onSubmit={saveService}>
              <div className="panel-heading">
                <h2>Services</h2>
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() =>
                    setServiceDraft({
                      id: uid("svc"),
                      name: "",
                      description: "",
                      price: 35,
                      duration: 30,
                      active: true
                    })
                  }
                >
                  New
                </button>
              </div>
              <select value={serviceDraft.id} onChange={(event) => setServiceDraft(data.services.find((service) => service.id === event.target.value) ?? serviceDraft)}>
                {data.services.map((service) => (
                  <option value={service.id} key={service.id}>{service.name}</option>
                ))}
              </select>
              <label>Name<input value={serviceDraft.name} onChange={(event) => setServiceDraft({ ...serviceDraft, name: event.target.value })} /></label>
              <label>Description<textarea value={serviceDraft.description} onChange={(event) => setServiceDraft({ ...serviceDraft, description: event.target.value })} /></label>
              <div className="two-col">
                <label>Price<input type="number" min={0} value={serviceDraft.price} onChange={(event) => setServiceDraft({ ...serviceDraft, price: Number(event.target.value) })} /></label>
                <label>Duration<input type="number" min={10} step={5} value={serviceDraft.duration} onChange={(event) => setServiceDraft({ ...serviceDraft, duration: Number(event.target.value) })} /></label>
              </div>
              <label className="check-row"><input type="checkbox" checked={serviceDraft.active} onChange={(event) => setServiceDraft({ ...serviceDraft, active: event.target.checked })} /> Active</label>
              <button className="primary-btn" type="submit">Save service</button>
            </form>

            <form className="panel stack-form" onSubmit={saveBarber}>
              <div className="panel-heading">
                <h2>Barbers</h2>
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() =>
                    setBarberDraft({
                      id: uid("barber"),
                      name: "",
                      title: "",
                      specialties: [],
                      active: true,
                      availability: [
                        { day: 1, start: "09:00", end: "17:00" },
                        { day: 2, start: "09:00", end: "17:00" },
                        { day: 3, start: "09:00", end: "17:00" },
                        { day: 4, start: "09:00", end: "17:00" },
                        { day: 5, start: "09:00", end: "17:00" }
                      ]
                    })
                  }
                >
                  New
                </button>
              </div>
              <select value={barberDraft.id} onChange={(event) => setBarberDraft(data.barbers.find((barber) => barber.id === event.target.value) ?? barberDraft)}>
                {data.barbers.map((barber) => (
                  <option value={barber.id} key={barber.id}>{barber.name}</option>
                ))}
              </select>
              <label>Name<input value={barberDraft.name} onChange={(event) => setBarberDraft({ ...barberDraft, name: event.target.value })} /></label>
              <label>Title<input value={barberDraft.title} onChange={(event) => setBarberDraft({ ...barberDraft, title: event.target.value })} /></label>
              <label>Specialties<input value={barberDraft.specialties.join(", ")} onChange={(event) => setBarberDraft({ ...barberDraft, specialties: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} /></label>
              <label className="check-row"><input type="checkbox" checked={barberDraft.active} onChange={(event) => setBarberDraft({ ...barberDraft, active: event.target.checked })} /> Active</label>
              <div className="availability-editor">
                {barberDraft.availability.map((window, index) => (
                  <div className="availability-row" key={`${window.day}-${index}`}>
                    <select value={window.day} onChange={(event) => {
                      const next = [...barberDraft.availability];
                      next[index] = { ...window, day: Number(event.target.value) };
                      setBarberDraft({ ...barberDraft, availability: next });
                    }}>
                      {days.map((day, dayIndex) => <option value={dayIndex} key={day}>{day}</option>)}
                    </select>
                    <input type="time" value={window.start} onChange={(event) => {
                      const next = [...barberDraft.availability];
                      next[index] = { ...window, start: event.target.value };
                      setBarberDraft({ ...barberDraft, availability: next });
                    }} />
                    <input type="time" value={window.end} onChange={(event) => {
                      const next = [...barberDraft.availability];
                      next[index] = { ...window, end: event.target.value };
                      setBarberDraft({ ...barberDraft, availability: next });
                    }} />
                  </div>
                ))}
              </div>
              <button className="primary-btn" type="submit">Save barber</button>
            </form>
          </section>
        ) : null}

        {view === "calendar" ? (
          <section className="panel">
            <div className="list-tools">
              <label>
                Schedule date
                <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
              </label>
            </div>
            <CalendarView data={data} lookup={lookup} selectedDate={selectedDate} />
          </section>
        ) : null}
      </section>
    </main>
  );
}

const viewTitle = {
  dashboard: "Shop dashboard",
  appointments: "Appointment operations",
  customers: "Customer directory",
  manage: "Services, barbers, availability",
  calendar: "Daily schedule"
};

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const makeLookup = (data: PortalData) => ({
  users: new Map(data.users.map((item) => [item.id, item])),
  barbers: new Map(data.barbers.map((item) => [item.id, item])),
  services: new Map(data.services.map((item) => [item.id, item]))
});

type Lookup = ReturnType<typeof makeLookup>;

function Dashboard({
  todayAppointments,
  lookup,
  weeklyRevenue,
  completedAppointments,
  repeatCustomers,
  pendingCancellations,
  servicePopularity,
  revenueByDay,
  setStatus
}: {
  todayAppointments: Appointment[];
  lookup: Lookup;
  weeklyRevenue: number;
  completedAppointments: Appointment[];
  repeatCustomers: number;
  pendingCancellations: number;
  servicePopularity: { label: string; value: number }[];
  revenueByDay: { label: string; value: number }[];
  setStatus: (appointment: Appointment, status: Appointment["status"]) => void;
}) {
  return (
    <>
      <section className="stat-grid">
        <StatCard label="Today" value={String(todayAppointments.length)} hint="appointments on schedule" icon="calendar" />
        <StatCard label="Weekly revenue" value={currency(weeklyRevenue)} hint="completed visits" icon="money" />
        <StatCard label="Repeat customers" value={String(repeatCustomers)} hint="booked more than once" icon="star" />
        <StatCard label="Pending cancellations" value={String(pendingCancellations)} hint="needs staff action" icon="clock" />
      </section>
      <section className="dashboard-grid">
        <div className="panel">
          <div className="panel-heading">
            <h2>Today’s appointments</h2>
            <span>{todayAppointments.length} visits</span>
          </div>
          <div className="appointment-list">
            {todayAppointments.length ? (
              todayAppointments.map((appointment) => {
                const customer = lookup.users.get(appointment.customerId);
                const barber = lookup.barbers.get(appointment.barberId);
                const service = lookup.services.get(appointment.serviceId);
                if (!customer || !barber || !service) return null;
                return (
                  <AppointmentRow appointment={appointment} customer={customer} barber={barber} service={service} key={appointment.id}>
                    <QuickActions appointment={appointment} setStatus={setStatus} />
                  </AppointmentRow>
                );
              })
            ) : (
              <EmptyState title="No appointments today" copy="The daily schedule is clear." />
            )}
          </div>
        </div>
        <div className="panel">
          <div className="panel-heading">
            <h2>Revenue</h2>
            <CircleDollarSign size={18} />
          </div>
          <MiniBarChart data={revenueByDay} formatter={currency} />
        </div>
        <div className="panel">
          <div className="panel-heading">
            <h2>Top services</h2>
            <BarChart3 size={18} />
          </div>
          <MiniBarChart data={servicePopularity} />
        </div>
        <div className="panel">
          <div className="panel-heading">
            <h2>Completed work</h2>
            <span>{completedAppointments.length} visits</span>
          </div>
          <p className="muted-copy">
            Completed appointments power revenue analytics and unlock customer reviews. Keep visit states current
            throughout the day.
          </p>
        </div>
      </section>
    </>
  );
}

function ListTools({
  query,
  setQuery,
  statusFilter,
  setStatusFilter
}: {
  query: string;
  setQuery: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
}) {
  return (
    <div className="list-tools">
      <label className="search-field">
        <Search size={18} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search appointments" />
      </label>
      <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
        <option value="all">All statuses</option>
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="completed">Completed</option>
        <option value="cancellation_requested">Cancellation requested</option>
        <option value="cancelled">Cancelled</option>
        <option value="no_show">No-show</option>
      </select>
    </div>
  );
}

function AppointmentItem({
  appointment,
  data,
  setStatus,
  updateNote
}: {
  appointment: Appointment;
  data: PortalData;
  setStatus: (appointment: Appointment, status: Appointment["status"]) => void;
  updateNote: (note: string) => void;
}) {
  const [note, setNote] = useState(appointment.internalNote ?? "");
  const customer = data.users.find((item) => item.id === appointment.customerId);
  const barber = data.barbers.find((item) => item.id === appointment.barberId);
  const service = data.services.find((item) => item.id === appointment.serviceId);
  if (!customer || !barber || !service) return null;

  return (
    <div className="appointment-detail">
      <AppointmentRow appointment={appointment} customer={customer} barber={barber} service={service}>
        <QuickActions appointment={appointment} setStatus={setStatus} />
      </AppointmentRow>
      <div className="note-row">
        <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Internal appointment note" />
        <button className="ghost-btn" type="button" onClick={() => updateNote(note)}>Save note</button>
      </div>
      {appointment.cancellationReason ? <p className="form-error">{appointment.cancellationReason}</p> : null}
    </div>
  );
}

function QuickActions({
  appointment,
  setStatus
}: {
  appointment: Appointment;
  setStatus: (appointment: Appointment, status: Appointment["status"]) => void;
}) {
  return (
    <>
      {appointment.status === "pending" || appointment.status === "cancellation_requested" ? (
        <button className="icon-btn" title="Confirm" onClick={() => setStatus(appointment, "confirmed")}>
          <Check size={16} />
        </button>
      ) : null}
      {appointment.status === "confirmed" || appointment.status === "pending" ? (
        <button className="icon-btn" title="Complete" onClick={() => setStatus(appointment, "completed")}>
          <Check size={16} />
        </button>
      ) : null}
      {appointment.status !== "cancelled" && appointment.status !== "completed" ? (
        <button className="icon-btn danger" title="Cancel" onClick={() => setStatus(appointment, "cancelled")}>
          <X size={16} />
        </button>
      ) : null}
      {appointment.status !== "completed" && appointment.status !== "no_show" ? (
        <button className="ghost-btn compact" onClick={() => setStatus(appointment, "no_show")}>No-show</button>
      ) : null}
    </>
  );
}

function CustomerDirectoryCard({
  customer,
  data,
  saveNote
}: {
  customer: User;
  data: PortalData;
  saveNote: (note: string) => void;
}) {
  const [note, setNote] = useState(customer.notes ?? "");
  const appointments = data.appointments
    .filter((appointment) => appointment.customerId === customer.id)
    .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());
  const revenue = appointments
    .filter((appointment) => appointment.status === "completed")
    .reduce((sum, appointment) => sum + (data.services.find((service) => service.id === appointment.serviceId)?.price ?? 0), 0);

  return (
    <article className="customer-card">
      <div className="customer-card-head">
        <Avatar name={customer.name} />
        <div>
          <strong>{customer.name}</strong>
          <span>{customer.email}</span>
          <small>{customer.phone}</small>
        </div>
      </div>
      <div className="customer-metrics">
        <span>{appointments.length} visits</span>
        <span>{currency(revenue)} revenue</span>
      </div>
      <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Customer preferences or follow-up notes" />
      <button className="ghost-btn" type="button" onClick={() => saveNote(note)}>Save note</button>
      <div className="history-list">
        {appointments.slice(0, 4).map((appointment) => {
          const service = data.services.find((item) => item.id === appointment.serviceId);
          return (
            <span key={appointment.id}>{longDate(appointment.startsAt)} · {service?.name ?? "Service"} · {appointment.status}</span>
          );
        })}
      </div>
    </article>
  );
}

function CalendarView({ data, lookup, selectedDate }: { data: PortalData; lookup: Lookup; selectedDate: string }) {
  const appointments = data.appointments
    .filter((appointment) => dateKey(appointment.startsAt) === selectedDate && appointment.status !== "cancelled")
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  return (
    <div className="calendar-board">
      {data.barbers.map((barber) => (
        <div className="calendar-column" key={barber.id}>
          <div className="calendar-head">
            <strong>{barber.name}</strong>
            <span>{barber.title}</span>
          </div>
          {appointments.filter((appointment) => appointment.barberId === barber.id).length ? (
            appointments
              .filter((appointment) => appointment.barberId === barber.id)
              .map((appointment) => {
                const customer = lookup.users.get(appointment.customerId);
                const service = lookup.services.get(appointment.serviceId);
                return (
                  <div className={`calendar-block ${appointment.status}`} key={appointment.id}>
                    <strong>{timeLabel(appointment.startsAt)}</strong>
                    <span>{customer?.name}</span>
                    <small>{service?.name}</small>
                  </div>
                );
              })
          ) : (
            <EmptyState title="Open day" copy="No bookings for this barber." />
          )}
        </div>
      ))}
    </div>
  );
}
