import { Component, useEffect, useState } from 'react';
import Experience from './components/Experience.jsx';
import TourUI from './ui/TourUI.jsx';
import LoadingScreen from './ui/LoadingScreen.jsx';
import { useDeviceCapabilities } from './hooks/useDeviceCapabilities.js';
import { useTourStore } from './stores/tourStore.js';

/** בדיקת תמיכה ב-WebGL לפני עליית הסצנה */
function webglSupported() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="overlay-center opaque">
          <div className="card">
            <h2>משהו השתבש</h2>
            <p>אירעה שגיאה בהצגת הסיור. יש לרענן את העמוד.</p>
            <button type="button" className="ui-btn primary" onClick={() => window.location.reload()}>רענון</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const HELP_KEY = 'villa-tour-help-seen';

export default function App() {
  const caps = useDeviceCapabilities();
  const [ready, setReady] = useState(false);
  const [supported] = useState(webglSupported);

  // מסך הוראות בפעם הראשונה בלבד
  useEffect(() => {
    if (!localStorage.getItem(HELP_KEY)) {
      useTourStore.setState({ showHelp: true });
    }
  }, []);
  const showHelp = useTourStore((s) => s.showHelp);
  useEffect(() => {
    if (!showHelp) localStorage.setItem(HELP_KEY, '1');
  }, [showHelp]);

  if (!supported) {
    return (
      <div className="overlay-center opaque">
        <div className="card">
          <h2>הדפדפן אינו תומך ב-WebGL</h2>
          <p>לצפייה בסיור התלת־ממדי יש להשתמש בדפדפן עדכני (Chrome, Firefox, Safari או Edge) עם האצת חומרה פעילה.</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="app-root">
        <Experience caps={caps} onReady={() => setReady(true)} />
        <TourUI isTouch={caps.isTouch} />
        <LoadingScreen done={ready} />
      </div>
    </ErrorBoundary>
  );
}
