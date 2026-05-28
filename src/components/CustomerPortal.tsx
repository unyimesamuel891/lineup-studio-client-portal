import { FormEvent, useMemo, useState } from "react";
import { CalendarPlus, History, Save, Star, UserRound, XCircle } from "lucide-react";
import { addAppointment, addReview, updateAppointment, upsertUser } from "../lib/portalDb";
import { canCustomerModify, getAvailableSlots, nextSevenDays } from "../lib/scheduling";
import { currency, dateKey, longDate, timeLabel } from "../lib/format";
import { Appointment, PortalData, Toast, User } from "../types";
import { Badge, EmptyState } from "./Shared";

type CustomerPortalProps = {
  data: PortalData;
  user: User;
  onDataChange: (data: PortalData) => void;
  onToast: (toast: Toast) => void;
  onLogout: () => void;
};

export default function CustomerPortal({ data, user, onDataChange, onToast, onLogout }: CustomerPortalProps) {
  const [tab, setTab] = useState<"book" | "appointments" | "profile">("book");
  const [booking, setBooking] = useState({
    serviceId: data.services.find((service) => service.active)?.id ?? "",
    barberId: data.barbers.find((barber) => barber.active)?.id ?? "",
    date: nextSevenDays()[1],
    slot: "",
    note: ""
  });
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [profile, setProfile] = useState({ name: user.name, phone: user.phone, notes: user.notes ?? "" });
  const [review, setReview] = useState({ appointmentId: "", rating: 5, comment: "" });
  const [error, setError] = useState("");

  const activeServices = data.services.filter((service) => service.active);
  const activeBarbers = data.barbers.filter((barber) => barber.active);
  const slots = useMemo(
    () => getAvailableSlots(data, booking.barberId, booking.serviceId, booking.date, rescheduleId ?? undefined),
    [data, booking.barberId, booking.date, booking.serviceId, rescheduleId]
  );

  const customerAppointments = data.appointments
    .filter((appointment) => appointment.customerId === user.id)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  const upcoming = customerAppointments.filter(
    (appointment) => new Date(appointment.startsAt) >= new Date() && appointment.status !== "cancelled"
  );
  const past = customerAppointments.filter(
    (appointment) => new Date(appointment.startsAt) < new Date() || ["completed", "cancelled", "no_show"].includes(appointment.status)
  );

  const submitBooking = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!booking.serviceId || !booking.barberId || !booking.date || !booking.slot) {
      setError("Choose a service, barber, date, and time before booking.");
      return;
    }

    if (rescheduleId) {
      onDataChange(updateAppointment(data, rescheduleId, { startsAt: booking.slot, status: "pending" }));
      onToast({ type: "success", message: "Appointment rescheduled and sent for confirmation." });
      setRescheduleId(null);
    } else {
      onDataChange(
        addAppointment(data, {
          customerId: user.id,
          barberId: booking.barberId,
          serviceId: booking.serviceId,
          startsAt: booking.slot,
          customerNote: booking.note.trim()
        })
      );
      onToast({ type: "success", message: "Booking request received. Staff will confirm it shortly." });
    }
    setBooking((current) => ({ ...current, slot: "", note: "" }));
  };

  const requestCancel = (appointment: Appointment) => {
    if (!canCustomerModify(appointment.startsAt, data.settings.cancellationCutoffHours)) {
      onToast({ type: "error", message: `Appointments must be changed at least ${data.settings.cancellationCutoffHours} hours ahead.` });
      return;
    }

    const status = appointment.status === "pending" ? "cancelled" : "cancellation_requested";
    onDataChange(updateAppointment(data, appointment.id, { status, cancellationReason: "Requested by customer." }));
    onToast({
      type: "success",
      message: status === "cancelled" ? "Appointment cancelled." : "Cancellation request sent to staff."
    });
  };

  const startReschedule = (appointment: Appointment) => {
    if (!canCustomerModify(appointment.startsAt, data.settings.cancellationCutoffHours)) {
      onToast({ type: "error", message: `Rescheduling closes ${data.settings.cancellationCutoffHours} hours before the appointment.` });
      return;
    }
    setBooking({
      serviceId: appointment.serviceId,
      barberId: appointment.barberId,
      date: dateKey(appointment.startsAt),
      slot: appointment.startsAt,
      note: appointment.customerNote ?? ""
    });
    setRescheduleId(appointment.id);
    setTab("book");
  };

  const submitProfile = (event: FormEvent) => {
    event.preventDefault();
    if (profile.name.trim().length < 2 || profile.phone.trim().length < 7) {
      onToast({ type: "error", message: "Profile needs a valid name and phone number." });
      return;
    }
    onDataChange(upsertUser(data, { ...user, name: profile.name, phone: profile.phone, notes: profile.notes }));
    onToast({ type: "success", message: "Profile updated." });
  };

  const submitReview = (event: FormEvent) => {
    event.preventDefault();
    const appointment = data.appointments.find((item) => item.id === review.appointmentId);
    if (!appointment || review.comment.trim().length < 3) {
      onToast({ type: "error", message: "Choose a completed visit and add a short review." });
      return;
    }
    onDataChange(
      addReview(data, {
        appointmentId: appointment.id,
        customerId: user.id,
        barberId: appointment.barberId,
        serviceId: appointment.serviceId,
        rating: review.rating,
        comment: review.comment.trim()
      })
    );
    setReview({ appointmentId: "", rating: 5, comment: "" });
    onToast({ type: "success", message: "Review added. Thanks for helping the shop improve." });
  };

  const completedWithoutReview = customerAppointments.filter(
    (appointment) =>
      appointment.status === "completed" && !data.reviews.some((item) => item.appointmentId === appointment.id)
  );

  return (
    <main className="customer-shell">
      <header className="topbar">
        <div>
          <span className="eyebrow">Lineup Studio</span>
          <h1>Welcome back, {user.name.split(" ")[0]}</h1>
        </div>
        <button className="ghost-btn" onClick={onLogout}>
          Sign out
        </button>
      </header>

      <nav className="customer-tabs" aria-label="Customer navigation">
        <button className={tab === "book" ? "active" : ""} onClick={() => setTab("book")}>
          <CalendarPlus size={18} /> Book
        </button>
        <button className={tab === "appointments" ? "active" : ""} onClick={() => setTab("appointments")}>
          <History size={18} /> Appointments
        </button>
        <button className={tab === "profile" ? "active" : ""} onClick={() => setTab("profile")}>
          <UserRound size={18} /> Profile
        </button>
      </nav>

      {tab === "book" ? (
        <section className="customer-grid">
          <form className="panel stack-form" onSubmit={submitBooking}>
            <div className="panel-heading">
              <h2>{rescheduleId ? "Reschedule appointment" : "Book a chair"}</h2>
              {rescheduleId ? (
                <button type="button" className="icon-btn" onClick={() => setRescheduleId(null)} title="Cancel reschedule">
                  <XCircle size={18} />
                </button>
              ) : null}
            </div>
            <label>
              Service
              <select value={booking.serviceId} onChange={(event) => setBooking({ ...booking, serviceId: event.target.value, slot: "" })}>
                {activeServices.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} · {currency(service.price)} · {service.duration} min
                  </option>
                ))}
              </select>
            </label>
            <label>
              Barber
              <select value={booking.barberId} onChange={(event) => setBooking({ ...booking, barberId: event.target.value, slot: "" })}>
                {activeBarbers.map((barber) => (
                  <option key={barber.id} value={barber.id}>
                    {barber.name} · {barber.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Date
              <input type="date" min={nextSevenDays()[0]} value={booking.date} onChange={(event) => setBooking({ ...booking, date: event.target.value, slot: "" })} />
            </label>
            <label>
              Notes for the barber
              <textarea value={booking.note} onChange={(event) => setBooking({ ...booking, note: event.target.value })} placeholder="Style notes, timing details, or preferences" />
            </label>
            {error ? <p className="form-error">{error}</p> : null}
            <button className="primary-btn" type="submit">
              {rescheduleId ? "Save new time" : "Request booking"}
            </button>
          </form>

          <section className="panel">
            <div className="panel-heading">
              <h2>Available times</h2>
              <span>{booking.date}</span>
            </div>
            <div className="slot-grid">
              {slots.length ? (
                slots.map((slot) => (
                  <button
                    className={booking.slot === slot ? "slot active" : "slot"}
                    key={slot}
                    type="button"
                    onClick={() => setBooking({ ...booking, slot })}
                  >
                    {timeLabel(slot)}
                  </button>
                ))
              ) : (
                <EmptyState title="No open slots" copy="Try a different date, service, or barber." />
              )}
            </div>
          </section>
        </section>
      ) : null}

      {tab === "appointments" ? (
        <section className="customer-grid">
          <div className="panel">
            <div className="panel-heading">
              <h2>Upcoming</h2>
              <span>{upcoming.length} booked</span>
            </div>
            <div className="stack-list">
              {upcoming.length ? (
                upcoming.map((appointment) => (
                  <CustomerAppointmentCard
                    appointment={appointment}
                    data={data}
                    key={appointment.id}
                    onCancel={() => requestCancel(appointment)}
                    onReschedule={() => startReschedule(appointment)}
                  />
                ))
              ) : (
                <EmptyState title="Nothing on the books" copy="Book your next visit in a few taps." />
              )}
            </div>
          </div>
          <div className="panel">
            <div className="panel-heading">
              <h2>Past visits</h2>
              <span>{past.length} total</span>
            </div>
            <div className="stack-list">
              {past.length ? (
                past.map((appointment) => (
                  <CustomerAppointmentCard appointment={appointment} data={data} key={appointment.id} compact />
                ))
              ) : (
                <EmptyState title="No visit history yet" copy="Completed appointments will appear here." />
              )}
            </div>
          </div>
          <form className="panel stack-form" onSubmit={submitReview}>
            <div className="panel-heading">
              <h2>Leave a review</h2>
              <Star size={18} />
            </div>
            <label>
              Completed visit
              <select value={review.appointmentId} onChange={(event) => setReview({ ...review, appointmentId: event.target.value })}>
                <option value="">Select appointment</option>
                {completedWithoutReview.map((appointment) => (
                  <option key={appointment.id} value={appointment.id}>
                    {longDate(appointment.startsAt)} · {data.services.find((item) => item.id === appointment.serviceId)?.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Rating
              <input type="number" min={1} max={5} value={review.rating} onChange={(event) => setReview({ ...review, rating: Number(event.target.value) })} />
            </label>
            <label>
              Review
              <textarea value={review.comment} onChange={(event) => setReview({ ...review, comment: event.target.value })} placeholder="What went well?" />
            </label>
            <button className="primary-btn" type="submit">
              Submit review
            </button>
          </form>
        </section>
      ) : null}

      {tab === "profile" ? (
        <form className="panel stack-form profile-panel" onSubmit={submitProfile}>
          <div className="panel-heading">
            <h2>Profile details</h2>
            <Save size={18} />
          </div>
          <label>
            Name
            <input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} />
          </label>
          <label>
            Phone
            <input value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} />
          </label>
          <label>
            Customer notes
            <textarea value={profile.notes} onChange={(event) => setProfile({ ...profile, notes: event.target.value })} />
          </label>
          <button className="primary-btn" type="submit">
            Save profile
          </button>
        </form>
      ) : null}
    </main>
  );
}

function CustomerAppointmentCard({
  appointment,
  data,
  onCancel,
  onReschedule,
  compact
}: {
  appointment: Appointment;
  data: PortalData;
  onCancel?: () => void;
  onReschedule?: () => void;
  compact?: boolean;
}) {
  const service = data.services.find((item) => item.id === appointment.serviceId);
  const barber = data.barbers.find((item) => item.id === appointment.barberId);
  if (!service || !barber) return null;

  return (
    <article className="visit-card">
      <div>
        <strong>{service.name}</strong>
        <span>
          {longDate(appointment.startsAt)} at {timeLabel(appointment.startsAt)}
        </span>
        <small>{barber.name} · {currency(service.price)}</small>
      </div>
      <Badge status={appointment.status} />
      {!compact && appointment.status !== "cancellation_requested" ? (
        <div className="split-actions">
          <button className="ghost-btn" type="button" onClick={onReschedule}>
            Reschedule
          </button>
          <button className="danger-btn" type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      ) : null}
    </article>
  );
}
