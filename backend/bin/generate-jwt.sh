#!/bin/bash

cd /app/backend
if [ ! -f config/jwt/private.pem ]; then
    mkdir -p config/jwt
    php bin/console lexik:jwt:generate-keypair --skip-if-exists
    chmod 644 config/jwt/*.perm
fi
