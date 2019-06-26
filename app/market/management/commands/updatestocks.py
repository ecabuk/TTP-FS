from django.core.management.base import BaseCommand
from market.models import Stock


class Command(BaseCommand):
    help = 'Updates symbols'

    def handle(self, *args, **options):
        if Stock.update_all():
            self.stdout.write(self.style.SUCCESS('Successfully updated.'))
        else:
            self.stdout.write(self.style.ERROR('Failed, check logs.'))
