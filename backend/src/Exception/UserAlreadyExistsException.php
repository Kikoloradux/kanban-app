<?php

declare(strict_types=1);

namespace App\Exception;

class UserAlreadyExistsException extends AppException
{
    protected int $statusCode = 409;
    protected string $errorCode = 'user_already_exists';

    public function __construct(string $email)
    {
        parent::__construct(sprintf('El usuario con email "%s" ya existe', $email));
    }
} 
