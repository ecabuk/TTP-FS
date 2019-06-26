from django.http import JsonResponse
from functools import wraps


def ajax_login_required(view):
    @wraps(view)
    def wrapper(request, *args, **kwargs):
        if request.user.is_anonymous:
            return JsonResponse({'error': 'Not logged in.'}, status=401)
        else:
            return view(request, *args, **kwargs)

    return wrapper
