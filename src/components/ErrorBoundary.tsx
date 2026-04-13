import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-border">
            <CardContent className="pt-8 pb-6 text-center space-y-5">
              {/* Error illustration */}
              <div className="mx-auto w-24 h-24">
                <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <circle cx="48" cy="48" r="44" className="fill-destructive/10 stroke-destructive/30" strokeWidth="2" />
                  <path d="M48 28v24" className="stroke-destructive" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="48" cy="64" r="3" className="fill-destructive" />
                </svg>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">Oups, quelque chose s'est mal passé</h2>
                <p className="text-sm text-muted-foreground">
                  Une erreur inattendue s'est produite. Réessayez ou contactez le support.
                </p>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-3 bg-muted rounded-lg text-left">
                  <p className="text-xs font-mono text-destructive break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    this.setState({ hasError: false, error: undefined });
                    window.location.hash = '';
                    window.location.reload();
                  }}
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recharger la page
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    this.setState({ hasError: false, error: undefined });
                    window.history.pushState({}, '', '/app');
                    window.location.reload();
                  }}
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Retour à l'accueil
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
