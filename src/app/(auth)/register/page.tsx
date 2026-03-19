import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold">Criar conta</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Registe-se para reservar e acompanhar chapas.
        </p>
      </header>

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <p className="text-sm text-muted-foreground">
          (Fase 1) UI base criada. O formulário + validação e criação de conta
          entram na Fase 2.
        </p>
        <div className="mt-4 grid gap-3">
          <Button className="h-12 bg-brand hover:bg-brand-dark">Registar</Button>
          <Button asChild variant="secondary" className="h-12">
            <Link href="/login">Já tenho conta</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

