// Pure-CSS launch splash. Lives in the root layout (which never remounts on
// client-side navigation), so it plays once per full load and fades itself out.
export default function Splash() {
  return (
    <div className="splash" aria-hidden>
      <div className="splash-glow" />
      <div className="splash-inner">
        <img src="/logo-transparent.png" alt="FIVE 500 — فايف هاندرد" className="splash-logo" />
        <div className="splash-bar"><span /></div>
      </div>
    </div>
  );
}
