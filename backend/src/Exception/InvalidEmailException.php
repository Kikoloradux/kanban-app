<?php 

declare(strict_types=1);

namespace App\Exception

class InvalidEmailException extends AppException
{
     protected int $statuscode = 400; 
     protected string $errorCode = 'invalid_email';

     public function  __construct(string $email)
     {
          parent::__construct(sprintf('El email "%s" no es válido', $email));
     }


}
