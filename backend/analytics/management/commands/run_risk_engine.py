"""
Management command to run the risk engine.

Usage: python manage.py run_risk_engine
"""

from django.core.management.base import BaseCommand
from analytics.risk_engine import run_risk_engine


class Command(BaseCommand):
    help = 'Run the risk engine to calculate regional risk scores'

    def handle(self, *args, **options):
        self.stdout.write('Starting risk engine...')
        
        results = run_risk_engine()
        
        for result in results:
            self.stdout.write(
                f'  {result["region"]}: Score={result["risk_score"]} '
                f'Level={result["risk_level"]} Anomaly={result["is_anomaly"]}'
            )
        
        self.stdout.write(self.style.SUCCESS(
            f'Risk engine complete. Processed {len(results)} regions.'
        ))
