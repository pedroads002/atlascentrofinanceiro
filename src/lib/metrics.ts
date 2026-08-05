import type { AtlasSnapshot, Transaction } from "./atlas-data";
import { endOfMonth, isoDate, startOfMonth } from "./format";

export const isIncome = (t: Transaction) => t.tipo === "receita" || t.tipo === "reembolso";
export const isExpense = (t: Transaction) => t.tipo === "despesa" || t.tipo === "parcelamento";

export const signedValue = (t: Transaction) =>
  isIncome(t) ? Number(t.valor) : isExpense(t) ? -Number(t.valor) : 0;

export function inMonth(t: Transaction, reference: Date) {
  const from = isoDate(startOfMonth(reference));
  const to = isoDate(endOfMonth(reference));
  return t.data >= from && t.data <= to;
}

export function monthMetrics(snapshot: AtlasSnapshot, reference: Date) {
  const today = isoDate(new Date());
  const monthTx = snapshot.transactions.filter((t) => inMonth(t, reference));

  const receitas = monthTx.filter(isIncome).reduce((sum, t) => sum + Number(t.valor), 0);
  const despesas = monthTx.filter(isExpense).reduce((sum, t) => sum + Number(t.valor), 0);

  const saldoInicial = snapshot.accounts.reduce((sum, a) => sum + Number(a.saldo_inicial), 0);
  const saldoAtual =
    saldoInicial +
    snapshot.transactions
      .filter((t) => t.pago && t.data <= today)
      .reduce((sum, t) => sum + signedValue(t), 0);

  const pendentesMes = monthTx
    .filter((t) => !t.pago && isExpense(t))
    .reduce((sum, t) => sum + Number(t.valor), 0);

  const custoFixo = snapshot.fixedExpenses
    .filter((f) => f.ativo)
    .reduce((sum, f) => sum + Number(f.valor), 0);

  const gastosDoDia = snapshot.transactions
    .filter((t) => t.data === today && isExpense(t))
    .reduce((sum, t) => sum + Number(t.valor), 0);

  const diaAtual = new Date().getDate();
  const diasNoMes = endOfMonth(reference).getDate();
  const mesCorrente =
    reference.getMonth() === new Date().getMonth() && reference.getFullYear() === new Date().getFullYear();
  const mediaDiaria = mesCorrente && diaAtual > 0 ? despesas / diaAtual : despesas / diasNoMes;
  const projecaoDespesas = mediaDiaria * diasNoMes;
  const projecaoSaldo = saldoAtual - pendentesMes;
  const seContinuarAssim = receitas - projecaoDespesas;

  const meta = Number(snapshot.profile?.meta_economia_mensal ?? 0);
  const economia = receitas - despesas;

  return {
    receitas,
    despesas,
    economia,
    saldoAtual,
    saldoDisponivel: saldoAtual - pendentesMes,
    pendentesMes,
    custoFixo,
    gastosDoDia,
    projecaoSaldo,
    projecaoDespesas,
    seContinuarAssim,
    mediaDiaria,
    meta,
    metaProgresso: meta > 0 ? Math.max(0, Math.min(1, economia / meta)) : 0,
    monthTx,
  };
}

export function rankingPorCategoria(snapshot: AtlasSnapshot, reference: Date) {
  const map = new Map<string, number>();
  snapshot.transactions
    .filter((t) => inMonth(t, reference) && isExpense(t))
    .forEach((t) => {
      const key = t.categoria_id ?? "sem-categoria";
      map.set(key, (map.get(key) ?? 0) + Number(t.valor));
    });

  return [...map.entries()]
    .map(([id, total]) => {
      const category = snapshot.categories.find((c) => c.id === id);
      return { id, nome: category?.nome ?? "Sem categoria", cor: category?.cor ?? "#8E8E93", total };
    })
    .sort((a, b) => b.total - a.total);
}

/** Bills (fixed expenses + unpaid transactions) mapped onto the reference month. */
export function contasDoMes(snapshot: AtlasSnapshot, reference: Date) {
  const diasNoMes = endOfMonth(reference).getDate();
  const fixas = snapshot.fixedExpenses
    .filter((f) => f.ativo)
    .map((f) => {
      const dia = Math.min(f.dia_vencimento, diasNoMes);
      const vencimento = new Date(reference.getFullYear(), reference.getMonth(), dia);
      const pago = snapshot.transactions.some(
        (t) => t.fixed_expense_id === f.id && inMonth(t, reference) && t.pago,
      );
      return {
        id: f.id,
        origem: "fixa" as const,
        descricao: f.nome,
        valor: Number(f.valor),
        data: isoDate(vencimento),
        pago,
      };
    });

  const pendentes = snapshot.transactions
    .filter((t) => inMonth(t, reference) && !t.pago && isExpense(t))
    .map((t) => ({
      id: t.id,
      origem: "transacao" as const,
      descricao: t.descricao,
      valor: Number(t.valor),
      data: t.data,
      pago: false,
    }));

  return [...fixas, ...pendentes].sort((a, b) => a.data.localeCompare(b.data));
}

export function faturaCartao(snapshot: AtlasSnapshot, cardId: string, reference: Date) {
  const atual = snapshot.transactions
    .filter((t) => t.cartao_id === cardId && inMonth(t, reference))
    .reduce((sum, t) => sum + Number(t.valor), 0);

  const next = new Date(reference.getFullYear(), reference.getMonth() + 1, 1);
  const proxima = snapshot.transactions
    .filter((t) => t.cartao_id === cardId && inMonth(t, next))
    .reduce((sum, t) => sum + Number(t.valor), 0);

  const comprometido = snapshot.transactions
    .filter((t) => t.cartao_id === cardId && !t.pago)
    .reduce((sum, t) => sum + Number(t.valor), 0);

  return { atual, proxima, comprometido };
}

export function fluxoMensal(snapshot: AtlasSnapshot, months = 6) {
  const now = new Date();
  return Array.from({ length: months }, (_, index) => {
    const reference = new Date(now.getFullYear(), now.getMonth() - (months - 1 - index), 1);
    const tx = snapshot.transactions.filter((t) => inMonth(t, reference));
    const receitas = tx.filter(isIncome).reduce((sum, t) => sum + Number(t.valor), 0);
    const despesas = tx.filter(isExpense).reduce((sum, t) => sum + Number(t.valor), 0);
    return {
      mes: reference.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
      receitas,
      despesas,
      economia: receitas - despesas,
    };
  });
}