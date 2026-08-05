import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
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

export function QuickTransaction({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: Transaction | null;
}) {
  const { data } = useAtlas();
  const upsert = useUpsert("transactions");

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

  useEffect(() => {
    if (!open) return;
    if (editing) {
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
      setTipo("despesa");
      setDescricao("");
      setValor("");
      setCategoriaId("");
      setContaId(data.accounts[0]?.id ?? "");
      setContaDestinoId("");
      setCartaoId("");
      setForma("pix");
      setDataTx(isoDate(new Date()));
      setObservacoes("");
      setPago(true);
    }
  }, [open, editing, data.accounts]);

  const categorias = useMemo(
    () => data.categories.filter((c) => (tipo === "receita" ? c.tipo === "receita" : c.tipo === "despesa")),
    [data.categories, tipo],
  );

  const submit = () => {
    const parsed = parseBRL(valor);
    if (!descricao.trim()) return toast.error("Informe uma descrição");
    if (parsed <= 0) return toast.error("Informe um valor válido");

    upsert.mutate(
      {
        ...(editing ? { id: editing.id } : {}),
        descricao: descricao.trim(),
        valor: parsed,
        tipo,
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
          toast.success(editing ? "Lançamento atualizado" : "Lançamento registrado");
          onOpenChange(false);
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="text-base font-bold tracking-tight">
            {editing ? "Editar lançamento" : "Novo lançamento"}
          </DialogTitle>
        </DialogHeader>

        <form
          className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <div className="flex flex-wrap gap-2">
            {TIPOS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTipo(option)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  tipo === option
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                {TIPO_LABEL[option]}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
            <div className="space-y-1.5">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                autoFocus
                placeholder="Ex.: Mercado da esquina"
                value={descricao}
                onChange={(event) => setDescricao(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                inputMode="decimal"
                placeholder="0,00"
                className="num font-semibold"
                value={valor}
                onChange={(event) => setValor(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Select value={categoriaId} onValueChange={setCategoriaId}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {categorias.map((category) => (
                    <SelectItem key={category.id} value={category.id}>{category.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Conta</Label>
              <Select value={contaId} onValueChange={setContaId}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {data.accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>{account.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {tipo === "transferencia" ? (
            <div className="space-y-1.5">
              <Label>Conta de destino</Label>
              <Select value={contaDestinoId} onValueChange={setContaDestinoId}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {data.accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>{account.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Forma de pagamento</Label>
              <Select value={forma} onValueChange={setForma}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FORMAS_PAGAMENTO.map((option) => (
                    <SelectItem key={option} value={option} className="capitalize">{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Cartão</Label>
              <Select value={cartaoId} onValueChange={setCartaoId}>
                <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                <SelectContent>
                  {data.cards.map((card) => (
                    <SelectItem key={card.id} value={card.id}>{card.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="data">Data</Label>
              <Input id="data" type="date" value={dataTx} onChange={(event) => setDataTx(event.target.value)} />
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

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={pago}
              onChange={(event) => setPago(event.target.checked)}
              className="size-4 accent-[var(--primary)]"
            />
            Já foi pago / recebido
          </label>

          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={upsert.isPending}>
              {upsert.isPending ? "Salvando..." : "Salvar lançamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}