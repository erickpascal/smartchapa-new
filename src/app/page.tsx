import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-4 py-8">
      <header className="rounded-xl bg-brand px-5 py-6 text-white">
        <h1 className="text-2xl font-semibold leading-tight">SmartChapa</h1>
        <p className="mt-2 text-sm/6 text-white/90">
          Reservas, rastreamento ao vivo e pagamentos móveis.
        </p>
      </header>

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold">Entrar como</h2>
        <div className="mt-4 grid gap-3">
          <Button asChild className="h-12 justify-between bg-brand hover:bg-brand-dark">
            <Link href="/login">Passageiro</Link>
          </Button>
          <Button asChild variant="secondary" className="h-12 justify-between">
            <Link href="/driver">Motorista</Link>
          </Button>
          <Button asChild variant="secondary" className="h-12 justify-between">
            <Link href="/operator/dashboard">Operador</Link>
          </Button>
          <Button asChild variant="secondary" className="h-12 justify-between">
            <Link href="/admin/dashboard">Admin</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
