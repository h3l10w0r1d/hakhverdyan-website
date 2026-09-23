import logging
import os
import smtplib
import ssl
import time
from email.message import EmailMessage
from email.utils import formatdate, make_msgid
from typing import Optional

from sqlalchemy.orm import Session

from .models import EmailLog

logger = logging.getLogger("email")

# Quote confirmations aren't sent for real — "sending" one means rendering it
# and storing it in EmailLog, which the API hands back to the client so the UI
# can show exactly what would have landed in the customer's inbox.
#
# Account emails (verification) DO go out for real, over the hakhverdyan.am
# mailbox's own SMTP — see send_email_real below.

SMTP_HOST = os.environ.get("SMTP_HOST", "mail.hakhverdyan.am")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "465"))
SMTP_USER = os.environ.get("SMTP_USER", "noreply@hakhverdyan.am")
# Vercel env var is named "Email_API" (holds the noreply mailbox's password,
# not a third-party API key — SMTP_PASSWORD works too for local/other setups).
SMTP_PASSWORD = os.environ.get("Email_API") or os.environ.get("SMTP_PASSWORD")
MAIL_FROM = os.environ.get("MAIL_FROM", "Hakhverdyan <noreply@hakhverdyan.am>")
MAIL_REPLY_TO = os.environ.get("MAIL_REPLY_TO", "info@hakhverdyan.am")


def send_email_real(to_email: str, subject: str, text_body: str, html_body: Optional[str] = None) -> None:
    """Sends one real email over SMTP_SSL. Raises smtplib.SMTPException/OSError
    on failure — callers running this in a background task should catch and
    retry (see send_email_real_with_retry) rather than let it propagate."""
    if not SMTP_PASSWORD:
        raise RuntimeError("No SMTP password configured (Email_API/SMTP_PASSWORD env var is unset)")

    msg = EmailMessage()
    msg["From"] = MAIL_FROM
    msg["To"] = to_email
    msg["Reply-To"] = MAIL_REPLY_TO
    msg["Subject"] = subject
    msg["Date"] = formatdate(localtime=True)
    msg["Message-ID"] = make_msgid(domain="hakhverdyan.am")
    msg.set_content(text_body)
    if html_body:
        msg.add_alternative(html_body, subtype="html")

    ctx = ssl.create_default_context()
    with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, context=ctx, timeout=20) as s:
        s.login(SMTP_USER, SMTP_PASSWORD)
        s.send_message(msg)


def send_email_real_with_retry(
    to_email: str, subject: str, text_body: str, html_body: Optional[str] = None, attempts: int = 3,
) -> None:
    """For use as a FastAPI BackgroundTasks callback — swallows the final
    failure (there's no request left to report it to) but logs it."""
    if not SMTP_PASSWORD:
        logger.error("Skipped sending email to %s: no SMTP password configured", to_email)
        return
    last_error: Optional[Exception] = None
    for attempt in range(attempts):
        try:
            send_email_real(to_email, subject, text_body, html_body)
            return
        except (smtplib.SMTPException, OSError, TimeoutError) as exc:
            last_error = exc
            if attempt < attempts - 1:
                time.sleep(2 ** attempt)
    logger.error("Failed to send email to %s after %d attempts: %s", to_email, attempts, last_error)


VERIFICATION_TEMPLATES = {
    "en": {
        "subject": "Confirm your email",
        "heading": "Confirm your email address",
        "greeting": "Hi {name},",
        "intro": (
            "Thanks for creating an account with Hakhverdyan Shinmontazh. Click the button "
            "below to confirm your email and finish setting up your account."
        ),
        "button": "Confirm email address",
        "expiry": "This link works for 24 hours. If you didn't create this account, you can safely ignore this email.",
        "fallback": "Or copy and paste this link into your browser:",
        "signoff": "— Hakhverdyan Shinmontazh",
        "body": (
            "Hi {name},\n\n"
            "Thanks for creating an account with Hakhverdyan Shinmontazh. Please confirm your "
            "email address by opening this link:\n{link}\n\n"
            "The link works for 24 hours. If you didn't create this account, you can ignore this email.\n\n"
            "— Hakhverdyan Shinmontazh"
        ),
    },
    "hy": {
        "subject": "Հաստատեք ձեր էլ. հասցեն",
        "heading": "Հաստատեք ձեր էլ. հասցեն",
        "greeting": "Բարև, {name},",
        "intro": (
            "Շնորհակալություն Հախվերդյան Շինմոնտաժում հաշիվ ստեղծելու համար։ Սեղմեք ստորև "
            "գտնվող կոճակը՝ ձեր էլ. հասցեն հաստատելու և հաշվի ստեղծումն ավարտելու համար։"
        ),
        "button": "Հաստատել էլ. հասցեն",
        "expiry": "Հղումն ուժի մեջ է 24 ժամ։ Եթե դուք չեք ստեղծել այս հաշիվը, կարող եք անտեսել այս նամակը։",
        "fallback": "Կամ պատճենեք և տեղադրեք այս հղումը ձեր բրաուզերում.",
        "signoff": "— Հախվերդյան Շինմոնտաժ",
        "body": (
            "Բարև, {name},\n\n"
            "Շնորհակալություն Հախվերդյան Շինմոնտաժում հաշիվ ստեղծելու համար։ Խնդրում ենք "
            "հաստատել ձեր էլ. հասցեն՝ բացելով այս հղումը.\n{link}\n\n"
            "Հղումն ուժի մեջ է 24 ժամ։ Եթե դուք չեք ստեղծել այս հաշիվը, կարող եք անտեսել այս նամակը։\n\n"
            "— Հախվերդյան Շինմոնտաժ"
        ),
    },
}

