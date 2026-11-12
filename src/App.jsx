import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowDownToLine, ArrowLeft, ArrowUpRight, BookOpen, Building2, ChevronRight, CircleHelp, LayoutDashboard, ListFilter, Menu, RefreshCw, Search, Users, X } from 'lucide-react';

const number = (n) => n == null ? '—' : new Intl.NumberFormat('pt-BR').format(n);
const percent = (n) => n == null ? '—' : `${n.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
const periodLabel = (p, short = false) => p ? new Date(`${p}-15T12:00:00`).toLocaleDateString('pt-BR', { month: short ? 'short' : 'long', ...(short ? {} : { year: 'numeric' }) }) : '';
const emptyFilters = { period: '', region: '', unit: '', specialty: '' };

function useRequest(url, retry = 0) {
  const [state, setState] = useState({ url: null, data: null, error: null, loading: true });
  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    setState({ url, data: null, error: null, loading: true });
    fetch(url, { signal: controller.signal }).then(async response => {
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Falha ao carregar os dados.');
      return json;
    }).then(data => setState({ url, data, error: null, loading: false }))
      .catch(error => { if (error.name !== 'AbortError') setState({ url, data: null, error: 'Não foi possível carregar os dados. Verifique se a API está em execução e tente novamente.', loading: false }); });
    return () => controller.abort();
  }, [url, retry]);
  return state.url === url ? state : { data: null, error: null, loading: Boolean(url) };
}

function Metric({ label, value, note, icon: Icon, accent }) {
  return <article className={`metric ${accent ? 'metric-accent' : ''}`}><div className="metric-label">{label}<Icon size={19}/></div><strong>{value}</strong><span>{note}</span></article>;
}

function Stats({ summary }) {
  return <section className="metrics" aria-label="Indicadores do recorte">
    <Metric label="Vagas ofertadas" value={number(summary.offer)} note={`${number(summary.free)} vagas não agendadas`} icon={Building2}/>
    <Metric label="Ocupação da oferta" value={percent(summary.occupancy)} note={`${number(summary.booked)} agendamentos`} icon={Activity} accent/>
    <Metric label="Fila de espera" value={number(summary.queue)} note="Solicitações no fim do mês" icon={Users}/>
    <Metric label="Perda secundária" value={percent(summary.secondary_loss)} note={`${number(summary.absences)} faltas no período`} icon={ArrowUpRight}/>
  </section>;
}

function exportCsv(items, period) {
  const lines = [['Especialidade', 'Oferta', 'Agendamentos', 'Fila', 'Demanda mensal', 'Ocupação (%)', 'Perda primária (%)', 'Perda secundária (%)'], ...items.map(i => [i.name, i.offer, i.booked, i.queue, i.demand, i.occupancy, i.primary_loss, i.secondary_loss])];
  const csv = '\uFEFF' + lines.map(row => row.map(v => `"${String(v ?? '').replaceAll('"', '""')}"`).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = `pulso-demonstrativo-${period}.csv`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Overview({ data, onSelect }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('queue');
  const items = useMemo(() => data.items.filter(i => i.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(search.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase())).sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name, 'pt-BR') : b[sort] - a[sort]), [data.items, search, sort]);
  const peak = Math.max(...data.items.map(i => Math.max(i.offer, i.demand)), 1);
  return <>
    <Stats summary={data.summary}/>
    <div className="overview-grid">
      <section className="panel comparison"><div className="panel-heading"><div><p className="eyebrow">CAPACIDADE E NECESSIDADE</p><h2>Oferta × demanda mensal</h2></div><span className="legend"><i className="dot green"/> Oferta <i className="dot gold"/> Demanda</span></div>
        <div className="comparison-rows">{data.items.slice(0, 5).map(item => <button className="comparison-row" key={item.id} onClick={() => onSelect(item.id)} aria-label={`Detalhar ${item.name}: oferta ${item.offer}, demanda ${item.demand}`}><span>{item.name}</span><div className="bar-pair"><div className="bar green" style={{ width: `${item.offer / peak * 100}%` }}/><div className="bar gold" style={{ width: `${item.demand / peak * 100}%` }}/></div><span className="bar-values">{number(item.offer)} <small>/ {number(item.demand)}</small></span></button>)}</div>
        <p className="chart-note">Até 5 especialidades com maior fila no recorte selecionado.</p>
      </section>
      <section className="insight"><div className="insight-icon"><Activity size={23}/></div><p className="eyebrow">APROVEITAMENTO DA OFERTA</p><h2>Cada vaga conta.</h2><p>No recorte atual, <strong>{number(data.summary.free)} vagas</strong> ficaram sem agendamento.</p><div className="insight-value">{percent(data.summary.primary_loss)}<span>de perda primária</span></div><a href="#/metodologia">Entenda os indicadores <ArrowUpRight size={16}/></a></section>
    </div>
    <section className="panel table-panel"><div className="panel-heading"><div><p className="eyebrow">VISÃO POR PROCEDIMENTO</p><h2>Especialidades <span className="count">{items.length}</span></h2></div><button className="button quiet" disabled={!items.length} onClick={() => exportCsv(items, data.period)}><ArrowDownToLine size={16}/> Exportar CSV</button></div>
      <div className="table-tools"><label className="search"><Search size={17}/><input aria-label="Buscar especialidade" placeholder="Buscar especialidade…" value={search} onChange={e => setSearch(e.target.value)}/></label><label className="sort">Ordenar por <select value={sort} onChange={e => setSort(e.target.value)}><option value="queue">Maior fila</option><option value="offer">Maior oferta</option><option value="name">Nome</option></select></label></div>
      <div className="table-scroll"><table><thead><tr><th>Especialidade</th><th>Oferta</th><th>Agendamentos</th><th>Ocupação</th><th>Fila de espera</th><th>Perda primária</th><th>Perda secundária</th><th><span className="sr-only">Detalhes</span></th></tr></thead><tbody>{items.map(item => <tr key={item.id}><th scope="row"><button className="text-button" onClick={() => onSelect(item.id)}>{item.name}</button></th><td>{number(item.offer)}</td><td>{number(item.booked)}</td><td><div className="occupancy"><span>{percent(item.occupancy)}</span><div><i style={{ width: `${item.occupancy || 0}%` }}/></div></div></td><td className="queue-value">{number(item.queue)}</td><td>{percent(item.primary_loss)}</td><td>{percent(item.secondary_loss)}</td><td><button className="icon-button" aria-label={`Ver detalhes de ${item.name}`} onClick={() => onSelect(item.id)}><ChevronRight size={18}/></button></td></tr>)}</tbody></table></div>
      {!items.length && <div className="empty">Nenhuma especialidade encontrada para esta busca.</div>}
      <div className="table-footer">Valores agregados do período selecionado. <span>Fonte: base fictícia do protótipo</span></div>
    </section>
  </>;
}

