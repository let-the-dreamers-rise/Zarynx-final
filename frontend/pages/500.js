export default function ServerError() {
  return (
    <main className="app-shell">
      <section className="section-card">
        <p className="eyebrow">Execution Fault</p>
        <h1>500</h1>
        <p className="muted-copy">
          The dashboard hit an unexpected error while rendering or fetching evidence.
        </p>
      </section>
    </main>
  );
}
