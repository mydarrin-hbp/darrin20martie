from __future__ import annotations

from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine


DEVIZ_TABLE_PATCHES: dict[str, dict[str, str]] = {
    "deviz_drafts": {
        "locality_id": "ALTER TABLE deviz_drafts ADD COLUMN locality_id INTEGER",
        "source_message": "ALTER TABLE deviz_drafts ADD COLUMN source_message VARCHAR(500)",
    },
    "deviz_levels": {
        "cost_direct_total": "ALTER TABLE deviz_levels ADD COLUMN cost_direct_total FLOAT NOT NULL DEFAULT 0",
        "indirect_cost_value": "ALTER TABLE deviz_levels ADD COLUMN indirect_cost_value FLOAT NOT NULL DEFAULT 0",
        "platform_maintenance_value": "ALTER TABLE deviz_levels ADD COLUMN platform_maintenance_value FLOAT NOT NULL DEFAULT 0",
        "mydarrin_platform_value": "ALTER TABLE deviz_levels ADD COLUMN mydarrin_platform_value FLOAT NOT NULL DEFAULT 0",
    },
    "deviz_calculations": {
        "cost_direct_total": "ALTER TABLE deviz_calculations ADD COLUMN cost_direct_total FLOAT NOT NULL DEFAULT 0",
        "indirect_cost_value": "ALTER TABLE deviz_calculations ADD COLUMN indirect_cost_value FLOAT NOT NULL DEFAULT 0",
        "platform_maintenance_value": "ALTER TABLE deviz_calculations ADD COLUMN platform_maintenance_value FLOAT NOT NULL DEFAULT 0",
        "mydarrin_platform_value": "ALTER TABLE deviz_calculations ADD COLUMN mydarrin_platform_value FLOAT NOT NULL DEFAULT 0",
    },
    "users": {
        "full_name": "ALTER TABLE users ADD COLUMN full_name VARCHAR(255)",
        "phone": "ALTER TABLE users ADD COLUMN phone VARCHAR(50)",
        "city": "ALTER TABLE users ADD COLUMN city VARCHAR(120)",
        "role": "ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'CLIENT'",
        "verification_status": "ALTER TABLE users ADD COLUMN verification_status VARCHAR(50) DEFAULT 'PENDING'",
    },
    "suppliers": {
        "user_id": "ALTER TABLE suppliers ADD COLUMN user_id INTEGER",
        "contact_email": "ALTER TABLE suppliers ADD COLUMN contact_email VARCHAR(255)",
        "insurance_status": "ALTER TABLE suppliers ADD COLUMN insurance_status VARCHAR(32) NOT NULL DEFAULT 'PENDING'",
        "insurance_policy_no": "ALTER TABLE suppliers ADD COLUMN insurance_policy_no VARCHAR(120)",
        "insurance_valid_until": "ALTER TABLE suppliers ADD COLUMN insurance_valid_until DATETIME",
        "criminal_record_status": "ALTER TABLE suppliers ADD COLUMN criminal_record_status VARCHAR(32) NOT NULL DEFAULT 'PENDING'",
        "criminal_record_valid_until": "ALTER TABLE suppliers ADD COLUMN criminal_record_valid_until DATETIME",
        "integrity_declaration_status": "ALTER TABLE suppliers ADD COLUMN integrity_declaration_status VARCHAR(32) NOT NULL DEFAULT 'PENDING'",
    },
    "admin_price_configs": {
        "escrow_retention_percentage": "ALTER TABLE admin_price_configs ADD COLUMN escrow_retention_percentage FLOAT NOT NULL DEFAULT 0",
        "insurance_premium_fixed": "ALTER TABLE admin_price_configs ADD COLUMN insurance_premium_fixed FLOAT NOT NULL DEFAULT 0",
        "insurance_premium_percentage": "ALTER TABLE admin_price_configs ADD COLUMN insurance_premium_percentage FLOAT NOT NULL DEFAULT 0",
        "darrin_management_fee_fixed": "ALTER TABLE admin_price_configs ADD COLUMN darrin_management_fee_fixed FLOAT NOT NULL DEFAULT 0",
        "darrin_management_fee_percentage": "ALTER TABLE admin_price_configs ADD COLUMN darrin_management_fee_percentage FLOAT NOT NULL DEFAULT 0",
    },
    "price_analyses": {
        "escrow_retention_percentage": "ALTER TABLE price_analyses ADD COLUMN escrow_retention_percentage FLOAT NOT NULL DEFAULT 0",
        "insurance_premium_fixed": "ALTER TABLE price_analyses ADD COLUMN insurance_premium_fixed FLOAT NOT NULL DEFAULT 0",
        "insurance_premium_percentage": "ALTER TABLE price_analyses ADD COLUMN insurance_premium_percentage FLOAT NOT NULL DEFAULT 0",
        "darrin_management_fee_fixed": "ALTER TABLE price_analyses ADD COLUMN darrin_management_fee_fixed FLOAT NOT NULL DEFAULT 0",
        "darrin_management_fee_percentage": "ALTER TABLE price_analyses ADD COLUMN darrin_management_fee_percentage FLOAT NOT NULL DEFAULT 0",
        "escrow_retention_value": "ALTER TABLE price_analyses ADD COLUMN escrow_retention_value FLOAT NOT NULL DEFAULT 0",
        "insurance_premium_value": "ALTER TABLE price_analyses ADD COLUMN insurance_premium_value FLOAT NOT NULL DEFAULT 0",
        "darrin_management_fee_value": "ALTER TABLE price_analyses ADD COLUMN darrin_management_fee_value FLOAT NOT NULL DEFAULT 0",
    },
    "cost_calculations": {
        "escrow_retention_value": "ALTER TABLE cost_calculations ADD COLUMN escrow_retention_value FLOAT NOT NULL DEFAULT 0",
        "insurance_premium_value": "ALTER TABLE cost_calculations ADD COLUMN insurance_premium_value FLOAT NOT NULL DEFAULT 0",
        "darrin_management_fee_value": "ALTER TABLE cost_calculations ADD COLUMN darrin_management_fee_value FLOAT NOT NULL DEFAULT 0",
    },
    "orders": {
        "asset_id": "ALTER TABLE orders ADD COLUMN asset_id INTEGER",
        "work_package_id": "ALTER TABLE orders ADD COLUMN work_package_id INTEGER",
        "client_user_id": "ALTER TABLE orders ADD COLUMN client_user_id INTEGER",
        "asset_label": "ALTER TABLE orders ADD COLUMN asset_label VARCHAR(150)",
        "intervention_label": "ALTER TABLE orders ADD COLUMN intervention_label VARCHAR(120)",
        "task_label": "ALTER TABLE orders ADD COLUMN task_label VARCHAR(255)",
        "skill_label": "ALTER TABLE orders ADD COLUMN skill_label VARCHAR(150)",
        "required_people": "ALTER TABLE orders ADD COLUMN required_people INTEGER",
        "esco_codes": "ALTER TABLE orders ADD COLUMN esco_codes TEXT",
        "nace_codes": "ALTER TABLE orders ADD COLUMN nace_codes TEXT",
        "required_certification_codes": "ALTER TABLE orders ADD COLUMN required_certification_codes TEXT",
        "standard_consumables": "ALTER TABLE orders ADD COLUMN standard_consumables TEXT",
        "insurance_premium": "ALTER TABLE orders ADD COLUMN insurance_premium FLOAT NOT NULL DEFAULT 0",
        "darrin_management_fee": "ALTER TABLE orders ADD COLUMN darrin_management_fee FLOAT NOT NULL DEFAULT 0",
        "escrow_status": "ALTER TABLE orders ADD COLUMN escrow_status VARCHAR(32) NOT NULL DEFAULT 'NOT_REQUIRED'",
        "escrow_blocked_amount": "ALTER TABLE orders ADD COLUMN escrow_blocked_amount FLOAT NOT NULL DEFAULT 0",
        "provider_ref": "ALTER TABLE orders ADD COLUMN provider_ref VARCHAR(120)",
        "provider_name": "ALTER TABLE orders ADD COLUMN provider_name VARCHAR(255)",
        "updated_at": "ALTER TABLE orders ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP",
    },
    "financial_configs": {
        "labor_margin_percentage": "ALTER TABLE financial_configs ADD COLUMN labor_margin_percentage FLOAT NOT NULL DEFAULT 0.15",
        "material_margin_percentage": "ALTER TABLE financial_configs ADD COLUMN material_margin_percentage FLOAT NOT NULL DEFAULT 0.10",
        "rental_margin_percentage": "ALTER TABLE financial_configs ADD COLUMN rental_margin_percentage FLOAT NOT NULL DEFAULT 0.15",
    },
}


