import React from 'react';

// Shows a readable message instead of a blank white screen when a page crashes.
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('UI crashed:', error, info?.componentStack);
  }

  resetAndReload = () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('ecobazar_token');
      sessionStorage.clear();
    } catch {
      /* ignore */
    }
    window.location.href = '/';
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#0f172a', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ maxWidth: 520, background: '#fff', borderRadius: 20, padding: 32, boxShadow: '0 20px 50px rgba(0,0,0,.35)' }}>
          <h1 style={{ margin: 0, fontSize: 22, color: '#0f172a' }}>Something went wrong</h1>
          <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.6 }}>
            The page hit an unexpected error. Reloading usually fixes it. If it keeps happening, clear the saved
            login data and try again.
          </p>
          <pre style={{ background: '#f1f5f9', padding: 12, borderRadius: 10, fontSize: 12, color: '#be123c', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {String(this.state.error?.message || this.state.error)}
          </pre>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={() => window.location.reload()} style={{ background: '#059669', color: '#fff', border: 0, borderRadius: 10, padding: '10px 18px', fontWeight: 700, cursor: 'pointer' }}>
              Reload page
            </button>
            <button onClick={this.resetAndReload} style={{ background: '#e2e8f0', color: '#0f172a', border: 0, borderRadius: 10, padding: '10px 18px', fontWeight: 700, cursor: 'pointer' }}>
              Clear saved data &amp; reload
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
