import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendEmail({ to, subject, html }) {
    const mailOptions = {
        from: process.env.SMTP_FROM || `"Ma7l" <mohammed.ayman152433@gmail.com>`,
        to,
        subject,
        html,
    };

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS || process.env.SMTP_USER.includes("your-email")) {
        console.error("SMTP credentials are not configured in .env.local!");
        throw new Error("لم يتم إعداد بيانات خادم البريد الإلكتروني (SMTP). يرجى التحقق من ملف .env.local وإعادة تشغيل السيرفر.");
    }

    return transporter.sendMail(mailOptions);
}
