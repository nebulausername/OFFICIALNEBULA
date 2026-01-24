import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("🔥 Global Error Caught:", error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-[#0A0C10] text-white p-4">
                    <div className="max-w-md w-full bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center shadow-2xl">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>

                        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent mb-3">
                            Ups, da lief was schief
                        </h1>

                        <p className="text-zinc-400 mb-8 leading-relaxed">
                            Ein unerwarteter Fehler ist aufgetreten. Unsere Technik-Gurus wurden bereits informiert.
                        </p>

                        <Button
                            onClick={this.handleReload}
                            className="w-full h-12 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Seite neu laden
                        </Button>

                        <div className="mt-6 text-xs text-zinc-600 font-mono">
                            Error Code: {this.state.error?.toString().slice(0, 50)}...
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