function Detail({ data }) {
  const maximum = Math.max(...data.history.flatMap(h => [h.summary.offer, h.summary.booked]), 1);
  return <><Stats summary={data.summary}/><section className="panel"><div className="panel-heading"><div><p className="eyebrow">ACOMPANHAMENTO MENSAL</p><h2>Oferta e agendamentos</h2></div><span className="legend"><i className="dot green"/> Oferta <i className="dot gold"/> Agendamentos</span></div><div className="history-chart">{data.history.map(h => <div className={`history-column ${h.period === data.period ? 'selected' : ''}`} key={h.period}><div className="history-values">{number(h.summary.offer)} <span>/ {number(h.summary.booked)}</span></div><div className="history-bars"><div className="green" style={{ height: `${h.summary.offer / maximum * 100}%` }}/><div className="gold" style={{ height: `${h.summary.booked / maximum * 100}%` }}/></div><span>{periodLabel(h.period, true)}</span></div>)}</div><p className="chart-note">Histórico completo disponível, mantendo os filtros de Geres e unidade executante.</p></section>
    <section className="panel detail-table"><div className="panel-heading"><div><p className="eyebrow">DADOS DO HISTÓRICO</p><h2>Evolução da especialidade</h2></div></div><div className="table-scroll"><table><thead><tr><th>Mês</th><th>Oferta</th><th>Agendamentos</th><th>Faltas</th><th>Demanda mensal</th><th>Fila no fim do mês</th><th>Ocupação</th></tr></thead><tbody>{data.history.map(h => <tr className={h.period === data.period ? 'selected-row' : ''} key={h.period}><th scope="row">{periodLabel(h.period)}</th><td>{number(h.summary.offer)}</td><td>{number(h.summary.booked)}</td><td>{number(h.summary.absences)}</td><td>{number(h.summary.demand)}</td><td>{number(h.summary.queue)}</td><td>{percent(h.summary.occupancy)}</td></tr>)}</tbody></table></div></section></>;
}

