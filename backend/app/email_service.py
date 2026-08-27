from sqlalchemy.orm import Session

from .models import EmailLog

# No real mail transport is wired up yet — "sending" a confirmation email means
# rendering it and storing it in EmailLog, which the API hands back to the client
# so the UI can show exactly what would have landed in the customer's inbox.

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
