FROM python:3.11-slim

WORKDIR /app

# Install build deps
RUN apt-get update \
 && apt-get install -y gcc libpq-dev \
 && rm -rf /var/lib/apt/lists/*

# Copy & install Python deps (including daphne)
COPY backend/requirements.txt .
RUN pip install --upgrade pip setuptools wheel \
 && pip install --no-cache-dir -r requirements.txt

# Ensure /usr/local/bin (where pip drops scripts) is on PATH
ENV PATH="/usr/local/bin:${PATH}"

# Copy app code
COPY . .

EXPOSE 8000

CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "savvynote.asgi:application"]
