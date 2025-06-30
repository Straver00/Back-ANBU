export function successResponse(data: any, message = 'Operación exitosa') {
  return {
    success: true,
    message,
    data,
  };
}

export function errorResponse(error: any, message = 'Ocurrió un error') {
  return {
    success: false,
    message,
    error,
  };
}
