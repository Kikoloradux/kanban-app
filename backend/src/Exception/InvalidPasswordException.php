<?php 

declare(strict_types=1);

namespace App/Exception

class InvalidPasswordException extends AppException

{
    protected int $statusCode = 400;
    protected string $errorCode = 'invalid_password';

    public function __construct(string $message = 'La contraseña no cumple con los requisitos de seguridad')
    {
        parent::__construct($message);
    }
}
