FROM php:8.4-cli

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    libonig-dev \
    libmariadb-dev \
    && rm -rf /var/lib/apt/lists/*

# Instalar extensiones PHP
RUN docker-php-ext-install pdo_mysql mysqli zip mbstring

# Instalar Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /app

# Copiar archivos
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Instalar dependencias sin scripts
RUN cd backend && composer install --no-dev --optimize-autoloader --no-scripts

# Limpiar caché
RUN cd backend && php bin/console cache:clear --env=prod --no-warmup || true

EXPOSE 8000

CMD cd backend && php -S 0.0.0.0:$PORT -t public
