import { AppWindow, Cloud, Fingerprint, KeyRound, LockKeyhole, ShieldCheck, Users } from "lucide-react";
export function IdentityNetwork({ compact = false }: { compact?: boolean }) {
  return <div className={`identity-network ${compact ? "compact" : ""}`} role="img" aria-label="Identity network connecting users, applications and cloud services through authentication and authorization">
    <div className="network-grid"/><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="orbit orbit-three"/>
    <svg className="network-lines" viewBox="0 0 600 550" aria-hidden="true"><defs><linearGradient id="line"><stop stopColor="#20c8e7" stopOpacity=".15"/><stop offset=".5" stopColor="#20c8e7" stopOpacity=".7"/><stop offset="1" stopColor="#20c8e7" stopOpacity=".15"/></linearGradient></defs><g fill="none" stroke="url(#line)" strokeWidth="1"><path d="M300 275 112 125M300 275 468 105M300 275 514 280M300 275 420 448M300 275 148 433M300 275 63 297"/><path strokeDasharray="3 8" d="M112 125 468 105 514 280 420 448 148 433 63 297Z"/></g><g fill="#23c8e7"><circle r="3" cx="205" cy="199"/><circle r="3" cx="410" cy="276"/><circle r="3" cx="220" cy="358"/></g></svg>
    <div className="network-center"><div className="center-icon"><Fingerprint size={66} strokeWidth={1}/></div><strong>IDENTITY</strong><span>THE TRUST LAYER</span></div>
    <div className="network-node node-users"><Users/><span>People</span><small>WORKFORCE & CUSTOMERS</small></div>
    <div className="network-node node-cloud"><Cloud/><span>Cloud</span></div>
    <div className="network-node node-apps"><AppWindow/><span>Applications</span></div>
    <div className="network-node node-lock"><LockKeyhole/><span>Secure access</span></div>
    <div className="network-node node-key"><KeyRound/><span>Authentication</span></div>
    <div className="network-node node-shield"><ShieldCheck/><span>Authorization</span></div>
    <div className="network-badge"><span className="status-dot"/>Connected by identity. Protected by design.</div>
    <span className="network-coordinate">ID / 01 — TRUST ARCHITECTURE</span>
  </div>;
}
