<?php

declare(strict_types=1);

namespace App\EventListener;

use App\Exception\AppException;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

class ExceptionListener
{
    public function __construct(private readonly LoggerInterface $logger)
    {
    }

    public function onKernelException(ExceptionEvent $event): void
    {
        $exception = $event->getThrowable();
        $request = $event->getRequest();

        if (str_contains($request->getPathInfo(), '/api') || 
            $request->getContentTypeFormat() === 'json') {
            
            $statusCode = 500;
            $errorCode = 'internal_server_error';
            $message = 'Error interno del servidor';

            if ($exception instanceof AppException) {
                $statusCode = $exception->getStatusCode();
                $errorCode = $exception->getErrorCode();
                $message = $exception->getMessage();
            } elseif ($exception instanceof HttpExceptionInterface) {
                $statusCode = $exception->getStatusCode();
                $message = $exception->getMessage();
            }

            $this->logger->error($message, [
                'exception' => get_class($exception),
                'code' => $errorCode,
                'status' => $statusCode,
                'ip' => $request->getClientIp(),
                'uri' => $request->getRequestUri()
            ]);

            $response = new JsonResponse([
                'error' => [
                    'code' => $errorCode,
                    'message' => $message,
                    'status' => $statusCode
                ]
            ], $statusCode);

            $event->setResponse($response);
        }
    }
}
