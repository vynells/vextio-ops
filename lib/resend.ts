import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export function statusEmailContent(status: "cancelled" | "returned", orderNumber: string, firstName: string) {
  if (status === "cancelled") {
    return {
      subject: `Your Vextio order ${orderNumber} has been cancelled`,
      heading: `Your order has been cancelled`,
      body: `Hi ${firstName}, your order <strong>#${orderNumber}</strong> has been cancelled. If you weren't expecting this or have any questions, reply to this email or call us at 03340927688.`,
    };
  }
  return {
    subject: `Your Vextio order ${orderNumber} has been marked as returned`,
    heading: `Your order has been returned`,
    body: `Hi ${firstName}, your order <strong>#${orderNumber}</strong> has been marked as returned. If you have any questions about this, reply to this email or call us at 03340927688.`,
  };
}

export function buildStatusEmailHtml(heading: string, body: string) {
  return `
    <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #2A2420;">
      <div style="padding: 32px 24px;">
        <p style="font-size:20px;font-weight:700;letter-spacing:0.05em;margin:0 0 24px;">VEXTIO</p>
        <p style="font-size:18px;font-weight:600;margin:0 0 12px;">${heading}</p>
        <p style="font-size:14px;color:#2A2420;line-height:1.6;margin:0;">${body}</p>
      </div>
    </div>
  `;
}