function Methodology() {
  return <div className="methodology"><section className="panel prose"><p className="eyebrow">COMO LER O PAINEL</p><h2>Dados claros. Decisões informadas.</h2><p>Esta versão utiliza exclusivamente dados fictícios. Os indicadores descrevem o recorte selecionado e não representam a situação real da rede de saúde.</p><dl><dt>Oferta</dt><dd>Total de vagas disponibilizadas no mês.</dd><dt>Ocupação</dt><dd>Agendamentos ÷ oferta × 100. Mede o preenchimento das vagas, não o comparecimento.</dd><dt>Perda primária</dt><dd>(Oferta − agendamentos) ÷ oferta × 100. São vagas que ficaram sem agendamento.</dd><dt>Perda secundária</dt><dd>Faltas ÷ agendamentos × 100. Na base demonstrativa, todos os agendamentos do mês têm um desfecho registrado.</dd><dt>Demanda mensal</dt><dd>Novas solicitações no mês. Na simulação, cada solicitação pertence a uma única unidade e especialidade.</dd><dt>Fila de espera</dt><dd>Quantidade de solicitações aguardando ao final do mês. É uma fotografia do período; filas de meses diferentes não devem ser somadas.</dd></dl></section><section className="panel prose"><h2>Hipóteses desta versão</h2><p>As taxas são calculadas a partir dos totais do recorte, e não pela média dos percentuais das unidades. Quando o denominador é zero, o painel apresenta “—” (não calculável).</p><p>O vínculo entre demanda, fila e unidade executante existe apenas para permitir os filtros desta simulação. Essa distribuição precisa ser validada para dados reais. As Geres aqui representam a região da unidade executante.</p><p>Os meses são cenários independentes: o histórico permite demonstrar a navegação, mas não simula a evolução de cada paciente.</p><p>Score de risco, diagnósticos assistenciais e previsão para zerar filas entrarão após a definição de suas regras demonstrativas. As cores dos gráficos identificam séries de dados e não classificações clínicas.</p></section></div>;
}

