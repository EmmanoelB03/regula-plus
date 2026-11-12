"""Servidor local: python3 -m app.server."""
import argparse
import json
import re
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

from .database import initialize, DEFAULT_DB
from .service import dashboard, metadata

WEB = Path(__file__).resolve().parent.parent / 'dist'


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, db_path=DEFAULT_DB, **kwargs):
        self.db_path = db_path
        super().__init__(*args, directory=str(WEB), **kwargs)

    def send_json(self, status, body):
        data = json.dumps(body, ensure_ascii=False, allow_nan=False).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        url = urlsplit(self.path)
        if not url.path.startswith('/api/'):
            return super().do_GET()
        try:
            if url.path == '/api/metadata':
                return self.send_json(200, metadata(self.db_path))
            match = re.fullmatch(r'/api/specialties/([1-9][0-9]*)', url.path)
            if url.path != '/api/dashboard' and not match:
                return self.send_json(404, {'error': 'Recurso não encontrado.'})
            query = parse_qs(url.query, keep_blank_values=True)
            if set(query) - {'period', 'region', 'unit', 'specialty'}:
                raise ValueError('Filtro desconhecido.')
            if any(len(v) != 1 for v in query.values()):
                raise ValueError('Filtros não podem ser repetidos.')
            filters = {k: v[0] for k, v in query.items()}
            meta = metadata(self.db_path)
            filters.setdefault('period', meta['periods'][0])
            if filters['period'] not in meta['periods']:
                raise ValueError('Período indisponível.')
            for key, table in [('region', 'regions'), ('unit', 'units'), ('specialty', 'specialties')]:
                if filters.get(key) and filters[key] not in {str(r['id']) for r in meta[table]}:
                    raise ValueError(f'Valor inválido para {key}.')
            if match:
                specialty = next((s for s in meta['specialties'] if s['id'] == int(match[1])), None)
                if not specialty:
                    return self.send_json(404, {'error': 'Especialidade não encontrada.'})
                filters['specialty'] = match[1]
                result = dashboard(filters, self.db_path)
                result['specialty'] = specialty
                result['history'] = [dashboard({**filters, 'period': p}, self.db_path)
                                     for p in reversed(meta['periods'])]
            else:
                result = dashboard(filters, self.db_path)
            self.send_json(200, result)
        except ValueError as error:
            self.send_json(400, {'error': str(error)})
        except Exception:
            self.log_error('Erro interno ao consultar dados')
            self.send_json(500, {'error': 'Não foi possível consultar os dados.'})


def main():
    parser = argparse.ArgumentParser(description='Pulso · protótipo local')
    parser.add_argument('--port', type=int, default=8000)
    parser.add_argument('--host', default='127.0.0.1')
    args = parser.parse_args()
    initialize()
    server = ThreadingHTTPServer((args.host, args.port), Handler)
    print(f'Pulso disponível em http://{args.host}:{args.port}', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
