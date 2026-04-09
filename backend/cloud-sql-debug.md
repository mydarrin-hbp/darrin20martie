# Cloud SQL Debug

## Context

- Project: `mydarrin-platform`
- Cloud SQL instance: `mydarrin-db`
- Database: `mydarrin`
- Host/IP folosit: `34.155.95.43`
- Driver: `psycopg`

## Verificare psycopg

### requirements.txt

```text
psycopg[binary]
```

### pip show psycopg

```text
Name: psycopg
Version: 3.3.3
```

### pip show psycopg in .venv

```text
Name: psycopg
Version: 3.3.3
Location: C:\Users\admin\Desktop\mydarrin-platform\backend\.venv\Lib\site-packages
```

## DATABASE_URL testat

Valoarea folosita este URL-encoded corect pentru caractere speciale:

```env
DATABASE_URL=postgresql+psycopg://mydarrin_app:***@34.155.95.43:5432/mydarrin?sslmode=require
```

Observatie:

- `:` este encodat ca `%3A`
- `^` este encodat ca `%5E`
- `%` este encodat ca `%25`
- `\` este encodat ca `%5C`

## Output real test_cloud_sql_connection.py

```text
[1/4] Pregatesc conexiunea SQLAlchemy...
DATABASE_URL: postgresql+psycopg://mydarrin_app:***@34.155.95.43:5432/mydarrin?sslmode=require
[2/4] Deschid conexiunea catre Cloud SQL...
Eroare OperationalError: (psycopg.OperationalError) connection failed: connection to server at "34.155.95.43", port 5432 failed: Permission denied (0x0000271D/10013)
        Is the server running on that host and accepting TCP/IP connections?
```

## Output real Test-NetConnection

```text
WARNING: TCP connect to (34.155.95.43 : 5432) failed

ComputerName     : 34.155.95.43
RemotePort       : 5432
TcpTestSucceeded : False
```

## Concluzie tehnica

Conexiunea nu ajunge inca la PostgreSQL. Blocajul este la nivel de acces TCP/retea, inainte de autentificare efectiva.

Asta inseamna ca trebuie verificat in Google Cloud:

1. `Cloud SQL -> Connections -> Public IP`
2. daca IP-ul public este activ
3. daca exista `Authorized networks`
4. pentru test temporar, adauga `0.0.0.0/0`
5. confirma ca instanta accepta conexiuni publice
6. confirma ca portul `5432` este accesibil

## Comanda finala de migrare

Se ruleaza doar dupa ce `test_cloud_sql_connection.py` trece:

```powershell
python -m alembic upgrade head
```

## Status final

- `psycopg` este instalat si actualizat
- scriptul de test are timeout, logging si tratare de erori
- URL-ul este encodat corect
- conexiunea Cloud SQL nu este inca stabila
- migrarea pe Cloud SQL nu a fost rulata deoarece accesul TCP catre `34.155.95.43:5432` esueaza
