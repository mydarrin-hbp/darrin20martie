import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# Adăugăm calea către folderul backend în sys.path pentru a permite importurile din 'app'
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), '..')))

# Importăm Base din locul său de bază (fără modele atașate aici pentru a evita Circular Import)
from app.db.base_class import Base

# Importăm manual toate modelele pentru ca Alembic să le "vadă" metadata-ul în timpul --autogenerate
# Această metodă previne eroarea "ImportError: cannot import name 'Domain' from partially initialized module"
from app.models.user import User
from app.models.service import Service, partner_services
from app.models.domain import Domain
from app.models.category import Category
from app.models.subcategory import Subcategory

# Obiectul de configurare Alembic, care oferă acces la valorile din fișierul .ini în uz.
config = context.config

# Interpretăm fișierul de configurare pentru logare.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Setăm target_metadata pentru suportul 'autogenerate'
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Rulează migrările în modul 'offline'.
    Configurează contextul doar cu un URL și nu cu un Engine.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        render_as_batch=True  # Necesar pentru suportul corect de ALTER TABLE în SQLite
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Rulează migrările în modul 'online'.
    Creează un Engine și asociază o conexiune cu contextul.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, 
            target_metadata=target_metadata,
            render_as_batch=True  # Necesar pentru suportul corect de ALTER TABLE în SQLite
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()