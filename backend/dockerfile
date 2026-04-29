# 1. Base Python image
FROM python:3.11-slim

# 2. Set working directory inside container
WORKDIR /app

# 3. Copy project files into container
COPY . .

# 4. Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# 5. Set Cloud Run port
ENV PORT=8080

# 6. Start Django with Gunicorn (production server)
CMD exec gunicorn config.wsgi:application --bind 0.0.0.0:$PORT