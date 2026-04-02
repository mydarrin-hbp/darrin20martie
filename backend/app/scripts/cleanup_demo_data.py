from __future__ import annotations

import argparse

from sqlalchemy import delete, select

from app.db.session import SessionLocal
from app.models.signup_lead import SignupLead
from app.models.user import User
from app.modules.orders.models import Order


DEMO_EMAILS = {
    "control.admin@mydarrin.ro",
    "admin.e2e@mydarrin.local",
}
DEMO_EMAIL_SUFFIXES = ("@mydarrin.local", "@example.com")


def _is_demo_email(email: str | None) -> bool:
    if not email:
        return False
    if email in DEMO_EMAILS:
        return True
    return any(email.endswith(suffix) for suffix in DEMO_EMAIL_SUFFIXES)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Sterge efectiv datele demo")
    args = parser.parse_args()

    with SessionLocal() as db:
        users = db.execute(select(User)).scalars().all()
        demo_users = [user for user in users if _is_demo_email(user.email)]
        demo_user_ids = [user.id for user in demo_users]

        leads = db.execute(select(SignupLead)).scalars().all()
        demo_leads = [lead for lead in leads if _is_demo_email(lead.email)]

        demo_orders = []
        if demo_user_ids:
            demo_orders = db.execute(select(Order).where(Order.client_user_id.in_(demo_user_ids))).scalars().all()

        print(f"Demo users: {len(demo_users)} -> {[user.email for user in demo_users]}")
        print(f"Demo signup leads: {len(demo_leads)} -> {[lead.email for lead in demo_leads]}")
        print(f"Demo orders: {len(demo_orders)} -> {[order.order_ref for order in demo_orders]}")

        if not args.apply:
            print("Dry-run: nu s-au sters date. Ruleaza cu --apply pentru stergere.")
            return

        if demo_orders:
            db.execute(delete(Order).where(Order.id.in_([order.id for order in demo_orders])))
        if demo_leads:
            db.execute(delete(SignupLead).where(SignupLead.id.in_([lead.id for lead in demo_leads])))
        if demo_users:
            db.execute(delete(User).where(User.id.in_(demo_user_ids)))

        db.commit()
        print("Cleanup demo: completat.")


if __name__ == "__main__":
    main()
