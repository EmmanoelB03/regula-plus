"""Persistência e dados demonstrativos, sem dependências externas."""
import random
import sqlite3
from pathlib import Path

DEFAULT_DB = Path(__file__).resolve().parent.parent / 'data' / 'pulso.sqlite3'


def connect(path=DEFAULT_DB):
    db = sqlite3.connect(path)
    db.row_factory = sqlite3.Row
    db.execute('PRAGMA foreign_keys = ON')
    return db


def initialize(path=DEFAULT_DB):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with connect(path) as db:
        db.executescript('''
        CREATE TABLE IF NOT EXISTS regions (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS units (
          id INTEGER PRIMARY KEY, name TEXT NOT NULL,
          region_id INTEGER NOT NULL REFERENCES regions(id));
        CREATE TABLE IF NOT EXISTS specialties (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS observations (
          period TEXT NOT NULL, unit_id INTEGER NOT NULL REFERENCES units(id),
          specialty_id INTEGER NOT NULL REFERENCES specialties(id),
          offer INTEGER NOT NULL CHECK(offer >= 0),
          booked INTEGER NOT NULL CHECK(booked >= 0 AND booked <= offer),
          absences INTEGER NOT NULL CHECK(absences >= 0 AND absences <= booked),
          demand INTEGER NOT NULL CHECK(demand >= 0),
          queue INTEGER NOT NULL CHECK(queue >= 0),
          PRIMARY KEY(period, unit_id, specialty_id));
        ''')
        if db.execute('SELECT COUNT(*) FROM observations').fetchone()[0]:
            return
        db.executemany('INSERT OR IGNORE INTO regions VALUES (?, ?)', [
            (1, 'I Geres · Recife'), (2, 'IV Geres · Caruaru'), (3, 'VIII Geres · Petrolina')])
        db.executemany('INSERT OR IGNORE INTO units VALUES (?, ?, ?)', [
            (1, 'Centro Metropolitano — fictício', 1), (2, 'Policlínica Capibaribe — fictícia', 1),
            (3, 'Centro Agreste — fictício', 2), (4, 'Policlínica Sertão — fictícia', 3)])
        names = ['Cardiologia', 'Dermatologia', 'Oftalmologia', 'Ortopedia',
                 'Mamografia', 'Colonoscopia', 'Ultrassonografia', 'Neurologia']
        db.executemany('INSERT OR IGNORE INTO specialties VALUES (?, ?)', enumerate(names, 1))
        rng = random.Random(42)
        for month in range(6, 12):
            for unit in range(1, 5):
                for specialty in range(1, 9):
                    offer = rng.randint(60, 260)
                    # Cenários: pressão de demanda, ociosidade e ausência de oferta.
                    demand = round(offer * (1.55 if specialty in (1, 8) else .8))
                    booked = round(offer * rng.uniform(.45 if specialty == 5 else .78,
                                                      .65 if specialty == 5 else .98))
                    queue = round(demand * rng.uniform(1.2, 6))
                    absences = round(booked * rng.uniform(.04, .18))
                    if specialty == 8 and unit == 4:
                        offer, booked, absences = 0, 0, 0
                    db.execute('INSERT INTO observations VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                               (f'2026-{month:02}', unit, specialty, offer, booked, absences, demand, queue))
