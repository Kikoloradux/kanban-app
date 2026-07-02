#!/bin/bash

# Entrar al backend y ejecutar el servidor
cd backend
php -S 0.0.0.0:$PORT -t public
