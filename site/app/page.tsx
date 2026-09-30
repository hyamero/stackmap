export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-24">
      <h1 className="text-hero">
        Every layer of your stack, <span className="text-accent">on one map.</span>
      </h1>
      <p className="text-lede mt-6 text-fg-muted">Interactive system diagrams your coding agent writes, as one offline HTML file.</p>
      <section data-theme="dark" className="mt-16 rounded-2xl bg-page p-10 text-fg">
        <p className="text-section">No coordinates. stackmap lays it out.</p>
        <code className="text-code font-mono">npx skills add hyamero/stackmap</code>
      </section>
    </main>
  );
}
