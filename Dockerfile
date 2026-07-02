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
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos del backend
COPY backend/ ./backend/

# Instalar dependencias
RUN cd backend && composer install --no-dev --optimize-autoloader

# Copiar el frontend (opcional, para servir archivos estáticos)
COPY frontend/ ./frontend/

# Exponer puerto
EXPOSE 8000

# Comando de inicio
CMD cd backend && php -S 0.0.0.0:$PORT -t public
