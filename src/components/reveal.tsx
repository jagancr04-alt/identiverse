/** Content remains visible without JavaScript or animation support. */
export function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
