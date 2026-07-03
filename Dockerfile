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

# Copiar todo el proyecto
WORKDIR /app
COPY . .

# Instalar dependencias de Composer
RUN cd /app/backend && APP_ENV=prod composer install --no-dev --optimize-autoloader --no-interaction

# Limpiar caché
RUN cd /app/backend && APP_ENV=prod php bin/console cache:clear --no-warmup || true

# Crear directorios necesarios
RUN mkdir -p /app/backend/var/cache /app/backend/var/log && chmod -R 777 /app/backend/var

# Verificar que vendor existe
RUN ls -la /app/backend/vendor/autoload.php

EXPOSE 8000

CMD cd /app/backend && APP_ENV=prod php -S 0.0.0.0:$PORT -t public
