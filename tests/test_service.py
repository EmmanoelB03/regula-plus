import tempfile
import unittest
from pathlib import Path

from app.database import connect, initialize
from app.service import dashboard, indicators, metadata


class IndicatorTests(unittest.TestCase):
    def test_occupancy_and_losses_have_distinct_denominators(self):
        result = indicators(dict(offer=100, booked=80, absences=8, demand=120, queue=500))
        self.assertEqual((result['occupancy'], result['primary_loss'], result['secondary_loss']),
                         (80, 20, 10))
        self.assertEqual((result['free'], result['attended']), (20, 72))

    def test_zero_denominators_are_not_reported_as_zero_percent(self):
        result = indicators(dict(offer=0, booked=0, absences=0, demand=10, queue=40))
        for key in ['occupancy', 'primary_loss', 'secondary_loss']:
            self.assertIsNone(result[key])


class DatabaseTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.path = Path(self.directory.name) / 'test.sqlite3'
        initialize(self.path)

    def tearDown(self):
        self.directory.cleanup()

    def test_initialization_preserves_existing_records(self):
        with connect(self.path) as db:
            db.execute("UPDATE observations SET queue=12345 WHERE period='2026-11' AND unit_id=1 AND specialty_id=1")
        initialize(self.path)
        result = dashboard({'period': '2026-11', 'unit': '1', 'specialty': '1'}, self.path)
        self.assertEqual(result['summary']['queue'], 12345)
        with connect(self.path) as db:
            self.assertEqual(db.execute('SELECT COUNT(*) FROM observations').fetchone()[0], 192)

    def test_region_total_matches_its_units_and_uses_weighted_rate(self):
        region = dashboard({'period': '2026-11', 'region': '1'}, self.path)['summary']
        units = [dashboard({'period': '2026-11', 'unit': str(i)}, self.path)['summary'] for i in (1, 2)]
        for key in ['offer', 'booked', 'queue', 'demand', 'absences']:
            self.assertEqual(region[key], sum(u[key] for u in units))
        self.assertEqual(region['occupancy'], round(region['booked']/region['offer']*100, 2))

    def test_incompatible_filters_produce_empty_result(self):
        result = dashboard({'period': '2026-11', 'region': '1', 'unit': '4'}, self.path)
        self.assertEqual(result['items'], [])
        self.assertIsNone(result['summary']['occupancy'])

    def test_combined_specialty_and_unit_filters_preserve_zero_offer(self):
        result = dashboard({'period': '2026-11', 'specialty': '8', 'unit': '4'}, self.path)
        self.assertEqual(len(result['items']), 1)
        self.assertEqual(result['summary']['offer'], 0)
        self.assertGreater(result['summary']['queue'], 0)
        self.assertIsNone(result['summary']['occupancy'])

    def test_metadata_and_database_constraints(self):
        self.assertEqual(len(metadata(self.path)['periods']), 6)
        import sqlite3
        with connect(self.path) as db:
            with self.assertRaises(sqlite3.IntegrityError):
                db.execute('UPDATE observations SET booked=offer+1')


if __name__ == '__main__':
    unittest.main()
