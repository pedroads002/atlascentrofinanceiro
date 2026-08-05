import type { AtlasSnapshot } from "./atlas-data";
import { fluxoMensal, monthMetrics, rankingPorCategoria } from "./metrics";
import { isoDate } from "./format";

/** Compact, model-friendly snapshot of the user's finances. */
export function buildAtlasContext(snapshot: AtlasSnapshot) {
  const hoje = new Date();
  const metrics = monthMetrics(snapshot, hoje);
  const categoria = (id: string | null) =>
    snapshot.categories.find((item) => item.id === id)?.nome ?? "Sem categoria";

  return {
    hoje: isoDate(hoje),
    mes_atual: {
      receitas: metrics.receitas,
      despesas: metrics.despesas,
      economia: metrics.economia,
      custo_fixo: metrics.custoFixo,
      saldo_disponivel: metrics.saldoDisponivel,
      projecao_fim_do_mes: metrics.projecao,
    },
    meta_economia_mensal: snapshot.profile?.meta_economia_mensal ?? null,
    categorias_do_mes: rankingPorCategoria(snapshot, hoje).map((item) => ({
      nome: item.nome,
      total: item.total,
    })),
    fluxo_ultimos_meses: fluxoMensal(snapshot, 6),
    contas: snapshot.accounts.map((item) => ({ nome: item.nome, saldo: Number(item.saldo_inicial) })),
    cartoes: snapshot.cards.map((item) => ({
      nome: item.nome,
      limite: Number(item.limite),
      fechamento: item.dia_fechamento,
      vencimento: item.dia_vencimento,
    })),
    despesas_fixas: snapshot.fixed.map((item) => ({
      descricao: item.descricao,
      valor: Number(item.valor),
      dia: item.dia_vencimento,
    })),
    parcelamentos: snapshot.installments.map((item) => ({
      descricao: item.descricao,
      parcela: Number(item.valor_parcela),
      total_parcelas: item.total_parcelas,
    })),
    metas: snapshot.goals.map((item) => ({
      nome: item.nome,
      alvo: Number(item.valor_alvo),
      atual: Number(item.valor_atual),
    })),
    ultimos_lancamentos: snapshot.transactions.slice(0, 40).map((item) => ({
      data: item.data,
      descricao: item.descricao,
      valor: Number(item.valor),
      tipo: item.tipo,
      categoria: categoria(item.categoria_id),
      forma: item.forma_pagamento,
    })),
  };
}