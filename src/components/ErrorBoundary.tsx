import React, { Component, ErrorInfo, ReactNode } from 'react';

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
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      
      try {
        // Check if it's our JSON error from handleFirestoreError
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.operationType) {
            errorMessage = `Database Error: ${parsed.error} during ${parsed.operationType}. Please check your permissions.`;
          }
        }
      } catch (e) {
        // Not a JSON error, use default or raw message
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-[#0a0510] flex items-center justify-center p-8 text-center">
          <div className="bg-white/5 border border-white/10 p-12 rounded-[3rem] max-w-lg backdrop-blur-xl">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <i className="fas fa-exclamation-triangle text-red-500 text-3xl"></i>
            </div>
            <h1 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">Something went wrong</h1>
            <p className="text-gray-400 mb-8 leading-relaxed">
              {errorMessage}
            </p>
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => window.location.reload()}
                className="bg-amber-500 text-slate-950 font-black px-10 py-4 rounded-2xl uppercase text-xs tracking-widest hover:bg-amber-400 transition-all w-full"
              >
                Reload Application
              </button>
              <button 
                onClick={async () => {
                  try {
                    const { auth } = await import('../firebase');
                    const { signOut } = await import('firebase/auth');
                    await signOut(auth);
                    window.location.reload();
                  } catch (e) {
                    window.location.href = '/';
                  }
                }}
                className="bg-white/10 text-white font-black px-10 py-4 rounded-2xl uppercase text-xs tracking-widest hover:bg-white/20 transition-all w-full border border-white/10"
              >
                Sign Out & Reset
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
