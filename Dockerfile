FROM node:22-bookworm-slim AS frontend
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY index.html vite.config.js ./
COPY src ./src
RUN npm run build

FROM python:3.12-slim-bookworm AS python-base
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
WORKDIR /app
RUN groupadd --gid 10001 pulso \
    && useradd --uid 10001 --gid pulso --create-home pulso \
    && mkdir /app/data \
    && chown pulso:pulso /app/data
COPY app ./app
USER pulso

FROM python-base AS test
COPY tests ./tests
RUN python -m unittest discover -s tests -v

FROM python-base AS runtime
COPY --from=frontend /build/dist ./dist
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/metadata', timeout=3).close()"
CMD ["python", "-m", "app.server", "--host", "0.0.0.0", "--port", "8000"]
