export interface BookingEmailPayload {
  serviceName: string;
  slotTime: string;
  date: string;
  price: number;
  bookingCode: string;
  customerName: string;
  salonName: string;
  email: string;
}

export const buildBookingConfirmedEmail = (payload: BookingEmailPayload) => {
  const {
    serviceName,
    slotTime,
    date,
    price,
    bookingCode,
    customerName,
    salonName,
  } = payload;

  return {
    subject: "Booking Confirmed",
    text: `Your booking for ${serviceName} at ${salonName} is confirmed for ${date} at ${slotTime}. Your booking code is ${bookingCode}.`,
    html: `
    <div style="font-family: sans-serif; color: #333;">
      <h1 style="color: #667eea;">Booking Confirmed!</h1>
      <p>Your booking for <strong>${serviceName}</strong> at <strong>${salonName}</strong> has been successfully confirmed.</p>
      
      <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #667eea; background-color: #f8f9fa;">
        <p><strong>Booking Code:</strong> ${bookingCode}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${slotTime}</p>
        <p><strong>Service:</strong> ${serviceName}</p>
        <p><strong>Salon:</strong> ${salonName}</p>
        <p><strong>Customer:</strong> ${customerName}</p>
        <p><strong>Total Price:</strong> ₹${price}</p>
      </div>
      
      <p>We look forward to seeing you!</p>
      <p>Best regards,<br/>${salonName}</p>
    </div>
  `,
  };
};

export const buildBookingCompletedEmail = (payload: BookingEmailPayload) => {
  const {
    serviceName,
    slotTime,
    date,
    price,
    bookingCode,
    customerName,
    salonName,
  } = payload;

  return {
    subject: "Booking Completed",
    text: `Your booking for ${serviceName} at ${salonName} is completed for ${date} at ${slotTime}. Your booking code is ${bookingCode}.`,
    html: `
    <div style="font-family: sans-serif; color: #333;">
      <h1 style="color: #667eea;">Booking Completed!</h1>
      <p>Your booking for <strong>${serviceName}</strong> at <strong>${salonName}</strong> has been successfully completed.</p>
      
      <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #667eea; background-color: #f8f9fa;">
        <p><strong>Booking Code:</strong> ${bookingCode}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${slotTime}</p>
        <p><strong>Service:</strong> ${serviceName}</p>
        <p><strong>Salon:</strong> ${salonName}</p>
        <p><strong>Customer:</strong> ${customerName}</p>
        <p><strong>Total Price:</strong> ₹${price}</p>
      </div>
      
      <p>Thank you for choosing our salon!</p>
      <p>Best regards,<br/>${salonName}</p>
    </div>
  `,
  };
};

export const buildBookingCancelledEmail = (payload: BookingEmailPayload) => {
  const {
    serviceName,
    slotTime,
    date,
    price,
    bookingCode,
    customerName,
    salonName,
  } = payload;

  return {
    subject: "Booking Cancelled",
    text: `Your booking for ${serviceName} at ${salonName} is cancelled for ${date} at ${slotTime}. Your booking code is ${bookingCode}.`,
    html: `
    <div style="font-family: sans-serif; color: #333;">
      <h1 style="color: #667eea;">Booking Cancelled!</h1>
      <p>Your booking for <strong>${serviceName}</strong> at <strong>${salonName}</strong> has been successfully cancelled.</p>
      
      <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #667eea; background-color: #f8f9fa;">
        <p><strong>Booking Code:</strong> ${bookingCode}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${slotTime}</p>
        <p><strong>Service:</strong> ${serviceName}</p>
        <p><strong>Salon:</strong> ${salonName}</p>
        <p><strong>Customer:</strong> ${customerName}</p>
        <p><strong>Total Price:</strong> ₹${price}</p>
      </div>
      
      <p>We are sorry for the inconvenience caused.</p>
      <p>Best regards,<br/>${salonName}</p>
    </div>
  `,
  };
};
