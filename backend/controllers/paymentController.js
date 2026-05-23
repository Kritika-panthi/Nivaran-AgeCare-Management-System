import axios from "axios";
import Booking from "../models/booking.js";
import User from "../models/user.js";
import sendEmail from "../utils/sendEmail.js";

// Called when client clicks "Pay Now"
// Calls Khalti API and returns redirect URL

export const initiatePayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        message: "Booking ID is required",
      });
    }

    // Find booking and verify it belongs to client
    const booking = await Booking.findOne({
      _id: bookingId,
      client: req.user._id,
    }).populate("client", "fullName email");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    // Only confirmed bookings can be paid
    if (booking.status !== "confirmed") {
      return res.status(400).json({
        message: "Only confirmed bookings can be paid",
      });
    }

    // Prevent double payment
    if (booking.paymentStatus === "paid") {
      return res.status(400).json({
        message: "This booking is already paid",
      });
    }

    // Khalti amount is in PAISA (multiply by 100)
    const amountInPaisa = booking.totalAmount * 100;

    // Call Khalti initiate API
    const khaltiResponse = await axios.post(
      process.env.KHALTI_INITIATE_URL,
      {
        return_url: process.env.KHALTI_RETURN_URL,
        website_url: process.env.KHALTI_WEBSITE_URL,
        amount: amountInPaisa,
        purchase_order_id: booking._id.toString(),
        purchase_order_name: `Nivaran Booking - ${booking._id}`,
        customer_info: {
          name: booking.client?.fullName || "Customer",
          email: booking.client?.email || "",
        },
      },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { pidx, payment_url } = khaltiResponse.data;

    // Save pidx to booking for verification later
    booking.transactionId = pidx;
    await booking.save();

    // Return payment_url to frontend
    res.json({
      payment_url,
      pidx,
    });
  } catch (error) {
    console.error(
      "Khalti initiate error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      message:
        error.response?.data?.detail ||
        error.message ||
        "Payment initiation failed",
    });
  }
};

// VERIFY PAYMENT 
// Called after Khalti redirects to return_url
// Khalti sends ?pidx=xxx in query params

export const verifyPayment = async (req, res) => {
  try {
    const { pidx } = req.query;

    if (!pidx) {
      return res.status(400).json({
        message: "pidx is required for verification",
      });
    }

    // Lookup payment status from Khalti
    const lookupResponse = await axios.post(
      process.env.KHALTI_LOOKUP_URL,
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const {
      status,
      transaction_id,
      total_amount,
      purchase_order_id,
    } = lookupResponse.data;

    // Only accept Completed status
    if (status !== "Completed") {
      return res.status(400).json({
        message: `Payment status is ${status}, not Completed`,
      });
    }

    // Find booking by pidx (stored as transactionId)
    const booking = await Booking.findOne({
      transactionId: pidx,
    });

    if (!booking) {
      // Also try by purchase_order_id as fallback
      const bookingByOrderId = await Booking.findById(
        purchase_order_id
      );
      if (!bookingByOrderId) {
        return res.status(404).json({
          message: "Booking not found for this payment",
        });
      }

      // Update payment status
      bookingByOrderId.paymentStatus = "paid";
      bookingByOrderId.transactionCode = transaction_id;
      bookingByOrderId.transactionId = pidx;
      bookingByOrderId.paidAt = new Date();
      await bookingByOrderId.save();

      // Send email
      await sendPaymentEmail(
        bookingByOrderId,
        transaction_id
      );

      return res.json({
        message: "Payment verified successfully",
        bookingId: bookingByOrderId._id,
        transactionId: transaction_id,
      });
    }

    // Update payment status
    booking.paymentStatus = "paid";
    booking.transactionCode = transaction_id;
    booking.paidAt = new Date();
    await booking.save();

    // Send confirmation email to client
    await sendPaymentEmail(booking, transaction_id);

    res.json({
      message: "Payment verified successfully",
      bookingId: booking._id,
      transactionId: transaction_id,
    });
  } catch (error) {
    console.error(
      "Khalti verify error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      message:
        error.response?.data?.detail ||
        error.message ||
        "Payment verification failed",
    });
  }
};

// HANDLE PAYMENT FAILURE
// Called when user cancels or payment fails

export const handlePaymentFailure = async (req, res) => {
  try {
    const { pidx } = req.query;

    if (pidx) {
      await Booking.findOneAndUpdate(
        { transactionId: pidx },
        { paymentStatus: "failed" }
      );
    }

    res.json({ message: "Payment failure recorded" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper: send payment confirmation email

const sendPaymentEmail = async (
  booking,
  transactionId
) => {
  try {
    const clientUser = await User.findById(
      booking.client
    ).select("email fullName");

    if (!clientUser?.email) return;

    await sendEmail({
      to: clientUser.email,
      subject: "Payment Successful — Nivaran",
      html: `
        <div style="font-family:sans-serif;
                    max-width:520px;margin:auto;
                    padding:24px;
                    border:1px solid #e5e7eb;
                    border-radius:12px;">
          <h2 style="color:#2E4E3F;">
            Payment Successful ✓
          </h2>
          <p>Hi <strong>
            ${clientUser.fullName}
          </strong>,</p>
          <p>Your payment has been received
             successfully via <strong>Khalti</strong>.
          </p>
          <table style="width:100%;
                        border-collapse:collapse;
                        margin:16px 0;">
            <tr>
              <td style="padding:8px 0;color:#6b7280;">
                Amount Paid
              </td>
              <td style="padding:8px 0;font-weight:600;">
                Rs. ${booking.totalAmount}
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;">
                Transaction ID
              </td>
              <td style="padding:8px 0;
                         font-weight:600;
                         font-size:12px;">
                ${transactionId}
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;">
                Paid At
              </td>
              <td style="padding:8px 0;font-weight:600;">
                ${new Date().toLocaleString("en-US")}
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
  } catch (err) {
    console.error("Payment email failed:", err.message);
  }
};
