# Cloud SQL Connection

Connection string pregatit pentru Google Cloud SQL PostgreSQL:

```env
DATABASE_URL=postgresql+psycopg://mydarrin_app:YOUR_CLOUD_SQL_PASSWORD@34.155.95.43:5432/mydarrin?sslmode=require
```

Observatii:

- `YOUR_CLOUD_SQL_PASSWORD` trebuie inlocuit doar local sau in Secret Manager.
- parola nu se comite niciodata in repo.
- stringul este compatibil cu SQLAlchemy + `psycopg`.
