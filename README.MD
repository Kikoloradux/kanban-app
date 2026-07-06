Kanban App
Descripción
Kanban App es una aplicación para la gestión de proyectos y tareas basada en metodología Kanban. Permite crear proyectos, añadir tareas asociadas y organizarlas visualmente por estado dentro de un tablero interactivo. Este proyecto ha sido desarrollado como práctica técnica para trabajar una arquitectura moderna basada en contenedores, APIs REST y frontend reactivo.

Tecnologías:

Frontend: Next.js + React
Backend: Symfony 8 + PHP 8.4
Base de datos: MySQL
Infraestructura: Docker + Docker Compose
Autenticación: JWT


Funcionalidades:

Registro de usuarios
Inicio de sesión
Autenticación segura mediante JWT
Crear, visualizar y eliminar proyectos
Crear, editar y eliminar tareas
Tablero Kanban con estados:
Pendiente
En progreso
Completada
Drag & Drop entre columnas
Filtros, búsqueda y paginación


Modelo de datos:
User
id
email
password
roles


Project
id
name
description
user_id

Task
id
title
description
status
project_id

Ejecución

Desde la raíz del proyecto:
docker-compose up --build
URLs
Frontend:
http://localhost:3000
Backend:
http://localhost:8000
Credenciales usuario de prueba:
usuario: test@test.com
contraseña: test123
Objetivo del proyecto:
El objetivo fue desarrollar una aplicación trabajando con contenedores, APIs REST, persistencia en base de datos, autenticación JWT y una interfaz moderna basada en React.
Autor: Juan Luis Gamito