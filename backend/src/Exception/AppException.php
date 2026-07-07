<?php

declare(strict_types=1);

namespace App\Exception;

abstract class AppException extends \RuntimeException
{
    protected int $statusCode = 400;
    protected string $errorCode = 'app_error';

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    public function getErrorCode(): string
    {
        return $this->errorCode;
    }

    public function toArray(): array
    {
        return [
            'error' => [
                'code' => $this->errorCode,
                'message' => $this->getMessage(),
                'status' => $this->statusCode
            ]
        ];
    }
}