def ensure_sqlite_runtime_schema(engine: Engine) -> None:
    if engine.dialect.name != "sqlite":
        return

    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())
    with engine.begin() as connection:
        if "labor_rates" not in existing_tables:
            connection.execute(
                text(
                    """
                    CREATE TABLE labor_rates (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        country_id INTEGER,
                        zone_id INTEGER,
                        locality_id INTEGER,
                        skill_code VARCHAR(120) NOT NULL,
                        skill_label VARCHAR(255) NOT NULL,
                        ro_skill_code VARCHAR(64),
                        esco_code VARCHAR(64),
                        uniclass_code VARCHAR(64),
                        deviz_indicator_series VARCHAR(32),
                        currency VARCHAR(3) NOT NULL DEFAULT 'RON',
                        base_rate FLOAT NOT NULL DEFAULT 0,
                        weekend_multiplier FLOAT NOT NULL DEFAULT 1,
                        holiday_multiplier FLOAT NOT NULL DEFAULT 1,
                        night_multiplier FLOAT NOT NULL DEFAULT 1,
                        is_active BOOLEAN NOT NULL DEFAULT 1,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                    """
                )
            )
            connection.execute(
                text(
                    """
                    CREATE UNIQUE INDEX IF NOT EXISTS uq_labor_rate_scope
                    ON labor_rates (country_id, zone_id, locality_id, skill_code)
                    """
                )
            )
            existing_tables.add("labor_rates")
        else:
            labor_columns = {column["name"] for column in inspector.get_columns("labor_rates")}
            if "ro_skill_code" not in labor_columns:
                connection.execute(text("ALTER TABLE labor_rates ADD COLUMN ro_skill_code VARCHAR(64)"))
            if "esco_code" not in labor_columns:
                connection.execute(text("ALTER TABLE labor_rates ADD COLUMN esco_code VARCHAR(64)"))
            if "uniclass_code" not in labor_columns:
                connection.execute(text("ALTER TABLE labor_rates ADD COLUMN uniclass_code VARCHAR(64)"))
            if "deviz_indicator_series" not in labor_columns:
                connection.execute(text("ALTER TABLE labor_rates ADD COLUMN deviz_indicator_series VARCHAR(32)"))

        if "admins" not in existing_tables:
            connection.execute(
                text(
                    """
                    CREATE TABLE admins (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER NOT NULL UNIQUE,
                        role_key VARCHAR(64) NOT NULL,
                        country_access JSON NOT NULL DEFAULT '[]',
                        module_access JSON NOT NULL DEFAULT '[]',
                        invitation_token VARCHAR(255) UNIQUE,
                        invitation_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
                        invited_by_user_id INTEGER,
                        is_active BOOLEAN NOT NULL DEFAULT 1,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
                        FOREIGN KEY(invited_by_user_id) REFERENCES users(id) ON DELETE SET NULL
                    )
                    """
                )
            )
            existing_tables.add("admins")

        if "admin_permissions" not in existing_tables:
            connection.execute(
                text(
                    """
                    CREATE TABLE admin_permissions (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        admin_id INTEGER NOT NULL,
                        permission_code VARCHAR(120) NOT NULL,
                        module_key VARCHAR(64) NOT NULL,
                        country_code VARCHAR(3),
                        is_active BOOLEAN NOT NULL DEFAULT 1,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY(admin_id) REFERENCES admins(id) ON DELETE CASCADE
                    )
                    """
                )
            )
            connection.execute(
                text(
                    """
                    CREATE UNIQUE INDEX IF NOT EXISTS uq_admin_permission_scope
                    ON admin_permissions (admin_id, permission_code, country_code)
                    """
                )
            )
            existing_tables.add("admin_permissions")

        if "order_broadcasts" not in existing_tables:
            connection.execute(
                text(
                    """
                    CREATE TABLE order_broadcasts (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        order_id INTEGER NOT NULL,
                        supplier_id INTEGER NOT NULL,
                        task_scope VARCHAR(64) NOT NULL DEFAULT 'GENERAL',
                        claim_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
                        can_cover_full_package BOOLEAN NOT NULL DEFAULT 0,
                        locality_slug VARCHAR(150),
                        priority_expires_at DATETIME,
                        claimed_at DATETIME,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
                        FOREIGN KEY(supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
                    )
                    """
                )
            )
            connection.execute(text("CREATE INDEX IF NOT EXISTS ix_order_broadcasts_order_id ON order_broadcasts(order_id)"))
            connection.execute(text("CREATE INDEX IF NOT EXISTS ix_order_broadcasts_supplier_id ON order_broadcasts(supplier_id)"))
            connection.execute(text("CREATE INDEX IF NOT EXISTS ix_order_broadcasts_claim_status ON order_broadcasts(claim_status)"))
            existing_tables.add("order_broadcasts")

        if "order_reviews" not in existing_tables:
            connection.execute(
                text(
                    """
                    CREATE TABLE order_reviews (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        order_id INTEGER NOT NULL,
                        user_id INTEGER,
                        rating INTEGER NOT NULL,
                        feedback TEXT NOT NULL,
                        is_visible BOOLEAN NOT NULL DEFAULT 1,
                        admin_note TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
                        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
                    )
                    """
                )
            )
            connection.execute(text("CREATE INDEX IF NOT EXISTS ix_order_reviews_order_id ON order_reviews(order_id)"))
            connection.execute(text("CREATE INDEX IF NOT EXISTS ix_order_reviews_visible ON order_reviews(is_visible)"))
            existing_tables.add("order_reviews")

        for table_name, patches in DEVIZ_TABLE_PATCHES.items():
            if table_name not in existing_tables:
                continue

            existing_columns = {column["name"] for column in inspector.get_columns(table_name)}
            for column_name, statement in patches.items():
                if column_name in existing_columns:
                    continue
                connection.execute(text(statement))
