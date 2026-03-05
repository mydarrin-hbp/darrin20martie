from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# Import models so Alembic can detect them
import app.modules.geography.models  # noqa
import app.modules.catalog.models  # noqa
import app.modules.activities.models  # noqa