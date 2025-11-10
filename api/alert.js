import nodemailer from "nodemailer";

export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Secure API with secret key
  if (req.headers["x-alert-token"] !== process.env.ALERT_API_KEY) {
    return res.status(401).json({ error: "Unauthorized request" });
  }

  const { to_email, severity, risk_score, message, location, risk_factors } = req.body;

  if (!to_email) {
    return res.status(400).json({ error: "Missing 'to_email' field" });
  }

  try {
    // Configure SMTP transport (Gmail recommended)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email details
    const subject = `SlideSense ${severity} Alert — Risk Score: ${risk_score}`;
    const html = `
      <div style="font-family:Arial,sans-serif;padding:16px;">
        <h2>⚠️ SlideSense ${severity} Alert</h2>
        <p><strong>Risk Score:</strong> ${risk_score}</p>
        <p><strong>Location:</strong> ${location || "Unknown"}</p>
        <p><strong>Risk Factors:</strong> ${risk_factors || "N/A"}</p>
        <p>${message}</p>
        <hr />
        <p style="font-size:13px;color:#666;">
          This is an automated message from <b>SlideSense Landslide Monitoring System</b>.
        </p>
      </div>
    `;

    // Send mail
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: to_email,
      subject,
      html,
    });

    return res.status(200).json({ success: true, sentTo: to_email });

  } catch (error) {
    console.error("❌ Error sending alert:", error);
    return res.status(500).json({ error: "Failed to send alert email" });
  }
}

