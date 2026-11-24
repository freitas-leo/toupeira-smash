import Link from "next/link";

export function Marca() {
  return (
    <div className="brand">
      <Link href="/" className="brand-icon" aria-label="Página inicial">🐹</Link>
      <div>
        <span className="eyebrow">PROJETO A3 · MATEMÁTICA COMPUTACIONAL</span>
        <h1>Math <em>Mole</em><span aria-hidden="true" className="star">✦</span></h1>
        <p>Uma aventura matemática no jardim encantado · agora com teclado!</p>
      </div>
    </div>
  );
}

export function Ceu() {
  return (
    <div className="sky" aria-hidden="true">
      <span className="sun" />
      <span className="cloud cloud-one" />
      <span className="cloud cloud-two" />
      <span className="hill hill-one" />
      <span className="hill hill-two" />
    </div>
  );
}

export function Flores() {
  return (
    <div className="garden-bottom" aria-hidden="true">
      {["🌸", "🌼", "🍄", "🌷", "🌻"].map((flor) => <span key={flor}>{flor}</span>)}
    </div>
  );
}

export function Toupeira({ ativa }: { ativa: boolean }) {
  return (
    <span className="mole" hidden={!ativa} aria-hidden="true">
      <span className="ear left" />
      <span className="ear right" />
      <span className="face">
        <span className="eye left" />
        <span className="eye right" />
        <span className="snout"><span className="nose" /><span className="mouth" /></span>
        <span className="cheek left" />
        <span className="cheek right" />
      </span>
      <span className="paw left" />
      <span className="paw right" />
    </span>
  );
}