# Table-based layout with every style inlined — the only way to get consistent
# rendering across email clients (Outlook/Gmail strip <style> blocks and don't
# reliably support flexbox/grid). No images per the deliverability guidance for
# a shared IP, so the "logo" is just styled text on a brand-red band.
_VERIFICATION_HTML = """\
<!DOCTYPE html>
<html lang="{html_lang}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{subject}</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f6f6f7;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6f6f7;">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; background-color:#ffffff; border-radius:16px; overflow:hidden;">
            <tr>
              <td style="background-color:#b12326; padding:26px 32px;">
                <span style="font-family:Arial,Helvetica,sans-serif; font-size:20px; font-weight:bold; color:#ffffff; letter-spacing:-0.02em;">Hakhverdyan</span>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px 4px;">
                <h1 style="margin:0 0 18px; font-family:Arial,Helvetica,sans-serif; font-size:21px; line-height:1.3; color:#2d2d2d;">{heading}</h1>
                <p style="margin:0 0 14px; font-family:Arial,Helvetica,sans-serif; font-size:15px; line-height:1.6; color:#5c6270;">{greeting}</p>
                <p style="margin:0 0 30px; font-family:Arial,Helvetica,sans-serif; font-size:15px; line-height:1.6; color:#5c6270;">{intro}</p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:0 32px 34px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-radius:8px; background-color:#b12326;">
                      <a href="{link}" style="display:inline-block; padding:14px 34px; font-family:Arial,Helvetica,sans-serif; font-size:15px; font-weight:bold; color:#ffffff; text-decoration:none; border-radius:8px;">{button}</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 32px;">
                <p style="margin:0 0 10px; font-family:Arial,Helvetica,sans-serif; font-size:13px; line-height:1.6; color:#9ca3af;">{expiry}</p>
                <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:12px; line-height:1.6; color:#c2c6cc; word-break:break-all;">{fallback} <a href="{link}" style="color:#9ca3af;">{link}</a></p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px; border-top:1px solid #eceef0;">
                <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:12px; color:#9ca3af;">{signoff}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
"""


def build_verification_email(name: str, link: str, lang: str = "en"):
    tpl = VERIFICATION_TEMPLATES.get(lang) or VERIFICATION_TEMPLATES["en"]
    text_body = tpl["body"].format(name=name, link=link)
    html_body = _VERIFICATION_HTML.format(
        html_lang=lang if lang in VERIFICATION_TEMPLATES else "en",
        subject=tpl["subject"],
        heading=tpl["heading"],
        greeting=tpl["greeting"].format(name=name),
        intro=tpl["intro"],
        button=tpl["button"],
        expiry=tpl["expiry"],
        fallback=tpl["fallback"],
        signoff=tpl["signoff"],
        link=link,
    )
    return tpl["subject"], text_body, html_body


TEMPLATES = {
    "en": {
        "subject": "Booking confirmation #{id} — Hakhverdyan Shinmontazh",
        "greeting": "Hi {name},",
        "confirmed": "Your booking #{id} has been received and confirmed.",
        "items_label": "Items:",
        "total_label": "Total:",
        "followup": "We'll call {phone} within 48 hours to confirm delivery and installation details.",
        "signoff": "— Hakhverdyan Shinmontazh",
    },
    "hy": {
        "subject": "Հայտի հաստատում #{id} — Հախվերդյան Շինմոնտաժ",
        "greeting": "Բարև, {name},",
        "confirmed": "Ձեր հայտը #{id} ընդունված և հաստատված է։",
        "items_label": "Ապրանքներ.",
        "total_label": "Ընդամենը.",
        "followup": "Մենք կզանգենք {phone} համարին 48 ժամվա ընթացքում՝ առաքման և տեղադրման մանրամասները հաստատելու համար։",
        "signoff": "— Հախվերդյան Շինմոնտաժ",
    },
}


def build_confirmation_email(quote, email_items, lang="en"):
    tpl = TEMPLATES.get(lang) or TEMPLATES["en"]
    use_hy = lang == "hy"

    lines = [
        tpl["greeting"].format(name=quote.name),
        "",
        tpl["confirmed"].format(id=quote.id),
        "",
        tpl["items_label"],
    ]
    for it in email_items:
        name = (it.get("name_hy") if use_hy else None) or it["name"]
        lines.append(f"  {it['qty']} × {name} — {it['price']:,}֏ {it['unit']}")
    lines += [
        "",
        f"{tpl['total_label']} {quote.total:,}֏",
        "",
        tpl["followup"].format(phone=quote.phone),
        "",
        tpl["signoff"],
    ]
    subject = tpl["subject"].format(id=quote.id)
    body = "\n".join(lines)
    return subject, body


def send_email_simulated(db: Session, *, to_email: str, subject: str, body: str, quote_request_id=None) -> EmailLog:
    log = EmailLog(to_email=to_email, subject=subject, body=body, quote_request_id=quote_request_id)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