export default function App() {
  const [retry, setRetry] = useState(0);
  const meta = useRequest('/api/metadata', retry);
  const [filters, setFilters] = useState(emptyFilters);
  const [route, setRoute] = useState(location.hash || '#/');
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { const fn = () => { setRoute(location.hash || '#/'); setMenuOpen(false); window.scrollTo(0, 0); }; window.addEventListener('hashchange', fn); return () => window.removeEventListener('hashchange', fn); }, []);
  useEffect(() => { if (meta.data && !filters.period) setFilters(f => ({ ...f, period: meta.data.periods[0] })); }, [meta.data, filters.period]);
  const detailId = route.match(/^#\/especialidades\/(\d+)$/)?.[1];
  const methodology = route === '#/metodologia';
  const validRoute = methodology || detailId || route === '#/' || route === '#';
  const query = new URLSearchParams(Object.entries(filters).filter(([k, v]) => v && !(detailId && k === 'specialty'))).toString();
  const result = useRequest(meta.data && filters.period && !methodology && validRoute ? `${detailId ? `/api/specialties/${detailId}` : '/api/dashboard'}?${query}` : null, retry);
  const error = meta.error || result.error;
  const loading = meta.loading || result.loading;
  const title = methodology ? 'Por trás dos indicadores' : detailId ? (result.data?.specialty?.name || 'Detalhes da especialidade') : 'Visão geral da oferta';
  const units = (meta.data?.units || []).filter(u => !filters.region || String(u.region_id) === filters.region);
  function change(key, value) { setFilters(f => ({ ...f, [key]: value, ...(key === 'region' ? { unit: '' } : {}) })); }
  function selectSpecialty(id) { location.hash = `/especialidades/${id}`; }
  return <div className="app-shell"><button className="mobile-menu icon-button" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button>{menuOpen && <button className="scrim" aria-label="Fechar menu" onClick={() => setMenuOpen(false)}/>}
    <aside className={`sidebar ${menuOpen ? 'open' : ''}`}><a className="brand" href="#/"><span className="brand-mark"><Activity size={28}/></span>pulso<span className="brand-point">.</span></a><p className="brand-subtitle">GESTÃO DA OFERTA AMBULATORIAL</p><div className="workspace"><span className="workspace-icon"><Building2 size={19}/></span><div><strong>Regulação ambulatorial</strong><span>Projeto acadêmico · SES-PE</span></div></div><p className="nav-label">ACOMPANHAMENTO</p><nav><a href="#/" className={!methodology ? 'active' : ''} aria-current={!methodology ? 'page' : undefined}><LayoutDashboard size={19}/> Visão geral <ChevronRight className="nav-arrow" size={16}/></a><a href="#/metodologia" className={methodology ? 'active' : ''} aria-current={methodology ? 'page' : undefined}><BookOpen size={19}/> Metodologia</a></nav><div className="sidebar-bottom"><span className="demo-indicator"/> Ambiente demonstrativo<p>Dados fictícios para explorar<br/>novas possibilidades de gestão.</p><span className="version">PULSO / VERSÃO 0.1</span></div></aside>
    <div className="main-shell"><header className="topbar"><div className="breadcrumb">Gestão ambulatorial <ChevronRight size={14}/> <span>{methodology ? 'Metodologia' : 'Painel de oferta'}</span></div><span className="demo-pill"><span/> Dados fictícios</span></header><main id="main"><div className="page-heading"><div>{detailId && <a className="back" href="#/"><ArrowLeft size={15}/> Voltar à visão geral</a>}<p className="eyebrow">{methodology ? 'TRANSPARÊNCIA' : 'MONITORAMENTO DA REDE'}</p><h1>{title}</h1><p className="subtitle">{methodology ? 'Definições, fórmulas e hipóteses do protótipo.' : detailId ? 'Acompanhe a capacidade e a demanda desta especialidade.' : 'Uma visão integrada das vagas, da demanda e do acesso ao cuidado.'}</p></div>{!methodology && <div className="period-tag"><span>COMPETÊNCIA</span><strong>{periodLabel(filters.period) || 'Carregando…'}</strong></div>}</div>
      {methodology ? <Methodology/> : !validRoute ? <div className="panel empty"><h2>Página não encontrada</h2><a href="#/">Voltar ao painel</a></div> : <>
        {meta.data && <section className="filters" aria-label="Filtros do painel"><div className="filter-icon"><ListFilter size={20}/></div><label>Período<select value={filters.period} onChange={e => change('period', e.target.value)}>{meta.data.periods.map(p => <option key={p} value={p}>{periodLabel(p)}</option>)}</select></label><label>Geres<select value={filters.region} onChange={e => change('region', e.target.value)}><option value="">Todas as Geres</option>{meta.data.regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></label><label>Unidade executante<select value={filters.unit} onChange={e => change('unit', e.target.value)}><option value="">Todas as unidades</option>{units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></label>{!detailId && <label>Especialidade<select value={filters.specialty} onChange={e => change('specialty', e.target.value)}><option value="">Todas as especialidades</option>{meta.data.specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>}<button className="icon-button reset" title="Limpar filtros" aria-label="Limpar filtros" onClick={() => setFilters({ ...emptyFilters, period: meta.data.periods[0] })}><RefreshCw size={17}/></button></section>}
        <div aria-live="polite" aria-busy={loading}>{error ? <div className="panel empty" role="alert"><CircleHelp size={30}/><h2>Não conseguimos carregar o painel</h2><p>{error}</p><button className="button" onClick={() => setRetry(r => r + 1)}>Tentar novamente</button></div> : loading ? <div className="panel empty loading"><Activity size={30}/><p>Consultando a oferta ambulatorial…</p></div> : !result.data?.items.length ? <div className="panel empty"><Search size={28}/><h2>Sem dados neste recorte</h2><p>Ajuste os filtros para consultar outra combinação.</p></div> : detailId ? <Detail data={result.data}/> : <Overview data={result.data} onSelect={selectSpecialty}/>}</div>
      </>}
      <footer className="footer"><span> pulso. <span>Informação para cuidar melhor.</span></span><a href="#/metodologia"><CircleHelp size={14}/> Sobre os dados e cálculos</a></footer>
    </main></div>
  </div>;
}
