"""
InterviewIQ Enterprise SMTP Email Service
Handles:
- Genuine OTP email dispatch via Gmail SMTP (STARTTLS on port 587)
- Branded responsive HTML & plain-text multipart templates
- Strict credential sanitization (zero exposure of secrets or OTPs in logs)
- Transparent failure handling (raises explicit delivery errors on network/auth failures)
"""

import os
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional


class SMTPDeliveryError(Exception):
    """Raised when email delivery via SMTP fails."""
    pass


class SMTPConfigurationError(SMTPDeliveryError):
    """Raised when SMTP credentials have not been configured."""
    pass


def get_smtp_config():
    """Reads SMTP configuration from environment variables."""
    host = os.getenv("SMTP_HOST", "smtp.gmail.com").strip()
    port = int(os.getenv("SMTP_PORT", "587"))
    username = os.getenv("SMTP_USERNAME", "").strip()
    password = os.getenv("SMTP_PASSWORD", "").strip()
    from_addr = os.getenv("SMTP_FROM", "").strip() or username or "InterviewIQ <no-reply@interviewiq.io>"
    
    return {
        "host": host,
        "port": port,
        "username": username,
        "password": password,
        "from_addr": from_addr
    }


def is_smtp_configured() -> bool:
    """Returns True only if valid SMTP credentials are fully configured."""
    cfg = get_smtp_config()
    # Placeholder or empty check
    if not cfg["username"] or not cfg["password"]:
        return False
    if "your-email" in cfg["username"].lower() or "your-app-password" in cfg["password"].lower():
        return False
    return True


def render_otp_email_html(otp: str, user_name: Optional[str] = None) -> str:
    """Renders a sleek, high-trust InterviewIQ branded HTML verification email."""
    display_name = user_name.strip() if user_name else "Candidate"
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>InterviewIQ Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b1120; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0284c7 0%, #06b6d4 100%); padding: 32px 36px; text-align: left;">
              <div style="font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                Interview<span style="color: #38bdf8;">IQ</span>
              </div>
              <div style="font-size: 13px; font-weight: 600; color: #e0f2fe; margin-top: 4px; letter-spacing: 0.2px;">
                Practice like it's real. Improve with evidence.
              </div>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <div style="font-size: 18px; font-weight: 700; color: #f8fafc; margin-bottom: 12px;">
                Confirm Your Email Address
              </div>
              <div style="font-size: 14px; line-height: 1.6; color: #94a3b8; margin-bottom: 24px;">
                Hello {display_name},<br><br>
                Thank you for creating an account with <strong>InterviewIQ</strong>. Please use the verification code below to confirm your email and activate your account.
              </div>

              <!-- OTP Display Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center" style="background-color: #1e293b; border: 2px dashed #0284c7; border-radius: 12px; padding: 22px 16px;">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #38bdf8; letter-spacing: 1.5px; margin-bottom: 6px;">
                      Single-Use Verification Code
                    </div>
                    <div style="font-family: 'SF Mono', Monaco, 'Courier New', monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #ffffff;">
                      {otp}
                    </div>
                    <div style="font-size: 12px; color: #94a3b8; margin-top: 8px;">
                      ⏱ Valid for <strong>10 minutes</strong>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Security Advisory -->
              <div style="background-color: rgba(14, 165, 233, 0.08); border-left: 3px solid #0284c7; border-radius: 4px; padding: 12px 14px; margin-bottom: 24px;">
                <div style="font-size: 12px; line-height: 1.5; color: #cbd5e1;">
                  🔒 <strong>Security Notice:</strong> InterviewIQ staff will never ask for this code. If you did not initiate this registration, please disregard this email.
                </div>
              </div>

              <div style="font-size: 13px; color: #64748b; line-height: 1.5;">
                Best regards,<br>
                <strong style="color: #94a3b8;">The InterviewIQ Security Team</strong>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top: 1px solid #1e293b; padding: 20px 36px; background-color: #0b1120; text-align: center;">
              <div style="font-size: 11px; color: #64748b; line-height: 1.4;">
                This is an automated security dispatch. Please do not reply directly to this email.<br>
                © 2026 InterviewIQ Platform. All rights reserved.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def send_otp_email(recipient_email: str, otp: str, user_name: Optional[str] = None) -> bool:
    """
    Sends genuine 6-digit OTP to the user's email via Gmail SMTP with STARTTLS.
    
    Raises:
        SMTPConfigurationError: If SMTP credentials are missing or unconfigured.
        SMTPDeliveryError: If connection, authentication, or dispatch fails.
    """
    cfg = get_smtp_config()

    if not is_smtp_configured():
        print(f"[SECURITY ALERT] Email dispatch requested for {recipient_email}, but SMTP is not configured in backend/.env.")
        raise SMTPConfigurationError(
            "SMTP email service is not configured. Please configure SMTP_USERNAME and SMTP_PASSWORD in backend/.env."
        )

    # Construct RFC-compliant multipart email (Plain text + HTML)
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Your InterviewIQ Verification Code"
    msg["From"] = cfg["from_addr"]
    msg["To"] = recipient_email

    # Plain-text fallback for non-HTML email clients
    plain_text = (
        f"Hello {user_name or 'Candidate'},\n\n"
        f"Your InterviewIQ verification code is: {otp}\n\n"
        f"This code will expire in 10 minutes.\n"
        f"If you did not request this code, please disregard this message.\n\n"
        f"— The InterviewIQ Team"
    )
    msg.attach(MIMEText(plain_text, "plain", "utf-8"))

    # HTML rich content
    html_content = render_otp_email_html(otp, user_name)
    msg.attach(MIMEText(html_content, "html", "utf-8"))

    # Establish secure STARTTLS connection with Gmail SMTP
    try:
        context = ssl.create_default_context()
        with smtplib.SMTP(cfg["host"], cfg["port"], timeout=15) as server:
            server.ehlo()
            server.starttls(context=context)
            server.ehlo()
            server.login(cfg["username"], cfg["password"])
            server.send_message(msg)
            
        print(f"[SECURITY NOTIFICATION] Verification OTP successfully dispatched to {recipient_email} via {cfg['host']}:{cfg['port']}")
        return True

    except smtplib.SMTPAuthenticationError as auth_err:
        print(f"[SECURITY ALERT] SMTP Authentication failed for user '{cfg['username']}': {auth_err}")
        raise SMTPDeliveryError(
            "Gmail SMTP authentication failed. Please ensure a dedicated 16-character Google App Password is used."
        ) from auth_err

    except smtplib.SMTPConnectError as conn_err:
        print(f"[SECURITY ALERT] SMTP Connection to {cfg['host']}:{cfg['port']} failed: {conn_err}")
        raise SMTPDeliveryError(
            f"Failed to connect to SMTP server {cfg['host']}:{cfg['port']}."
        ) from conn_err

    except Exception as exc:
        print(f"[SECURITY ALERT] SMTP delivery error to {recipient_email}: {exc.__class__.__name__}: {exc}")
        raise SMTPDeliveryError(f"Email delivery failed: {str(exc)}") from exc

