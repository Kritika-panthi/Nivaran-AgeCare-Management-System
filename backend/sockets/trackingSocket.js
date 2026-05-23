import Booking from "../models/booking.js";
import sendEmail from "../utils/sendEmail.js";
import User from "../models/user.js";

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export const initTrackingSocket = (io) => {
  io.on("connection", (socket) => {

    socket.on("join-booking", (bookingId) => {
      socket.join(bookingId);
    });

    socket.on("send-location", async ({ bookingId, lat, lng }) => {
      const booking = await Booking.findById(bookingId);

      if (!booking || booking.status !== "confirmed") return;

      const parent = booking.tracking.parentLocation;

      if (
        typeof lat !== "number" ||
        typeof lng !== "number" ||
        typeof parent?.lat !== "number" ||
        typeof parent?.lng !== "number"
      ) {
        console.log("Invalid coordinates:", { lat, lng, parent });
        return;
      }

      const distance = getDistance(lat, lng, parent.lat, parent.lng);

      if (isNaN(distance)) {
        console.log("Distance is NaN");
        return;
      }

      let newStatus = booking.tracking.status;
      const previousStatus = booking.tracking.status;

      if ((newStatus === "PENDING" || newStatus === "OUT") && distance <= 50) {
        newStatus = "IN";
        booking.tracking.enteredAt = new Date();
        booking.tracking.leftAt = null;
      }

      if (newStatus === "IN" && distance > 50) {
        newStatus = "OUT";
        booking.tracking.leftAt = new Date();
      }

      booking.tracking.status = newStatus;
     booking.tracking.distance = Number.isFinite(distance)
      ? Math.round(distance)
      : 0;

      booking.tracking.caregiverLocation = {
        lat,
        lng,
        updatedAt: new Date(),
      };

      await booking.save();

      if (previousStatus !== "IN" && newStatus === "IN") {
        // Send email to client — caregiver has arrived
        try {
          const populatedBooking = await Booking.findById(
            booking._id
          ).populate("client", "email fullName");

          const clientUser = populatedBooking?.client;
          const arrivalTime = new Date().toLocaleTimeString(
            "en-US",
            { hour: "2-digit", minute: "2-digit" }
          );
          const arrivalDate = new Date().toLocaleDateString(
            "en-US",
            { weekday: "long", month: "long", day: "numeric" }
          );

          if (clientUser?.email) {
            await sendEmail({
              to: clientUser.email,
              subject: "Your Caregiver Has Arrived — Nivaran",
              html: `
          <div style="font-family:sans-serif;
                      max-width:520px;margin:auto;
                      padding:24px;
                      border:1px solid #e5e7eb;
                      border-radius:12px;">
            <h2 style="color:#2E4E3F;">
              Caregiver Has Arrived ✓
            </h2>
            <p>Hi <strong>${clientUser.fullName}</strong>,
            </p>
            <p>Your caregiver has arrived at the care
               location.</p>
            <table style="width:100%;
                          border-collapse:collapse;
                          margin:16px 0;">
              <tr>
                <td style="padding:8px 0;color:#6b7280;">
                  Arrived At
                </td>
                <td style="padding:8px 0;font-weight:600;">
                  ${arrivalTime}
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#6b7280;">
                  Date
                </td>
                <td style="padding:8px 0;font-weight:600;">
                  ${arrivalDate}
                </td>
              </tr>
            </table>
            <p style="color:#6b7280;font-size:13px;">
              You can track your caregiver live on
              Nivaran.
            </p>
            <p style="color:#2E4E3F;font-weight:600;
                      margin-top:24px;">
              — Nivaran Team
            </p>
          </div>
        `,
            });
          }
        } catch (emailErr) {
          console.error(
            "Arrival email failed:", emailErr.message
          );
        }
      }

      if (previousStatus === "IN" && newStatus === "OUT") {
        // Send email to client — caregiver has left
        try {
          const populatedBooking = await Booking.findById(
            booking._id
          ).populate("client", "email fullName");

          const clientUser = populatedBooking?.client;
          const leftTime = new Date().toLocaleTimeString(
            "en-US",
            { hour: "2-digit", minute: "2-digit" }
          );
          const leftDate = new Date().toLocaleDateString(
            "en-US",
            { weekday: "long", month: "long", day: "numeric" }
          );

          if (clientUser?.email) {
            await sendEmail({
              to: clientUser.email,
              subject: "Your Caregiver Has Left — Nivaran",
              html: `
          <div style="font-family:sans-serif;
                      max-width:520px;margin:auto;
                      padding:24px;
                      border:1px solid #e5e7eb;
                      border-radius:12px;">
            <h2 style="color:#2E4E3F;">
              Caregiver Has Left
            </h2>
            <p>Hi <strong>${clientUser.fullName}</strong>,
            </p>
            <p>Your caregiver has left the care
               location.</p>
            <table style="width:100%;
                          border-collapse:collapse;
                          margin:16px 0;">
              <tr>
                <td style="padding:8px 0;color:#6b7280;">
                  Left At
                </td>
                <td style="padding:8px 0;font-weight:600;">
                  ${leftTime}
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#6b7280;">
                  Date
                </td>
                <td style="padding:8px 0;font-weight:600;">
                  ${leftDate}
                </td>
              </tr>
            </table>
            <p style="color:#6b7280;font-size:13px;">
              Thank you for using Nivaran.
            </p>
            <p style="color:#2E4E3F;font-weight:600;
                      margin-top:24px;">
              — Nivaran Team
            </p>
          </div>
        `,
            });
          }
        } catch (emailErr) {
          console.error(
            "Departure email failed:", emailErr.message
          );
        }
      }

      io.to(bookingId).emit("tracking-update", {
        status: newStatus,
        distance: booking.tracking.distance,
        enteredAt: booking.tracking.enteredAt,
        leftAt: booking.tracking.leftAt,
        caregiverLocation: booking.tracking.caregiverLocation,
        parentLocation: booking.tracking.parentLocation,
      });
    });
  });
};
