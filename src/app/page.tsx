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
        <hr className="border-foreground/30" />
        <section className="space-y-3">
          <div>
            <p className="text-sm text-foreground/60">Strategy</p>
            <h2 className="text-3xl font-bold">Newest</h2>
          </div>
          <p>Showing current holdings as of Mon Nov 10, 2025 12:10 AM</p>
          <div className="max-w-lg border border-solid border-foreground/10 rounded-xs p-8 space-y-6">
            <div>
              <p className="text-sm text-foreground/60">Allocation</p>
              <h3 className="text-2xl">SPMO mix</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-lg">
              <p className="font-bold">Holdings</p>
              <p className="font-bold">Distributions</p>
              <p>GLD</p>
              <p>25%</p>
              <p>QLD</p>
              <p>75%</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
