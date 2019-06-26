import logging
from json.decoder import JSONDecodeError
from decimal import Decimal, InvalidOperation as InvalidDecimalOperation
from django.db import models, transaction
from django.db.models import F, Q, Sum, DecimalField, ExpressionWrapper
from django.conf import settings
from ttp_fs.utils.sanitizers import int_sanitizer, date_sanitizer
from user.models import User
from .exceptions import StockBuyException
import requests

logger = logging.getLogger(__name__)


class Stock(models.Model):
    symbol = models.CharField(max_length=15, unique=True)
    name = models.CharField(max_length=254, null=True)
    enabled = models.BooleanField()

    @classmethod
    def update_all(cls):
        try:
            r = requests.get(settings.IEX_API_BASE + 'ref-data/symbols')
            r.raise_for_status()
        except requests.HTTPError as e:
            logger.error("Http error while fetching symbols. Error: %s" % str(e))
            return False

        new_count = 0
        disabled_count = 0
        updated_ids = []

        try:
            symbols_data = r.json()
        except JSONDecodeError as e:
            logger.error('JSON decode error while fetching sysbols. Error: %s' % str(e))
            return False

        for symbol_data in symbols_data:
            obj, created = cls.objects.update_or_create(
                symbol=symbol_data['symbol'],
                defaults={
                    'name': symbol_data['name'],
                    'enabled': symbol_data['isEnabled']
                }
            )

            if created:
                new_count += 1
            else:
                updated_ids.append(obj.pk)

        # Set disabled if missing on latest data
        if len(updated_ids) > 0:
            disabled_count = cls.objects \
                .filter(~Q(pk__in=updated_ids)) \
                .update(enabled=False)

        logger.info("Symbols updated. New:%d Updated:%d Disabled:%d" % (new_count, len(updated_ids), disabled_count))

        return True

    def get_last_price(self):
        """
        Returns latest price.

        :return: False|Decimal
        """
        try:
            r = requests.get(settings.IEX_API_BASE + 'tops/last?symbols=%s' % self.symbol)
            r.raise_for_status()
        except requests.HTTPError as e:
            logger.error("Http error while retrieving symbol price. Error: %s" % str(e))
            return False

        try:
            data = r.json()
        except JSONDecodeError as e:
            logger.error("JSON decode error while retrieving symbol price. Error: %s" % str(e))
            return False

        try:
            symbol = data[0]

            if str(symbol['symbol']).upper() != self.symbol:
                raise ValueError("Symbol not matched.")
        except (ValueError, IndexError) as e:
            logger.error("Malformed data received while retrieving symbol price. Error: %s" % str(e))
            return False

        try:
            price = Decimal(symbol['price'])
        except (TypeError, InvalidDecimalOperation) as e:
            logger.error("Decimal conversion error while retrieving symbol price. Error: %s" % str(e))
            return False

        return price


class StockTNX(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    qty = models.PositiveIntegerField()
    date = models.DateTimeField(auto_now_add=True)
    price = models.DecimalField(**settings.MONEY_FIELD_ARGS)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'stock']),
        ]

    @classmethod
    def buy_for_user(cls, user: User, stock: Stock, qty: int):
        price = stock.get_last_price()

        if not price:
            logger.error("Buy failed because of a price retrieval error.")
            return False

        total: Decimal = price * Decimal(qty)

        # Update balance atomically
        with transaction.atomic():
            user = User.objects.select_for_update().get(pk=user.pk)
            if user.balance < total:
                raise StockBuyException("Insufficient balance.")

            user.balance -= total
            user.save()

        return cls.objects.create(
            user=user,
            stock=stock,
            qty=qty,
            price=price
        )

    @classmethod
    def get_assets_for_user(cls, user: User, stock: Stock = None):
        query = cls.objects.filter(
            user=user,
        )

        if stock:
            query = query.filter(stock=stock)

        return query.values(
            'stock__name'
        ).annotate(
            count=Sum('qty'),
            avg=Sum(F('qty') * F('price'), output_field=DecimalField()) / Sum('qty', output_field=DecimalField()),
        ).values(
            'count',
            'avg',
            symbol=F('stock__symbol'),
            name=F('stock__name'),
        )

    @classmethod
    def filter_for_user(
            cls,
            user: User,
            per_page: int = 20,
            page: int = 1,
            order_by: str = 'date',
            order: str = 'desc',
            start: str = None,
            end: str = None,
            total_min: int = None,
            total_max: int = None
    ):
        out = cls.objects \
            .filter(user=user) \
            .values('qty',
                    'date',
                    'price',
                    symbol=F('stock__symbol'),
                    name=F('stock__name'),
                    total=ExpressionWrapper(F('price') * F('qty'), output_field=DecimalField()))

        # Start Date
        start_date = date_sanitizer(start)
        if start_date:
            out = out.filter(date__gte=start_date)

        # End Date
        end_date = date_sanitizer(end)
        if end_date:
            out = out.filter(date__lte=end_date)

        # Total Min
        total_min = int_sanitizer(total_min, 0, 0)
        if total_min:
            out = out.filter(total__gte=total_min)

        # Total Max
        total_max = int_sanitizer(total_max, None, 0)
        if total_max:
            out = out.filter(total__lte=total_max)

        # Order & Order by
        if order_by not in ['total', 'qty', 'date']:
            order_by = 'date'
        order_by_f = F(order_by)
        out = out.order_by(order_by_f.asc() if order == 'asc' else order_by_f.desc())

        # Count
        count = out.count()

        # Per Page
        per_page = int_sanitizer(per_page, 20, 1, 100)

        # Page
        page = int_sanitizer(page, 1, 1)

        # Pagination
        offset = per_page * (page - 1)

        return {
            'entries': list(out[offset:offset + per_page]),
            'count': count
        }
