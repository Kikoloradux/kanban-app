<?php

declare(strict_types=1);

namespace App\Exception;

class RateLimitExceededException extends AppException
{
    protected int $statusCode = 429;
    protected string $errorCode = 'rate_limit_exceeded';

    public function __construct(string $message = 'Demasiados intentos. Espera 1 hora.')
    {
        parent::__construct($message);
    }
}
