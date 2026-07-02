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

# Copiar todo el proyecto
COPY . .

# Instalar dependencias del backend (en la carpeta correcta)
RUN cd /app/backend && composer install --no-dev --optimize-autoloader --no-scripts

# Limpiar caché
RUN cd /app/backend && php bin/console cache:clear --env=prod --no-warmup || true

# Crear directorios necesarios
RUN mkdir -p /app/backend/var/cache /app/backend/var/log && chmod -R 777 /app/backend/var

# Verificar que los archivos existen
RUN ls -la /app/backend/vendor/autoload.php

EXPOSE 8000

CMD cd /app/backend && php -S 0.0.0.0:$PORT -t public
