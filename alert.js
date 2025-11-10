import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (req.headers["x-alert-token"] !== process.env.ALERT_API_KEY)
    return res.status(401).json({ error: "Unauthorized" });

  const { to_email, severity, risk_score, message, location } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
    });

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: to_email,
      subject: `SlideSense ${severity} Alert - Risk Score ${risk_score}`,
      html: `
        <h2>⚠️ SlideSense ${severity} Alert</h2>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Risk Score:</strong> ${risk_score}</p>
        <p>${message}</p>
        <p>Stay safe,<br><b>SlideSense Monitoring System</b></p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send email" });
  }
}
