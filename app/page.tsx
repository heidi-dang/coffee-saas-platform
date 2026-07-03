import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="font-bold text-xl">CoffeeQR</span>
          <Link
            href="/cafe/demo-coffee"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Demo Cafe
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            QR Ordering for Your Cafe
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Let your customers scan a QR code, browse the menu, customise their
            order, and pay online or at the counter.
          </p>
          <Link
            href="/cafe/demo-coffee"
            className="inline-flex h-12 items-center justify-center rounded-full bg-foreground text-background px-8 font-medium hover:opacity-90"
          >
            View Demo Cafe
          </Link>
        </section>
        <section className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "QR Menu", desc: "Each table has a unique QR code that opens your cafe's menu." },
            { title: "Live Orders", desc: "Staff dashboard shows incoming orders with status tracking." },
            { title: "Easy Setup", desc: "Add your menu, print QR codes, and start accepting orders." },
          ].map((f) => (
            <div key={f.title} className="border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
