import { toast } from 'sonner';

export const handleApiError = (error, customMessage = null) => {
  console.error('API Error:', error);

  let message = customMessage || 'Ein Fehler ist aufgetreten';

  if (error?.status) {
    switch (error.status) {
      case 400:
        message = error.data?.message || 'Ungültige Anfrage';
        break;
      case 401:
        message = 'Nicht autorisiert. Bitte melde dich an.';
        // Redirect to login will be handled by auth middleware
        break;
      case 403:
        message = 'Zugriff verweigert';
        break;
      case 404:
        message = 'Nicht gefunden';
        break;
      case 409:
        message = error.data?.message || 'Konflikt - Diese Aktion ist nicht möglich';
        break;
      case 422:
        message = error.data?.message || 'Validierungsfehler';
        if (error.data?.details) {
          console.error('Validation details:', error.data.details);
        }
        break;
      case 500:
        message = 'Serverfehler. Bitte versuche es später erneut.';
        break;
      default:
        message = error.data?.message || error.message || 'Ein Fehler ist aufgetreten';
    }
  } else if (error?.message) {
    message = error.message;
  }

  toast.error(message);
  return message;
};

export const handleNetworkError = (error) => {
  if (error.message === 'Failed to fetch' || error.message === 'Network error') {
    toast.error('Netzwerkfehler. Bitte überprüfe deine Internetverbindung.');
    return 'Netzwerkfehler';
  }
  return handleApiError(error);
};

export const formatValidationErrors = (errors) => {
  if (!errors || !Array.isArray(errors)) return null;
  
  return errors.map(err => ({
    field: err.path || err.param || 'unknown',
    message: err.msg || err.message || 'Invalid value',
  }));
};

