from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.db.models import Q
from user.models import User
from ttp_fs.utils.json_encoder import CustomJSONEncoder
from ttp_fs.utils.decorators import ajax_login_required
from .models import StockTNX, Stock
from .exceptions import StockBuyException


def _handle_buy_action(request):
    user: User = request.user

    # Check Symbol
    try:
        symbol_str = str(request.POST.get('symbol')).upper()
        if not symbol_str or len(symbol_str) > 15:
            raise ValueError

        stock = Stock.objects.get(symbol=symbol_str)
    except Stock.DoesNotExist:
        return JsonResponse({'error': 'Symbol is not valid.'})
    except ValueError:
        return JsonResponse({'error': 'Symbol error.'})

    # Check Qty
    try:
        qty = int(request.POST.get('qty'))

        if not qty or qty < 1:
            raise ValueError
    except ValueError:
        return JsonResponse({'error': 'Qty error.'})

    # Buy
    try:
        tnx = StockTNX.buy_for_user(user, stock, qty)

        if tnx is False:
            raise StockBuyException('System error. Please try again later.')
    except StockBuyException as e:
        return JsonResponse({'error': str(e)})

    # Update Balance
    user.refresh_from_db()

    return JsonResponse({
        'error': False,
        'balance': user.balance,
        'stockData': StockTNX.get_assets_for_user(user=user, stock=stock)[0],
        'tnxData': {
            'qty': tnx.qty,
            'price': tnx.price
        },
    }, encoder=CustomJSONEncoder)


@ajax_login_required
@require_POST
def action(request):
    # Check type
    action_type = request.POST.get('type')

    if action_type == 'buy':
        return _handle_buy_action(request)
    else:
        return JsonResponse({'error': 'Unknown action type.'})


@ajax_login_required
def transactions(request):
    return JsonResponse({
        'success': True,
        'data': StockTNX.filter_for_user(
            user=request.user,
            **{arg: request.GET.get(arg) for arg in [
                'per_page',
                'page',
                'order_by',
                'order',
                'start',
                'end',
                'total_max',
                'total_min'
            ]}
        )
    }, encoder=CustomJSONEncoder)


@ajax_login_required
def symbols(request):
    return JsonResponse({
        'success': True,
        'data': list(Stock.objects.filter(enabled=True).values('name', 'symbol'))
    })


@ajax_login_required
def symbol_search(request, term):
    return JsonResponse({
        'success': True,
        'data': list(Stock.objects
                     .filter(enabled=True)
                     .filter(Q(symbol__icontains=term) | Q(name__icontains=term))
                     .values('name', 'symbol'))
    })
