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

# Instalar dependencias del backend
RUN cd backend && composer install --no-dev --optimize-autoloader --no-scripts

# Limpiar caché
RUN cd backend && php bin/console cache:clear --env=prod --no-warmup || true

# Crear directorios necesarios
RUN mkdir -p backend/var/cache backend/var/log && chmod -R 777 backend/var

EXPOSE 8000

CMD cd backend && php -S 0.0.0.0:$PORT -t public
