import User from "../models/user.js";
import Client from "../models/client.js";
import Caregiver from "../models/caregiver.js";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import { generateToken } from "../utils/generateToken.js";
import createNotification from "../utils/createNotification.js";
import sendEmail from "../utils/sendEmail.js";

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

export const registerClient = async (req, res) => {
  try {
    const {
        fullName,
        email,
        password,
        phone,
        occupation,
        dob,
        gender,
        currentLocation,
        permanentAddress,
      } = req.body;

    // Validate required fields FIRST
    if (
      !fullName ||
      !email ||
      !password ||
      !phone ||
      !occupation ||
      !dob ||
      !gender ||
      !currentLocation ||
      !permanentAddress
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // CheckExistingUser
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // HashPassword
    const hashedPassword = await bcrypt.hash(password, 10);

    // CreateUser
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: "client",
    });

    // CreateClientProfile
    await Client.create({
      user: user._id,
      phone,
      occupation,
      dob,
      gender,
      currentLocation,
      permanentAddress,
      profilePhoto: req.file ? req.file.path : null,
    });

    res.status(201).json({ message: "Client registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const registerCaregiver = async (req, res) => {
  try {
    const { fullName, email, password, ...caregiverData } = req.body;

    const profilePhoto = req.files?.profilePhoto?.[0]?.filename;
    const idProof = req.files?.idProof?.[0]?.filename;

    if (!profilePhoto || !idProof) {
      return res.status(400).json({
        message: "Profile photo and ID proof are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: "caregiver",
    });

    const caregiver = await Caregiver.create({
      user: user._id,
      ...caregiverData,
      profilePhoto: profilePhoto,
      idProof: idProof,
      approvalStatus: "pending",
    });

    // Notify all admins
    const admins = await User.find({ role: "admin", isActive: true }).select("_id");

    for (const admin of admins) {
      await createNotification({
        recipient: admin._id,
        sender: user._id,
        type: "caregiver_registration_submitted",
        title: "New Caregiver Registration",
        message: `${fullName} has submitted a caregiver registration for approval.`,
        meta: {
          caregiverId: caregiver._id,
          userId: user._id,
        },
      });
    }

    // Notify admin by email when caregiver registers
    try {
      const adminUsers = await User.find({ role: "admin" })
        .select("email fullName");

      for (const admin of adminUsers) {
        if (admin.email) {
          await sendEmail({
            to: admin.email,
            subject: "New Caregiver Registration — Nivaran",
            html: `
            <div style="font-family:sans-serif;
                        max-width:520px;margin:auto;
                        padding:24px;
                        border:1px solid #e5e7eb;
                        border-radius:12px;">
              <h2 style="color:#2E4E3F;">
                New Caregiver Registration
              </h2>
              <p>Hi <strong>${admin.fullName}</strong>,
              </p>
              <p>A new caregiver has registered on
                 <strong>Nivaran</strong> and is
                 awaiting your approval.</p>
              <table style="width:100%;
                            border-collapse:collapse;
                            margin:16px 0;">
                <tr>
                  <td style="padding:8px 0;
                             color:#6b7280;">
                    Name
                  </td>
                  <td style="padding:8px 0;
                             font-weight:600;">
                    ${user.fullName}
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;
                             color:#6b7280;">
                    Email
                  </td>
                  <td style="padding:8px 0;
                             font-weight:600;">
                    ${user.email}
                  </td>
                </tr>
              </table>
              <p style="color:#6b7280;font-size:13px;">
                Please log in to the admin dashboard
                to review and approve or reject this
                registration.
              </p>
              <p style="color:#2E4E3F;font-weight:600;
                        margin-top:24px;">
                — Nivaran System
              </p>
            </div>
          `,
          });
        }
      }
    } catch (emailErr) {
      console.error(
        "Admin notification email failed:",
        emailErr.message
      );
    }

    res.status(201).json({
      message: "Caregiver registered. Waiting for admin approval",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // FindUser
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ComparePassword
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // CheckCaregiverApproval
    if (user.role === "caregiver") {
    const caregiver = await Caregiver.findOne({ user: user._id });

    if (!caregiver) {
      return res.status(403).json({ message: "Caregiver profile not found" });
    }

    if (caregiver.approvalStatus === "pending") {
      return res.status(403).json({ message: "Awaiting admin approval" });
    }

    if (caregiver.approvalStatus === "rejected") {
      return res.status(403).json({ message: "Your application was rejected" });
    }
  }

    const rememberMe = req.body.rememberMe === true;
    res.json({
      token: generateToken(user, rememberMe),
      role: user.role,
      fullName: user.fullName,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required"
      });
    }

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name: fullName } =
      payload;

    // Check if user already exists
    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    });

    if (user) {
      // Link googleId if user registered normally before
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }

      // Check if client profile exists
      const clientProfile = await Client.findOne({
        user: user._id,
      });
      const profileComplete = !!clientProfile;

      if (profileComplete && !user.isProfileComplete) {
        await User.findByIdAndUpdate(user._id, {
          isProfileComplete: true,
        });
      }

      return res.json({
        token: generateToken(user),
        role: user.role,
        fullName: user.fullName,
        profileComplete,
      });
    }

    // New user — create client account
    user = await User.create({
      fullName,
      email,
      googleId,
      role: "client",
      password: null,
      isActive: true,
      isProfileComplete: false,
    });

    return res.json({
      token: generateToken(user),
      role: user.role,
      fullName: user.fullName,
      profileComplete: false,
    });
  } catch (error) {
    console.error("Google login error:", error.message);
    res.status(401).json({
      message: "Google authentication failed"
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Always return same message — don't reveal
    // if email exists
    if (!user) {
      return res.json({
        message:
          "If that email exists, a reset link has been sent."
      });
    }

    // Generate secure reset token
    const resetToken = crypto
      .randomBytes(32)
      .toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetToken = hashedToken;
    // Expires in 30 minutes
    user.passwordResetExpires = new Date(
      Date.now() + 30 * 60 * 1000
    );
    await user.save();

    const resetUrl =
      `${process.env.FRONTEND_URL}` +
      `/reset-password?token=${resetToken}` +
      `&email=${encodeURIComponent(email)}`;

    await sendEmail({
      to: email,
      subject: "Password Reset Request — Nivaran",
      html: `
          <div style="font-family:sans-serif;
                      max-width:520px;margin:auto;
                      padding:24px;
                      border:1px solid #e5e7eb;
                      border-radius:12px;">
            <h2 style="color:#2E4E3F;">
              Reset Your Password
            </h2>
            <p>Hi <strong>${user.fullName}</strong>,
            </p>
            <p>You requested a password reset for
               your Nivaran account.</p>
            <p>Click the button below to reset your
               password. This link expires in
               <strong>30 minutes</strong>.</p>
            <a href="${resetUrl}"
               style="display:inline-block;
                      margin:20px 0;
                      padding:12px 28px;
                      background-color:#2E4E3F;
                      color:white;
                      border-radius:8px;
                      text-decoration:none;
                      font-weight:600;">
              Reset Password
            </a>
            <p style="color:#6b7280;font-size:13px;">
              If you did not request this, you can
              safely ignore this email.
            </p>
            <p style="color:#2E4E3F;font-weight:600;
                      margin-top:24px;">
              — Nivaran Team
            </p>
          </div>
        `,
    });

    res.json({
      message:
        "If that email exists, a reset link has been sent."
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, email, password } = req.body;

    if (!token || !email || !password) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      email,
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token"
      });
    }

    const hashedPassword = await bcrypt.hash(
      password, 10
    );
    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.json({
      message: "Password reset successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendContactMessage = async (req, res) => {
  try {
    const { fullName, email, subject, message } = req.body;

    if (!fullName || !email || !subject || !message) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // Find all admin users
    const adminUsers = await User.find({ role: "admin" })
      .select("email fullName");

    for (const admin of adminUsers) {
      if (admin.email) {
        await sendEmail({
          to: admin.email,
          subject: `New Contact Message: ${subject} — Nivaran`,
          html: `
              <div style="font-family:sans-serif;
                          max-width:520px;margin:auto;
                          padding:24px;
                          border:1px solid #e5e7eb;
                          border-radius:12px;">
                <h2 style="color:#2E4E3F;">
                  New Contact Message
                </h2>
                <p>Someone has sent a message via the
                   Nivaran contact form.</p>
                <table style="width:100%;
                              border-collapse:collapse;
                              margin:16px 0;">
                  <tr>
                    <td style="padding:8px 0;
                               color:#6b7280;
                               width:120px;">
                      Name
                    </td>
                    <td style="padding:8px 0;
                               font-weight:600;">
                      ${fullName}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;
                               color:#6b7280;">
                      Email
                    </td>
                    <td style="padding:8px 0;
                               font-weight:600;">
                      ${email}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;
                               color:#6b7280;">
                      Subject
                    </td>
                    <td style="padding:8px 0;
                               font-weight:600;">
                      ${subject}
                    </td>
                  </tr>
                </table>
                <div style="background:#f9fafb;
                            border-radius:8px;
                            padding:16px;
                            margin-top:8px;">
                  <p style="color:#6b7280;
                             font-size:13px;
                             margin:0 0 8px 0;">
                    Message
                  </p>
                  <p style="color:#111827;
                             margin:0;
                             white-space:pre-wrap;">
                    ${message}
                  </p>
                </div>
                <p style="color:#6b7280;
                           font-size:12px;
                           margin-top:20px;">
                  Reply directly to this email to
                  respond to the sender at ${email}
                </p>
                <p style="color:#2E4E3F;
                           font-weight:600;
                           margin-top:24px;">
                  — Nivaran System
                </p>
              </div>
            `,
        });
      }
    }

    // Also send confirmation email to the sender
    await sendEmail({
      to: email,
      subject: "We received your message — Nivaran",
      html: `
          <div style="font-family:sans-serif;
                      max-width:520px;margin:auto;
                      padding:24px;
                      border:1px solid #e5e7eb;
                      border-radius:12px;">
            <h2 style="color:#2E4E3F;">
              Message Received ✓
            </h2>
            <p>Hi <strong>${fullName}</strong>,</p>
            <p>Thank you for reaching out to Nivaran.
               We have received your message and will
               get back to you as soon as possible.
            </p>
            <div style="background:#f9fafb;
                        border-radius:8px;
                        padding:16px;
                        margin:16px 0;">
              <p style="color:#6b7280;
                         font-size:13px;
                         margin:0 0 6px 0;">
                Your message
              </p>
              <p style="color:#111827;
                         margin:0;
                         white-space:pre-wrap;">
                ${message}
              </p>
            </div>
            <p style="color:#6b7280;font-size:13px;">
              Our team typically responds within
              24–48 hours.
            </p>
            <p style="color:#2E4E3F;font-weight:600;
                      margin-top:24px;">
              — Nivaran Team
            </p>
          </div>
        `,
    });

    res.json({
      message: "Message sent successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
