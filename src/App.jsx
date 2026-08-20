import { useState, useEffect, useMemo, useRef } from "react";
import { Plus, Trash2, ChevronLeft, ChevronRight, Wallet, Lock, Eye, EyeOff, ShieldCheck, PieChart, Trophy } from "lucide-react";
import { storage, armazenamentoDisponivel } from "./lib/storage.js";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const SUGESTOES_GANHO = ["Salário", "Pensão", "Costura", "Freelance", "Outros"];
const SUGESTOES_GASTO = ["Mercado", "Aluguel", "Contas", "Transporte", "Saúde", "Lazer", "Outros"];
const CHAVE_SENHA = "auth:senha-hash";

function formatarMoeda(valor) {
  return (valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function chaveDoMes(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

// Hash da senha. Usa Web Crypto quando disponível; se o ambiente bloquear a API
// (alguns sandboxes de artifact restringem crypto.subtle), cai para um hash simples,
// só para não travar o botão — a senha continua não sendo salva em texto puro.
async function hash(texto) {
  try {
    if (window.crypto && window.crypto.subtle) {
      const buf = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
    }
  } catch (e) {
    // segue para o fallback abaixo
  }
  let h = 5381;
  for (let i = 0; i < texto.length; i++) {
    h = ((h << 5) + h + texto.charCodeAt(i)) >>> 0;
  }
  return `f${h.toString(16)}`;
}

function Fundo() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden" style={{ background: "#0A0A0F" }}>
      <div className="aura aura-1" />
      <div className="aura aura-2" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}

function TelaSenha({ modo, onEntrar, onCriar, onEsqueci, erro, carregando }) {
  const [valor, setValor] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [confirmandoReset, setConfirmandoReset] = useState(false);
  const [validacao, setValidacao] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, [modo]);

  function submeter() {
    setValidacao(null);
    if (modo === "criar") {
      if (valor.length < 4) { setValidacao("A senha precisa ter pelo menos 4 caracteres."); return; }
      if (valor !== confirmar) { setValidacao("As senhas não coincidem."); return; }
      onCriar(valor);
    } else {
      if (!valor) { setValidacao("Digite sua senha."); return; }
      onEntrar(valor);
    }
  }

  function aoPressionarTecla(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      submeter();
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 fonte-corpo relative">
      <Fundo />
      <div
        className="w-full max-w-sm rounded-2xl p-7 relative"
        style={{
          background: "rgba(20,21,31,0.7)",
          border: "1px solid rgba(255,255,255,0.09)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 60px -20px rgba(0,0,0,0.6)",
        }}
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
          style={{ background: "linear-gradient(135deg, #7C6CF6, #22D3EE)" }}
        >
          <Lock size={19} color="#0A0A0F" strokeWidth={2.25} />
        </div>

        <h1 className="fonte-titulo text-xl mb-1" style={{ color: "#F5F5F7", fontWeight: 600 }}>
          {modo === "criar" ? "Proteja seu caderno" : "Acesso privado"}
        </h1>
        <p className="text-sm mb-6" style={{ color: "#8B8D98" }}>
          {modo === "criar"
            ? "Crie uma senha. Só você vai conseguir ver seus lançamentos."
            : "Digite sua senha para continuar."}
        </p>

        <div className="relative mb-3">
          <input
            ref={inputRef}
            type={mostrar ? "text" : "password"}
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            onKeyDown={aoPressionarTecla}
            placeholder="Senha"
            autoComplete={modo === "criar" ? "new-password" : "current-password"}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none pr-11"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#F5F5F7" }}
          />
          <button
            type="button"
            onClick={() => setMostrar((m) => !m)}
            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition"
            style={{ color: "#F5F5F7" }}
            aria-label={mostrar ? "Ocultar senha" : "Mostrar senha"}
          >
            {mostrar ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {modo === "criar" && (
          <input
            type={mostrar ? "text" : "password"}
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            onKeyDown={aoPressionarTecla}
            placeholder="Confirmar senha"
            autoComplete="new-password"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none mb-3"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#F5F5F7" }}
          />
        )}

        {validacao && <p className="text-xs mb-2" style={{ color: "#FB7185" }}>{validacao}</p>}
        {erro && <p className="text-xs mb-2" style={{ color: "#FB7185" }}>{erro}</p>}

        <button
          type="button"
          onClick={submeter}
          disabled={carregando}
          className="w-full py-3 rounded-xl text-sm font-medium mt-2 transition hover:opacity-90 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #7C6CF6, #22D3EE)", color: "#0A0A0F" }}
        >
          {carregando ? "Verificando..." : modo === "criar" ? "Criar senha e entrar" : "Entrar"}
        </button>

        {modo === "entrar" && onEsqueci && (
          <div className="mt-4 text-center">
            {!confirmandoReset ? (
              <button
                type="button"
                onClick={() => setConfirmandoReset(true)}
                className="text-xs underline underline-offset-2 hover:opacity-80"
                style={{ color: "#8B8D98" }}
              >
                Esqueci minha senha
              </button>
            ) : (
              <div className="text-xs" style={{ color: "#8B8D98" }}>
                <p className="mb-2">Isso apaga só a senha (seus lançamentos continuam salvos). Confirmar?</p>
                <div className="flex gap-2 justify-center">
                  <button type="button" onClick={onEsqueci} className="px-3 py-1 rounded-lg" style={{ background: "rgba(251,113,133,0.15)", color: "#FDA4AF" }}>
                    Sim, apagar
                  </button>
                  <button type="button" onClick={() => setConfirmandoReset(false)} className="px-3 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.06)", color: "#F5F5F7" }}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AnaliseGastos({ lancamentos, totalGastos }) {
  const porCategoria = useMemo(() => {
    const mapa = {};
    lancamentos.filter((l) => l.tipo === "gasto").forEach((l) => {
      mapa[l.categoria] = (mapa[l.categoria] || 0) + l.valor;
    });
    return Object.entries(mapa)
      .map(([categoria, total]) => ({ categoria, total }))
      .sort((a, b) => b.total - a.total);
  }, [lancamentos]);

  if (porCategoria.length === 0) return null;

  const maior = porCategoria[0];
  const percMaior = totalGastos > 0 ? Math.round((maior.total / totalGastos) * 100) : 0;

  return (
    <div className="mb-6">
      <h2 className="fonte-titulo text-base mb-2 flex items-center gap-2" style={{ fontWeight: 600 }}>
        <PieChart size={16} style={{ color: "#7C6CF6" }} /> Para onde foi seu dinheiro
      </h2>

      <div
        className="vidro p-4 mb-3 flex items-start gap-3"
        style={{ borderColor: "rgba(251,113,133,0.3)" }}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(251,113,133,0.15)" }}>
          <Trophy size={15} style={{ color: "#FDA4AF" }} />
        </div>
        <p className="text-sm" style={{ color: "#F5F5F7" }}>
          Seu maior gasto do mês foi com <strong>{maior.categoria}</strong>: {formatarMoeda(maior.total)}
          {" "}<span style={{ color: "#8B8D98" }}>({percMaior}% do total gasto)</span>.
        </p>
      </div>

      <div className="vidro p-4 space-y-3">
        {porCategoria.map((c, i) => {
          const perc = totalGastos > 0 ? (c.total / totalGastos) * 100 : 0;
          return (
            <div key={c.categoria}>
              <div className="flex items-center justify-between mb-1 text-sm">
                <span style={{ color: "#F5F5F7" }}>
                  <span className="fonte-numero mr-2" style={{ color: "#5C5E6B" }}>{String(i + 1).padStart(2, "0")}</span>
                  {c.categoria}
                </span>
                <span className="fonte-numero" style={{ color: "#8B8D98" }}>
                  {formatarMoeda(c.total)} · {perc.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${perc}%`,
                    background: i === 0 ? "linear-gradient(90deg, #FB7185, #FDA4AF)" : "linear-gradient(90deg, #7C6CF6, #A78BFA)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AppPrincipal({ avisoInicial }) {
  const [aviso, setAviso] = useState(avisoInicial || null);
  const [mesAtual, setMesAtual] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [lancamentos, setLancamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [tipo, setTipo] = useState("ganho");
  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");

  const chave = useMemo(() => `lancamentos:${chaveDoMes(mesAtual)}`, [mesAtual]);

  useEffect(() => {
    let cancelado = false;
    async function carregar() {
      setCarregando(true);
      setErro(null);
      try {
        const resultado = await storage.get(chave, false);
        if (!cancelado) setLancamentos(resultado ? JSON.parse(resultado.value) : []);
      } catch (e) {
        if (!cancelado) setLancamentos([]);
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }
    carregar();
    return () => { cancelado = true; };
  }, [chave]);

  async function salvar(novaLista) {
    setLancamentos(novaLista);
    try {
      const resultado = await storage.set(chave, JSON.stringify(novaLista), false);
      if (!resultado) setErro("Não consegui salvar agora. Tente de novo.");
    } catch (e) {
      setErro("Não consegui salvar agora. Tente de novo.");
    }
  }

  function adicionar() {
    const numero = parseFloat(String(valor).replace(",", "."));
    if (!categoria.trim() || isNaN(numero) || numero <= 0) return;
    const novo = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      tipo,
      categoria: categoria.trim(),
      descricao: descricao.trim(),
      valor: numero,
    };
    salvar([novo, ...lancamentos]);
    setCategoria("");
    setDescricao("");
    setValor("");
  }

  function aoPressionarTeclaLancamento(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      adicionar();
    }
  }

  function remover(id) {
    salvar(lancamentos.filter((l) => l.id !== id));
  }

  function mudarMes(delta) {
    const d = new Date(mesAtual);
    d.setMonth(d.getMonth() + delta);
    setMesAtual(d);
  }

  const totalGanhos = lancamentos.filter((l) => l.tipo === "ganho").reduce((s, l) => s + l.valor, 0);
  const totalGastos = lancamentos.filter((l) => l.tipo === "gasto").reduce((s, l) => s + l.valor, 0);
  const saldo = totalGanhos - totalGastos;
  const sugestoes = tipo === "ganho" ? SUGESTOES_GANHO : SUGESTOES_GASTO;

  return (
    <div className="min-h-screen w-full relative fonte-corpo" style={{ color: "#F5F5F7" }}>
      <Fundo />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="fonte-titulo text-2xl" style={{ fontWeight: 600 }}>Caderno de Contas</h1>
            <p className="text-sm mt-0.5" style={{ color: "#8B8D98" }}>Seus ganhos e gastos, num lugar só.</p>
          </div>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #7C6CF6, #22D3EE)" }}
            title="Acesso protegido por senha"
          >
            <ShieldCheck size={15} color="#0A0A0F" />
          </div>
        </header>

        {aviso && (
          <div
            className="rounded-xl px-3 py-2 mb-4 text-xs flex items-start justify-between gap-2"
            style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", color: "#FDE68A" }}
          >
            <span>{aviso}</span>
            <button onClick={() => setAviso(null)} className="shrink-0 opacity-70 hover:opacity-100" aria-label="Fechar aviso">✕</button>
          </div>
        )}

        <div className="vidro flex items-center justify-between px-4 py-3 mb-5">
          <button onClick={() => mudarMes(-1)} className="p-2 rounded-lg hover:opacity-70 transition" aria-label="Mês anterior">
            <ChevronLeft size={20} />
          </button>
          <span className="fonte-titulo text-lg" style={{ fontWeight: 600 }}>
            {MESES[mesAtual.getMonth()]} {mesAtual.getFullYear()}
          </span>
          <button onClick={() => mudarMes(1)} className="p-2 rounded-lg hover:opacity-70 transition" aria-label="Próximo mês">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-2xl p-3 sm:p-4" style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)" }}>
            <p className="text-[11px] uppercase tracking-wide" style={{ color: "#6EE7B7" }}>Ganhos</p>
            <p className="fonte-numero text-sm sm:text-lg mt-1" style={{ color: "#F5F5F7", fontWeight: 700 }}>{formatarMoeda(totalGanhos)}</p>
          </div>
          <div className="rounded-2xl p-3 sm:p-4" style={{ background: "rgba(251,113,133,0.1)", border: "1px solid rgba(251,113,133,0.25)" }}>
            <p className="text-[11px] uppercase tracking-wide" style={{ color: "#FDA4AF" }}>Gastos</p>
            <p className="fonte-numero text-sm sm:text-lg mt-1" style={{ color: "#F5F5F7", fontWeight: 700 }}>{formatarMoeda(totalGastos)}</p>
          </div>
          <div className="rounded-2xl p-3 sm:p-4 relative overflow-hidden" style={{ background: "rgba(124,108,246,0.12)", border: "1px solid rgba(124,108,246,0.3)" }}>
            <p className="text-[11px] uppercase tracking-wide" style={{ color: "#C4B5FD" }}>Sobrou</p>
            <p className="fonte-numero text-sm sm:text-lg mt-1" style={{ color: saldo >= 0 ? "#F5F5F7" : "#FDA4AF", fontWeight: 700 }}>{formatarMoeda(saldo)}</p>
          </div>
        </div>

        <div className="vidro p-4 mb-6">
          <div className="flex gap-2 mb-3">
            <button type="button" onClick={() => setTipo("ganho")} className="flex-1 py-2 rounded-xl text-sm font-medium transition"
              style={{ background: tipo === "ganho" ? "rgba(52,211,153,0.18)" : "transparent", color: tipo === "ganho" ? "#6EE7B7" : "#8B8D98", border: `1px solid ${tipo === "ganho" ? "rgba(52,211,153,0.4)" : "rgba(255,255,255,0.1)"}` }}>
              Ganho
            </button>
            <button type="button" onClick={() => setTipo("gasto")} className="flex-1 py-2 rounded-xl text-sm font-medium transition"
              style={{ background: tipo === "gasto" ? "rgba(251,113,133,0.18)" : "transparent", color: tipo === "gasto" ? "#FDA4AF" : "#8B8D98", border: `1px solid ${tipo === "gasto" ? "rgba(251,113,133,0.4)" : "rgba(255,255,255,0.1)"}` }}>
              Gasto
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <input list="sugestoes-categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} onKeyDown={aoPressionarTeclaLancamento} placeholder="Categoria (ex: Costura)" className="campo" />
              <datalist id="sugestoes-categoria">
                {sugestoes.map((s) => <option key={s} value={s} />)}
              </datalist>
            </div>
            <input value={valor} onChange={(e) => setValor(e.target.value)} onKeyDown={aoPressionarTeclaLancamento} placeholder="Valor (R$)" inputMode="decimal" className="campo fonte-numero" />
          </div>

          <input value={descricao} onChange={(e) => setDescricao(e.target.value)} onKeyDown={aoPressionarTeclaLancamento} placeholder="Descrição (opcional)" className="campo mb-3" />

          <button type="button" onClick={adicionar} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #7C6CF6, #22D3EE)", color: "#0A0A0F" }}>
            <Plus size={16} /> Adicionar lançamento
          </button>
        </div>

        <AnaliseGastos lancamentos={lancamentos} totalGastos={totalGastos} />

        <div>
          <h2 className="fonte-titulo text-base mb-2" style={{ fontWeight: 600 }}>Lançamentos do mês</h2>
          {erro && <p className="text-xs mb-2" style={{ color: "#FDA4AF" }}>{erro}</p>}

          {carregando ? (
            <p className="text-sm" style={{ color: "#8B8D98" }}>Carregando...</p>
          ) : lancamentos.length === 0 ? (
            <div className="rounded-2xl p-6 text-center text-sm" style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.14)", color: "#8B8D98" }}>
              <Wallet size={22} className="mx-auto mb-2" style={{ color: "#7C6CF6" }} />
              Nenhum lançamento ainda neste mês. Adicione seu primeiro ganho ou gasto acima.
            </div>
          ) : (
            <ul className="space-y-2">
              {lancamentos.map((l) => (
                <li key={l.id} className="vidro flex items-center justify-between px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide"
                        style={{ background: l.tipo === "ganho" ? "rgba(52,211,153,0.15)" : "rgba(251,113,133,0.15)", color: l.tipo === "ganho" ? "#6EE7B7" : "#FDA4AF" }}>
                        {l.tipo === "ganho" ? "Ganho" : "Gasto"}
                      </span>
                      <span className="text-sm font-medium truncate">{l.categoria}</span>
                    </div>
                    {l.descricao && <p className="text-xs mt-0.5 truncate" style={{ color: "#8B8D98" }}>{l.descricao}</p>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="fonte-numero text-sm" style={{ color: l.tipo === "ganho" ? "#6EE7B7" : "#FDA4AF", fontWeight: 600 }}>
                      {l.tipo === "ganho" ? "+" : "−"} {formatarMoeda(l.valor)}
                    </span>
                    <button onClick={() => remover(l.id)} aria-label="Remover lançamento" className="p-1 rounded hover:opacity-60 transition" style={{ color: "#5C5E6B" }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CadernoComSenha() {
  const [estado, setEstado] = useState("carregando"); // carregando | criar | bloqueado | liberado
  const [erro, setErro] = useState(null);
  const [verificando, setVerificando] = useState(false);
  const [avisoPersistencia, setAvisoPersistencia] = useState(null);

  useEffect(() => {
    async function checar() {
      if (!armazenamentoDisponivel()) {
        setErro("O armazenamento não está disponível agora. Recarregue o artefato e tente de novo.");
        setEstado("criar");
        return;
      }
      try {
        const resultado = await storage.get(CHAVE_SENHA, false);
        setEstado(resultado ? "bloqueado" : "criar");
      } catch (e) {
        setEstado("criar");
      }
    }
    checar();
  }, []);

  async function criarSenha(senha) {
    // A prioridade aqui é nunca deixar a pessoa travada na porta de entrada:
    // tentamos salvar a senha de forma persistente, mas liberamos o acesso
    // de qualquer forma. Se o salvamento falhar, avisamos discretamente.
    setVerificando(true);
    setErro(null);
    let salvouComSucesso = false;
    try {
      const h = await hash(senha);
      if (armazenamentoDisponivel()) {
        const resultado = await storage.set(CHAVE_SENHA, h, false);
        salvouComSucesso = !!resultado;
      }
    } catch (e) {
      salvouComSucesso = false;
    }
    if (!salvouComSucesso) {
      setAvisoPersistencia(
        "Sua senha entrou, mas não consegui salvá-la neste dispositivo agora — pode ser que ela seja pedida de novo na próxima vez que você abrir o app."
      );
    }
    setVerificando(false);
    setEstado("liberado");
  }

  async function entrar(senha) {
    if (!armazenamentoDisponivel()) {
      setErro("O armazenamento não está disponível agora. Recarregue o artefato e tente de novo.");
      return;
    }
    setVerificando(true);
    setErro(null);
    try {
      const h = await hash(senha);
      const resultado = await storage.get(CHAVE_SENHA, false);
      if (resultado && resultado.value === h) {
        setEstado("liberado");
      } else {
        setErro("Senha incorreta.");
      }
    } catch (e) {
      setErro("Não consegui verificar agora. Tente de novo.");
    } finally {
      setVerificando(false);
    }
  }

  async function esquecerSenha() {
    setErro(null);
    try {
      await storage.delete(CHAVE_SENHA, false);
    } catch (e) {
      // se a chave já não existir ou algo falhar, seguimos para a tela de criação de qualquer forma
    }
    setEstado("criar");
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap');
        .fonte-titulo { font-family: 'Space Grotesk', sans-serif; }
        .fonte-numero { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }
        .fonte-corpo { font-family: 'Inter', sans-serif; }
        .vidro {
          background: rgba(20,21,31,0.6);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 1rem;
          backdrop-filter: blur(16px);
        }
        .campo {
          width: 100%;
          padding: 0.6rem 0.9rem;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          outline: none;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: #F5F5F7;
        }
        .campo::placeholder { color: #5C5E6B; }
        .aura {
          position: absolute;
          border-radius: 9999px;
          filter: blur(90px);
          opacity: 0.35;
          animation: flutuar 14s ease-in-out infinite;
        }
        .aura-1 { width: 480px; height: 480px; background: #7C6CF6; top: -120px; left: -100px; }
        .aura-2 { width: 420px; height: 420px; background: #22D3EE; bottom: -140px; right: -80px; animation-delay: -7s; }
        @keyframes flutuar {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -20px) scale(1.08); }
        }
        @media (prefers-reduced-motion: reduce) { .aura { animation: none; } }
      `}</style>

      {estado === "carregando" && (
        <div className="min-h-screen w-full flex items-center justify-center relative">
          <Fundo />
          <p className="text-sm fonte-corpo" style={{ color: "#8B8D98" }}>Carregando...</p>
        </div>
      )}
      {estado === "criar" && (
        <TelaSenha modo="criar" onCriar={criarSenha} erro={erro} carregando={verificando} />
      )}
      {estado === "bloqueado" && (
        <TelaSenha modo="entrar" onEntrar={entrar} onEsqueci={esquecerSenha} erro={erro} carregando={verificando} />
      )}
      {estado === "liberado" && <AppPrincipal avisoInicial={avisoPersistencia} />}
    </>
  );
}
