import nodemailer from "nodemailer"
export const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "interntracksystem@gmail.com",
      pass: "ixqy gxwb jdpr ewfo",
    },
});
  

export const sendVerificationEmail = async (email:string, token:string, role:any) => {
  const link = `https://funeral-service-server-2.onrender.com/api/auth/verify-email?token=${token}&role=${role}`;
  // const link = `https://funeral-service-server-1.onrender.com/api/auth/verify-email?token=${token}&role=${role}`;
  // const link = `http://localhost:5000/api/auth/verify-email?token=${token}&role=${role}`;
  
  await transporter.sendMail({
    from: "reynaldobocaling@gmail.com",
        to: email,
    subject: "IternTrack!",
    html: `
      <h3>Welcome!</h3>
      <p>Please verify your email by clicking the button below:</p>
      <a href="${link}" style="padding: 10px 20px; background: blue; color: white; text-decoration: none;">Verify Email</a>
      <p>If you didn't register, you can ignore this email.</p>
    `
  });
};
