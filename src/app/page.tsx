export default function Home() {
  return (
    <div className="p-8 flex justify-center">
      <main className="max-w-5xl w-full space-y-6">
        <section className="space-y-3 mt-16">
          <h1 className="text-4xl font-extrabold">Livefol.io</h1>
          <p className="text-xl">
            Forward test your Testfol.io strategy. Enter a link to a tactical
            allocation backtester.
          </p>
          <form className="flex items-center gap-4 max-w-md">
            <input
              placeholder="https://testfol.io/tactical?s=..."
              className="w-full h-10 px-3 rounded-xs border border-solid border-foreground/10 outline-none focus:border-accent"
            />
            <button className="h-10 px-3 rounded-xs bg-foreground text-background hover:bg-foreground/80 font-medium transition-colors">
              Submit
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
