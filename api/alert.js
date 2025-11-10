import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (req.headers["x-alert-token"] !== process.env.ALERT_API_KEY) {
    return res.status(401).json({ error: "Unauthorized request" });
  }

  const { to_email, severity, risk_score, message, location, risk_factors } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

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
          Automated message from <b>SlideSense</b>.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: to_email,
      subject,
      html,
    });

    return res.status(200).json({ success: true, sentTo: to_email });
  } catch (err) {
    console.error("Mail error:", err);
    return res.status(500).json({ error: "Mail send failed", detail: err.message });
  }
}
