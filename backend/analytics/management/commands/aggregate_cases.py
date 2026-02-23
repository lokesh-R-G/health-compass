"""
Management command to aggregate approved medical records into regional statistics.

Usage: python manage.py aggregate_cases
"""

from django.core.management.base import BaseCommand
from datetime import datetime, timedelta
from healthiq.mongodb import get_collection, Collections


class Command(BaseCommand):
    help = 'Aggregate approved medical records into regional statistics'

    def add_arguments(self, parser):
        parser.add_argument(
            '--date',
            type=str,
            help='Date to aggregate (YYYY-MM-DD). Defaults to today.',
        )

    def handle(self, *args, **options):
        target_date = options.get('date') or datetime.utcnow().strftime('%Y-%m-%d')
        self.stdout.write(f'Starting aggregation for {target_date}...')
        
        medical_records = get_collection(Collections.MEDICAL_RECORDS)
        regional_stats = get_collection(Collections.REGIONAL_STATS)
        
        # Get all approved records
        pipeline = [
            {
                '$match': {
                    'status': 'approved',
                    'date': target_date
                }
            },
            {
                '$group': {
                    '_id': {
                        'region': '$patient_region',
                        'disease': '$diagnosis'
                    },
                    'total_cases': {'$sum': 1}
                }
            }
        ]
        
        aggregated = list(medical_records.aggregate(pipeline))
        
        # Process each region-disease combination
        regions_updated = set()
        for item in aggregated:
            region = item['_id'].get('region', 'Unknown')
            disease = item['_id'].get('disease', 'Unknown')
            total_cases = item['total_cases']
            
            if not region or region == 'Unknown':
                continue
            
            # Update or insert regional stat
            regional_stats.update_one(
                {
                    'region': region,
                    'disease': disease,
                    'date': target_date
                },
                {
                    '$set': {
                        'total_cases': total_cases,
                        'updated_at': datetime.utcnow()
                    },
                    '$setOnInsert': {
                        'created_at': datetime.utcnow(),
                        'risk_score': 50,
                        'rainfall': 0,
                        'humidity': 50,
                        'ph': 7.0,
                        'tds': 300
                    }
                },
                upsert=True
            )
            
            regions_updated.add(region)
            self.stdout.write(f'  Updated: {region} - {disease}: {total_cases} cases')
        
        # Also create aggregate totals per region
        region_pipeline = [
            {
                '$match': {
                    'status': 'approved',
                    'date': target_date
                }
            },
            {
                '$group': {
                    '_id': '$patient_region',
                    'total_cases': {'$sum': 1}
                }
            }
        ]
        
        region_totals = list(medical_records.aggregate(region_pipeline))
        
        for item in region_totals:
            region = item['_id']
            if not region:
                continue
                
            total_cases = item['total_cases']
            
            # Update region total
            regional_stats.update_one(
                {
                    'region': region,
                    'disease': 'ALL',
                    'date': target_date
                },
                {
                    '$set': {
                        'total_cases': total_cases,
                        'updated_at': datetime.utcnow()
                    },
                    '$setOnInsert': {
                        'created_at': datetime.utcnow(),
                        'risk_score': 50,
                        'rainfall': 0,
                        'humidity': 50,
                        'ph': 7.0,
                        'tds': 300
                    }
                },
                upsert=True
            )
        
        self.stdout.write(self.style.SUCCESS(
            f'Aggregation complete. Updated {len(regions_updated)} regions.'
        ))
