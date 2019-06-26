from datetime import datetime


def int_sanitizer(val, default=None, min_val=None, max_val=None):
    if type(val) is not int:
        try:
            val = int(val)
        except (TypeError, ValueError):
            return default

        if min_val is not None and val < min_val:
            return default

        if max_val is not None and val > max_val:
            return default

        return val


def date_sanitizer(val, default=None, pattern='%Y-%m-%d'):
    if not val:
        return default

    try:
        return datetime.strptime(val, pattern)
    except ValueError:
        return default
