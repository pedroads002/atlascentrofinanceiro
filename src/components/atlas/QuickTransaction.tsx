import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { isoDate, parseBRL } from "@/lib/format";
import {
  FORMAS_PAGAMENTO,
  TIPO_LABEL,
  useAtlas,
  useUpsert,
  type Transaction,
  type TransactionType,
} from "@/lib/atlas-data";

const TIPOS: TransactionType[] = ["despesa", "receita", "transferencia", "parcelamento", "reembolso"];

export type QuickPrefill = {
  descricao?: string;
  categoriaId?: string;
};

/** quick  -> minimal 3-field capture (valor, descrição, categoria)
 *  ask    -> "Deseja adicionar mais detalhes?"
 *  full   -> every advanced field */
type Step = "quick" | "ask" | "full";

export function QuickTransaction({
  open,
  onOpenChange,
  editing,
  prefill,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: Transaction | null;
  prefill?: QuickPrefill | null;
}) {
  const { data } = useAtlas();
  const upsert = useUpsert("transactions");
  const upsertInstallment = useUpsert("installments");
  const upsertFixed = useUpsert("fixed_expenses");

  const [step, setStep] = useState<Step>("quick");
  const [tipo, setTipo] = useState<TransactionType>("despesa");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [contaId, setContaId] = useState("");
  const [contaDestinoId, setContaDestinoId] = useState("");
  const [cartaoId, setCartaoId] = useState("");
  const [forma, setForma] = useState<string>("pix");
  const [dataTx, setDataTx] = useState(isoDate(new Date()));
  const [observacoes, setObservacoes] = useState("");
  const [pago, setPago] = useState(true);
  const [parcelado, setParcelado] = useState(false);
  const [parcelas, setParcelas] = useState("2");
  const [recorrente, setRecorrente] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setStep("full");
      setTipo(editing.tipo);
      setDescricao(editing.descricao);
      setValor(String(editing.valor).replace(".", ","));
      setCategoriaId(editing.categoria_id ?? "");
      setContaId(editing.conta_id ?? "");
      setContaDestinoId(editing.conta_destino_id ?? "");
      setCartaoId(editing.cartao_id ?? "");
      setForma(editing.forma_pagamento);
      setDataTx(editing.data);
      setObservacoes(editing.observacoes ?? "");
      setPago(editing.pago);
    } else {
      setStep("quick");
      setTipo("despesa");
      setDescricao(prefill?.descricao ?? "");
      setValor("");
      setCategoriaId(prefill?.categoriaId ?? "");
      setContaId(data.accounts[0]?.id ?? "");
      setContaDestinoId("");
      setCartaoId("");
      setForma("pix");
      setDataTx(isoDate(new Date()));
      setObservacoes("");
      setPago(true);
    }
    setParcelado(false);
    setParcelas("2");
    setRecorrente(false);
  }, [open, editing, prefill, data.accounts]);

  const categorias = useMemo(
    () => data.categories.filter((c) => (tipo === "receita" ? c.tipo === "receita" : c.tipo === "despesa")),
    [data.categories, tipo],
  );

  const saving = upsert.isPending || upsertInstallment.isPending || upsertFixed.isPending;

  const validate = () => {
    if (!descricao.trim()) {
      toast.error("Informe uma descrição");
      return false;
    }
    if (parseBRL(valor) <= 0) {
      toast.error("Informe um valor válido");
      return false;
    }
    return true;
  };

  const save = () => {
    const parsed = parseBRL(valor);
    const totalParcelas = Math.max(2, Number(parcelas) || 2);

    upsert.mutate(
      {
        ...(editing ? { id: editing.id } : {}),
        descricao: descricao.trim(),
        valor: parcelado && !editing ? Number((parsed / totalParcelas).toFixed(2)) : parsed,
        tipo: parcelado && !editing ? "parcelamento" : tipo,
        data: dataTx,
        categoria_id: categoriaId || null,
        conta_id: contaId || null,
        conta_destino_id: tipo === "transferencia" ? contaDestinoId || null : null,
        cartao_id: cartaoId || null,
        forma_pagamento: forma,
        observacoes: observacoes.trim() || null,
        pago,
      },
      {
        onSuccess: () => {
          // Advanced options spawn the companion records the modules read from.
          if (!editing && parcelado) {
            upsertInstallment.mutate({
              descricao: descricao.trim(),
              valor_total: parsed,
              valor_parcela: Number((parsed / totalParcelas).toFixed(2)),
              total_parcelas: totalParcelas,
              parcelas_pagas: 1,
              data_inicio: dataTx,
              categoria_id: categoriaId || null,
              conta_id: contaId || null,
              cartao_id: cartaoId || null,
            });
          }
          if (!editing && recorrente) {
            upsertFixed.mutate({
              nome: descricao.trim(),
              valor: parsed,
              dia_vencimento: Number(dataTx.slice(8, 10)) || 1,
              categoria_id: categoriaId || null,
              conta_id: contaId || null,
              cartao_id: cartaoId || null,
              ativo: true,
            });
          }
          toast.success(editing ? "Lançamento atualizado" : "Lançamento registrado");
          onOpenChange(false);
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  const title = editing ? "Editar lançamento" : step === "full" ? "Mais detalhes" : "Novo lançamento";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-auto bottom-0 max-h-[92dvh] w-full max-w-lg translate-y-0 gap-0 overflow-hidden rounded-b-none rounded-t-3xl p-0 duration-300 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 sm:rounded-2xl">
        <DialogHeader className="border-b border-border px-5 py-4 sm:px-6">
          <span className="mx-auto mb-2 h-1 w-10 rounded-full bg-border sm:hidden" />
          <DialogTitle className="text-base font-bold tracking-tight">{title}</DialogTitle>
        </DialogHeader>

        {step === "ask" ? (
          <div className="animate-rise space-y-5 px-5 py-8 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] text-center sm:px-6">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="size-6" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">Deseja adicionar mais detalhes?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Conta, forma de pagamento, data, parcelamento e recorrência.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                className="h-12 flex-1 text-base font-semibold"
                onClick={() => setStep("full")}
              >
                Sim
              </Button>
              <Button
                type="button"
                className="h-12 flex-1 text-base font-semibold"
                disabled={saving}
                onClick={save}
              >
                {saving ? "Salvando..." : "Não, salvar"}
              </Button>
            </div>
          </div>
        ) : (
          <form
            className="max-h-[74dvh] space-y-5 overflow-y-auto px-5 py-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:px-6"
            onSubmit={(event) => {
              event.preventDefault();
              if (!validate()) return;
              if (step === "quick" && !editing) setStep("ask");
              else save();
            }}
          >
            {/* Amount first: the fastest possible path to a saved expense. */}
            <div className="space-y-1.5">
              <Label htmlFor="valor">Valor</Label>
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted/40 px-4 py-3 focus-within:border-primary/60">
                <span className="text-lg font-semibold text-muted-foreground">R$</span>
                <input
                  id="valor"
                  autoFocus
                  inputMode="decimal"
                  placeholder="0,00"
                  className="num w-full bg-transparent text-3xl font-extrabold tracking-tight outline-none placeholder:text-muted-foreground/50"
                  value={valor}
                  onChange={(event) => setValor(event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                className="h-12"
                placeholder="Ex.: Mercado da esquina"
                value={descricao}
                onChange={(event) => setDescricao(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <div className="scroll-x -mx-5 flex gap-2 px-5 sm:mx-0 sm:flex-wrap sm:px-0">
                {categorias.map((category) => {
                  const active = category.id === categoriaId;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setCategoriaId(active ? "" : category.id)}
                      className={cn(
                        "press flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-xs font-semibold transition-colors",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:bg-muted",
                      )}
                    >
                      <span
                        className="size-2 rounded-full"
                        style={{ background: active ? "currentColor" : (category.cor ?? "var(--primary)") }}
                      />
                      {category.nome}
                      {active ? <Check className="size-3.5" /> : null}
                    </button>
                  );
                })}
                {categorias.length === 0 ? (
                  <span className="text-xs text-muted-foreground">Cadastre categorias para classificar.</span>
                ) : null}
              </div>
            </div>

            {step === "full" ? (
              <div className="animate-rise space-y-5 border-t border-border pt-5">
                <div className="scroll-x -mx-5 flex gap-2 px-5 sm:mx-0 sm:flex-wrap sm:px-0">
                  {TIPOS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setTipo(option)}
                      className={cn(
                        "press min-h-11 shrink-0 rounded-full border px-4 text-xs font-semibold transition-colors sm:min-h-9",
                        tipo === option
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {TIPO_LABEL[option]}
                    </button>
                  ))}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Conta</Label>
                    <Select value={contaId} onValueChange={setContaId}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                      <SelectContent>
                        {data.accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>{account.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Forma de pagamento</Label>
                    <Select value={forma} onValueChange={setForma}>
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {FORMAS_PAGAMENTO.map((option) => (
                          <SelectItem key={option} value={option} className="capitalize">{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {tipo === "transferencia" ? (
                  <div className="space-y-1.5">
                    <Label>Conta de destino</Label>
                    <Select value={contaDestinoId} onValueChange={setContaDestinoId}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                      <SelectContent>
                        {data.accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>{account.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Cartão</Label>
                    <Select value={cartaoId} onValueChange={setCartaoId}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Nenhum" /></SelectTrigger>
                      <SelectContent>
                        {data.cards.map((card) => (
                          <SelectItem key={card.id} value={card.id}>{card.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="data">Data</Label>
                    <Input id="data" type="date" className="h-11" value={dataTx} onChange={(event) => setDataTx(event.target.value)} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="obs">Observações</Label>
                  <Textarea
                    id="obs"
                    rows={2}
                    placeholder="Opcional"
                    value={observacoes}
                    onChange={(event) => setObservacoes(event.target.value)}
                  />
                </div>

                {!editing ? (
                  <div className="space-y-3">
                    <label className="flex min-h-11 items-center gap-3 text-sm">
                      <input
                        type="checkbox"
                        checked={parcelado}
                        onChange={(event) => setParcelado(event.target.checked)}
                        className="size-5 accent-[var(--primary)]"
                      />
                      Parcelamento
                    </label>
                    {parcelado ? (
                      <div className="animate-rise space-y-1.5 pl-8">
                        <Label htmlFor="parcelas">Número de parcelas</Label>
                        <Input
                          id="parcelas"
                          type="number"
                          min={2}
                          className="num h-11 max-w-[140px]"
                          value={parcelas}
                          onChange={(event) => setParcelas(event.target.value)}
                        />
                      </div>
                    ) : null}

                    <label className="flex min-h-11 items-center gap-3 text-sm">
                      <input
                        type="checkbox"
                        checked={recorrente}
                        onChange={(event) => setRecorrente(event.target.checked)}
                        className="size-5 accent-[var(--primary)]"
                      />
                      Recorrência mensal (vira despesa fixa)
                    </label>
                  </div>
                ) : null}

                <label className="flex min-h-11 items-center gap-3 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={pago}
                    onChange={(event) => setPago(event.target.checked)}
                    className="size-5 accent-[var(--primary)]"
                  />
                  Já foi pago / recebido
                </label>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setStep("full")}
                className="press flex min-h-11 w-full items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground"
              >
                Mais detalhes <ChevronDown className="size-4" />
              </button>
            )}

            {/* Sticky action row so Salvar is always reachable with one thumb. */}
            <div className="sticky bottom-0 -mx-5 flex items-center gap-2 border-t border-border bg-card/95 px-5 py-3 backdrop-blur sm:static sm:mx-0 sm:justify-end sm:bg-transparent sm:px-0 sm:pb-0">
              <Button
                type="button"
                variant="ghost"
                className="h-12 flex-1 sm:h-10 sm:flex-none"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="h-12 flex-1 text-base font-semibold sm:h-10 sm:flex-none sm:text-sm" disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
