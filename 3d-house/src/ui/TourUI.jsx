/**
 * ממשק המשתמש — עברית מלאה, RTL, מינימלי במצב סיור.
 */
import { useCallback, useEffect, useState } from 'react';
import { useTourStore, MODES } from '../stores/tourStore.js';
import { ROOMS } from '../house/plan.js';
import { sounds } from '../utils/audio.js';
import FloorPlan from './FloorPlan.jsx';
import HelpOverlay from './HelpOverlay.jsx';
import MobileControls from './MobileControls.jsx';

function Btn({ label, onClick, active, title, className = '' }) {
  return (
    <button
      type="button"
      className={`ui-btn ${active ? 'active' : ''} ${className}`}
      aria-label={title || label}
      title={title || label}
      onClick={() => { sounds.click(); onClick(); }}
    >
      {label}
    </button>
  );
}

export default function TourUI({ isTouch }) {
  const mode = useTourStore((s) => s.mode);
  const transition = useTourStore((s) => s.transition);
  const night = useTourStore((s) => s.night);
  const muted = useTourStore((s) => s.muted);
  const showMap = useTourStore((s) => s.showMap);
  const showHelp = useTourStore((s) => s.showHelp);
  const guidedOpen = useTourStore((s) => s.guidedOpen);
  const infoPoint = useTourStore((s) => s.infoPoint);
  const nearDoor = useTourStore((s) => s.nearDoor);
  const nearInfo = useTourStore((s) => s.nearInfo);
  const autopilot = useTourStore((s) => s.autopilot);
  const pointerLocked = useTourStore((s) => s.pointerLocked);
  const contextLost = useTourStore((s) => s.contextLost);
  const player = useTourStore((s) => s.player);
  const doors = useTourStore((s) => s.doors);
  const store = useTourStore;

  const [fullscreen, setFullscreen] = useState(false);
  useEffect(() => {
    const onFs = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.().catch(() => {});
  }, []);

  const walking = mode === MODES.WALK;
  const busyOverlay = guidedOpen || infoPoint || showHelp;

  if (contextLost) {
    return (
      <div className="overlay-center">
        <div className="card">
          <h2>התצוגה התלת־ממדית הופסקה</h2>
          <p>הדפדפן שחרר את משאבי הגרפיקה. יש לרענן את העמוד כדי להמשיך.</p>
          <button type="button" className="ui-btn primary" onClick={() => window.location.reload()}>רענון</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`ui-root ${walking ? 'walking' : ''}`}>
      {/* ----- כותרת ופעולה ראשית (תצוגה חיצונית) ----- */}
      {mode === MODES.EXTERIOR && !transition && (
        <div className="hero">
          <h1>וילה ברוש</h1>
          <p>בית פרטי דו־קומתי · 5 חדרים · סיור וירטואלי מלא</p>
          <div className="hero-actions">
            <Btn className="primary big" label="התחל סיור" onClick={() => store.getState().startTour()} />
            <Btn className="big" label="סיור מודרך" onClick={() => store.getState().setGuidedOpen(true)} />
          </div>
          <p className="hint">{isTouch ? 'גררו אצבע כדי להסתובב סביב הבית · צביטה לזום' : 'גררו עם העכבר כדי להסתובב סביב הבית · גלגלת לזום'}</p>
        </div>
      )}

      {/* ----- סרגל כלים עליון ----- */}
      <div className="toolbar" role="toolbar" aria-label="בקרות הסיור">
        {walking && <Btn label="תצוגה חיצונית" title="יציאה לתצוגה חיצונית" onClick={() => store.getState().exitToExterior()} />}
        {walking && <Btn label="סיור מודרך" onClick={() => store.getState().setGuidedOpen(!guidedOpen)} active={guidedOpen} />}
        <Btn label={night ? 'יום' : 'לילה'} title="יום / לילה" onClick={() => store.getState().toggleNight()} />
        {walking && <Btn label="מפה" title="הצגת/הסתרת תוכנית הקומה" onClick={() => store.getState().toggleMap()} active={showMap} />}
        {walking && <Btn label="איפוס מיקום" onClick={() => store.getState().resetPosition()} />}
        <Btn label={fullscreen ? 'צא ממסך מלא' : 'מסך מלא'} onClick={toggleFullscreen} />
        <Btn label={muted ? 'הפעל קול' : 'השתק'} onClick={() => store.getState().toggleMuted()} />
        <Btn label="הוראות" onClick={() => store.getState().setShowHelp(true)} />
      </div>

      {/* ----- חיווי קומה ----- */}
      {walking && (
        <div className="floor-chip" aria-live="polite">
          {player.floor === 0 ? 'קומת קרקע' : 'קומה עליונה'}
        </div>
      )}

      {/* ----- כוונת (עכבר בלבד) ----- */}
      {walking && !isTouch && !busyOverlay && <div className="crosshair" aria-hidden="true" />}

      {/* ----- הנחיית אינטראקציה ----- */}
      {walking && !autopilot && !busyOverlay && (nearDoor || nearInfo) && (
        <div className="prompt">
          {nearDoor
            ? (isTouch ? 'דלת בקרבתך' : `E — ${doors[nearDoor].open ? 'סגירת' : 'פתיחת'} הדלת`)
            : (isTouch ? 'נקודת מידע בקרבתך' : 'E — הצגת מידע')}
        </div>
      )}

      {/* ----- טיסת סיור מודרך ----- */}
      {autopilot && (
        <div className="prompt strong">בדרך אל: {autopilot.name}…</div>
      )}

      {/* ----- מצב עצירה בדסקטופ (אין נעילת עכבר) ----- */}
      {walking && !isTouch && !pointerLocked && !busyOverlay && !autopilot && (
        <div className="overlay-center soft" aria-live="polite">
          <div className="card slim">
            <p>לחצו על התצוגה כדי להמשיך בסיור</p>
            <p className="hint">WASD — תנועה · עכבר — מבט · E — פתיחת דלתות · Esc — שחרור העכבר</p>
          </div>
        </div>
      )}

      {/* ----- תוכנית קומה ----- */}
      {walking && showMap && !busyOverlay && <FloorPlan />}

      {/* ----- חלונית סיור מודרך ----- */}
      {guidedOpen && (
        <div className="overlay-center" role="dialog" aria-label="בחירת חדר לסיור מודרך">
          <div className="card">
            <h2>סיור מודרך</h2>
            <p className="hint">בחרו חדר — המצלמה תוביל אתכם אליו בבטחה.</p>
            {[0, 1].map((floor) => (
              <div key={floor} className="room-group">
                <h3>{floor === 0 ? 'קומת קרקע' : 'קומה עליונה'}</h3>
                <div className="room-list">
                  {ROOMS.filter((r) => r.floor === floor && r.id !== 'corridor2' && r.id !== 'hall').map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className="ui-btn room"
                      onClick={() => { sounds.click(); store.getState().requestGuided(r.id); }}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button type="button" className="ui-btn" onClick={() => store.getState().setGuidedOpen(false)}>סגירה</button>
          </div>
        </div>
      )}

      {/* ----- נקודת מידע ----- */}
      {infoPoint && (
        <div className="overlay-center" role="dialog" aria-label={infoPoint.title}>
          <div className="card">
            <h2>{infoPoint.title}</h2>
            <p>{infoPoint.text}</p>
            <button type="button" className="ui-btn primary" onClick={() => store.getState().setInfoPoint(null)}>סגירה</button>
          </div>
        </div>
      )}

      {showHelp && <HelpOverlay isTouch={isTouch} />}

      {/* ----- בקרי מגע ----- */}
      {walking && isTouch && !busyOverlay && <MobileControls />}
    </div>
  );
}
