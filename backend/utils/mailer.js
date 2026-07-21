import nodemailer from "nodemailer";


const transporter=nodemailer.createTransport({
    host:"smtp.gmail.com",
    port:587,
    secure:false,
    auth:{
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    }
});

export const sendMail=async({ to, subject, text, html })=>{
try {
    await transporter.sendMail({
        from :`"PINTRIP" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html
    });
        console.log("Email sent successfully");
} catch (error) {
    console.error("Email failed:", error.message);
    throw new Error("Failed to send email");
}
};