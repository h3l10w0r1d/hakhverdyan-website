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
        "body": (
            "Hi {name},\n\n"
            "Please confirm your email address by opening this link:\n{link}\n\n"
            "The link works for 24 hours. If you didn't sign up, you can ignore this email.\n\n"
            "— Hakhverdyan Shinmontazh"
        ),
        "html": (
            "<p>Hi {name},</p>"
            "<p>Please confirm your email address by opening this link:</p>"
            "<p><a href=\"{link}\">{link}</a></p>"
            "<p>The link works for 24 hours. If you didn't sign up, you can ignore this email.</p>"
            "<p>— Hakhverdyan Shinmontazh</p>"
        ),
    },
    "hy": {
        "subject": "Հաստատեք ձեր էլ. հասցեն",
        "body": (
            "Բարև, {name},\n\n"
            "Խնդրում ենք հաստատել ձեր էլ. հասցեն՝ բացելով այս հղումը.\n{link}\n\n"
            "Հղումն ուժի մեջ է 24 ժամ։ Եթե դուք չեք գրանցվել, կարող եք անտեսել այս նամակը։\n\n"
            "— Հախվերդյան Շինմոնտաժ"
        ),
        "html": (
            "<p>Բարև, {name},</p>"
            "<p>Խնդրում ենք հաստատել ձեր էլ. հասցեն՝ բացելով այս հղումը.</p>"
            "<p><a href=\"{link}\">{link}</a></p>"
            "<p>Հղումն ուժի մեջ է 24 ժամ։ Եթե դուք չեք գրանցվել, կարող եք անտեսել այս նամակը։</p>"
            "<p>— Հախվերդյան Շինմոնտաժ</p>"
        ),
    },
}


def build_verification_email(name: str, link: str, lang: str = "en"):
    tpl = VERIFICATION_TEMPLATES.get(lang) or VERIFICATION_TEMPLATES["en"]
    text_body = tpl["body"].format(name=name, link=link)
    html_body = tpl["html"].format(name=name, link=link)
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
