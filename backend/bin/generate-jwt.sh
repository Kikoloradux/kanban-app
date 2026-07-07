#!/bin/bash
cd /app/backend
mkdir -p config/jwt
if [ ! -f config/jwt/private.pem ]; then
    php bin/console lexik:jwt:generate-keypair --skip-if-exists
    chmod 644 config/jwt/*.pem
fi
