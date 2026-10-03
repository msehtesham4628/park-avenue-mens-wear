import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw } from 'lucide-react';
import { ParkAvenueLogo } from '../brand/ParkAvenueLogo';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Park Avenue] Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.href = '/shop';
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white text-[#111827] flex items-center justify-center p-6">
          <div className="max-w-md w-full border border-gray-200 bg-[#F9F9F8] p-8 sm:p-12 text-center flex flex-col items-center shadow-xl">
            <ParkAvenueLogo variant="mark" size="md" className="w-12 h-12 mb-6" />
            <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#936B34] mb-3 block font-semibold">
              PARK AVENUE ATELIER
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#111827] uppercase tracking-wider mb-4 font-light">
              RECOVERING SARTORIAL CATALOGUE
            </h2>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-mono leading-relaxed mb-8">
              We encountered an unexpected presentation error while rendering this garment. Please return to the collections salon.
            </p>
            <button
              onClick={this.handleReload}
              className="px-8 py-3.5 bg-[#111827] text-white hover:bg-[#936B34] text-xs font-mono uppercase tracking-[0.2em] font-semibold transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RETURN TO COLLECTIONS</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
