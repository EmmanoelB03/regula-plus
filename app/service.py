"""Consultas e indicadores; taxas são calculadas sobre totais agregados."""
from .database import connect, DEFAULT_DB


def indicators(row):
    value = dict(row)
    offer, booked = value['offer'], value['booked']
    value.update(
        free=offer-booked,
        attended=booked-value['absences'],
        occupancy=round(100*booked/offer, 2) if offer else None,
        primary_loss=round(100*(offer-booked)/offer, 2) if offer else None,
        secondary_loss=round(100*value['absences']/booked, 2) if booked else None,
    )
    return value


def dashboard(filters, path=DEFAULT_DB):
    clauses, args = ['o.period = ?'], [filters['period']]
    for key, column in [('region', 'u.region_id'), ('unit', 'u.id'), ('specialty', 's.id')]:
        if filters.get(key):
            clauses.append(f'{column} = ?')
            args.append(filters[key])
    with connect(path) as db:
        rows = db.execute('''SELECT s.id, s.name, SUM(o.offer) offer,
            SUM(o.booked) booked, SUM(o.absences) absences,
            SUM(o.demand) demand, SUM(o.queue) queue
            FROM observations o JOIN units u ON u.id=o.unit_id
            JOIN specialties s ON s.id=o.specialty_id WHERE ''' + ' AND '.join(clauses) +
            ' GROUP BY s.id ORDER BY queue DESC, s.name', args).fetchall()
    totals = {key: sum(row[key] for row in rows)
              for key in ['offer', 'booked', 'absences', 'demand', 'queue']}
    return {'period': filters['period'], 'summary': indicators(totals),
            'items': [indicators(row) for row in rows], 'demonstration': True}


def metadata(path=DEFAULT_DB):
    with connect(path) as db:
        result = {table: [dict(r) for r in db.execute(f'SELECT * FROM {table} ORDER BY id')]
                  for table in ['regions', 'units', 'specialties']}
        result['periods'] = [r[0] for r in db.execute(
            'SELECT DISTINCT period FROM observations ORDER BY period DESC')]
    return result
