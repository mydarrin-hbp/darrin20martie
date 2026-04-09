$env:PYTHONPATH='.'
$env:DATABASE_URL='sqlite:///mydarrin.db'
$env:JWT_SECRET='local-dev-super-admin-secret-2026'

python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
