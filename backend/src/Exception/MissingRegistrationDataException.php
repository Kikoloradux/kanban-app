<?php 

declare(strct_type=1);

namespace App\Exception; 

class MissingRegistrationDataException extends AppException
{
    protected int $statusCode = 400;
    protected string $errorCode = 'missing_registration_data';

    public function __construct()
    {
         parent::__construct('Email y password son requeridos');
    }


}
