FROM php:8.4-cli

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    libpq-dev \
    libonig-dev \
    libmariadb-dev \
    && rm -rf /var/lib/apt/lists/*

# Instalar extensiones PHP
RUN docker-php-ext-install pdo_mysql mysqli zip mbstring

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copiar todo el proyecto
COPY . .

# Instalar dependencias del backend
RUN cd backend && composer install --no-dev --optimize-autoloader

# Crear carpeta para JWT y generar claves (SOLUCIÓN DEFINITIVA)
RUN mkdir -p backend/config/jwt && \
    cd backend && \
    php bin/console lexik:jwt:generate-keypair --skip-if-exists

# Limpiar caché
RUN cd backend && php bin/console cache:clear --env=prod || true

EXPOSE 8000

CMD cd backend && php -S 0.0.0.0:8080 -t public
