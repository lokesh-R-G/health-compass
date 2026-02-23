from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """Custom exception handler for consistent API error responses."""
    response = exception_handler(exc, context)

    if response is not None:
        # Standardize error format
        error_data = {
            'message': 'An error occurred',
            'errors': {}
        }

        if isinstance(response.data, dict):
            if 'detail' in response.data:
                error_data['message'] = str(response.data['detail'])
            else:
                error_data['errors'] = response.data
                if 'non_field_errors' in response.data:
                    error_data['message'] = response.data['non_field_errors'][0]
        elif isinstance(response.data, list):
            error_data['message'] = response.data[0] if response.data else 'An error occurred'

        response.data = error_data

    return response
