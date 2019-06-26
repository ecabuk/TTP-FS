import json
from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from ttp_fs.utils.json_encoder import CustomJSONEncoder
from market.models import StockTNX, Stock
from user.models import User
from .forms import RegistrationForm, LoginForm


def home_page(request):
    """Unauthorized Home Page"""
    return render(request, 'home.html', {})


def user_login(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        form.request = request
        if form.is_valid():
            login(request, form.user_cache)
            return redirect('user:home')
    else:
        form = LoginForm()
        form.request = request

    return render(request, 'login.html', {
        'form': form
    })


def user_registration(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            new_user = form.save()
            login(request, new_user)
            return redirect('user:home')
    else:
        form = RegistrationForm()

    return render(request, 'register.html', {
        'form': form
    })


def user_logout(request):
    logout(request)

    return redirect('user:login')


@login_required
def user_home(request):
    return render(request, 'user-home.html', {})


@login_required
def portfolio(request):
    user: User = request.user

    return render(request, 'portfolio.html', {
        'jsApp': 'PortfolioApp',
        'page_title': 'Portfolio',
        'user_data_json': json.dumps({
            'balance': user.balance,
            'assets': list(StockTNX.get_assets_for_user(request.user)),
        }, cls=CustomJSONEncoder),
        'symbols_data_json': json.dumps(
            list(Stock.objects.all().values('symbol', 'name')),
            cls=CustomJSONEncoder
        )
    })


@login_required
def transactions(request):
    return render(request, 'transactions.html', {
        'jsApp': 'TransactionsApp',
        'page_title': 'Transactions',
    })
