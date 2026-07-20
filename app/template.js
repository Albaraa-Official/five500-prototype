"use client";
// Re-mounts on every route change → gives a smooth native-style page transition.
export default function Template({ children }) {
  return <div className="page-enter">{children}</div>;
}
