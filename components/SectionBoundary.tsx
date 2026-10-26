"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode; name: string };
type State = { failed: boolean };

export class SectionBoundary extends Component<Props, State> {
  state: State = { failed: false };
  static getDerivedStateFromError(): State { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error(`Section ${this.props.name} failed`, error, info); }
  render() {
    if (this.state.failed) return <div role="alert" className="mx-auto my-12 max-w-xl rounded-3xl border border-rose-500/30 bg-slate-900/90 p-8 text-center backdrop-blur-xl shadow-soft"><h2 className="font-heading text-xl font-bold text-white">{this.props.name} is temporarily unavailable</h2><p className="mt-2 text-slate-300">Your other sections still work. Try refreshing this page.</p><button className="mt-5 rounded-full bg-emerald-500 px-6 py-2.5 text-slate-950 font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400" onClick={() => this.setState({ failed: false })}>Try again</button></div>;
    return this.props.children;
  }
}
