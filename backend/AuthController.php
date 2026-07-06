<?php

namespace App\Controller;

use App\DTO\UserRegistrationDTO;
use App\Service\UserService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AuthController extends AbstractController
{
    private UserService $userService;
    private RateLimiterFactory $registerLimiter;
    private ValidatorInterface $validator;

    public function __construct(
        UserService $userService,
        RateLimiterFactory $registerLimiter,
        ValidatorInterface $validator
    ) {
        $this->userService = $userService;
        $this->registerLimiter = $registerLimiter;
        $this->validator = $validator;
    }

    #[Route('/register', name: 'api_register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        // Rate Limiting
        $limiter = $this->registerLimiter->create($request->getClientIp());
        if (!$limiter->consume()->isAccepted()) {
            return new JsonResponse(['error' => 'Demasiados intentos. Espera 1 hora.'], 429);
        }

        $data = json_decode($request->getContent(), true);
        if (!$data || !isset($data['email']) || !isset($data['password'])) {
            return new JsonResponse(['error' => 'Email y password son requeridos'], 400);
        }

        // Validar con DTO
        $dto = new UserRegistrationDTO($data['email'], $data['password']);
        $errors = $this->validator->validate($dto);

        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return new JsonResponse(['errors' => $errorMessages], 400);
        }

        try {
            $user = $this->userService->register($dto->email, $dto->password);
            
            return new JsonResponse([
                'message' => 'Usuario registrado con éxito',
                'user' => [
                    'id' => $user->getId(),
                    'email' => $user->getEmail()
                ]
            ], 201);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 400);
        }
    }
}