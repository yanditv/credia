export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
      <main className="flex flex-col items-center gap-6 px-4 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Credia
        </h1>
        <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
          Microcréditos para trabajadores informales en Latinoamérica.
          Convierte tus ventas diarias en acceso a crédito.
        </p>
      </main>
    </div>
  );
}
