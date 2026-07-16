/**
 * מסך הוראות — מותאם למכשיר (מקלדת/עכבר או מגע).
 */
import { useTourStore } from '../stores/tourStore.js';

export default function HelpOverlay({ isTouch }) {
  const setShowHelp = useTourStore((s) => s.setShowHelp);
  return (
    <div className="overlay-center" role="dialog" aria-label="הוראות הפעלה">
      <div className="card">
        <h2>איך מסיירים?</h2>
        {isTouch ? (
          <ul className="help-list">
            <li><b>הליכה</b> — ג'ויסטיק בצד שמאל של המסך</li>
            <li><b>מבט</b> — גרירת אצבע בצד ימין</li>
            <li><b>ריצה</b> — דחיפת הג'ויסטיק עד הקצה</li>
            <li><b>דלתות ומידע</b> — כפתור "פתח דלת" / "מידע" שמופיע כשמתקרבים</li>
            <li><b>מעבר בין קומות</b> — עולים במדרגות ממש כמו בבית</li>
          </ul>
        ) : (
          <ul className="help-list">
            <li><b>W A S D</b> — הליכה</li>
            <li><b>עכבר</b> — סיבוב המבט (לחיצה על התצוגה נועלת את הסמן)</li>
            <li><b>Shift</b> — ריצה</li>
            <li><b>E</b> — פתיחת דלתות והצגת מידע</li>
            <li><b>חצים</b> — מבט באמצעות המקלדת</li>
            <li><b>Esc</b> — שחרור העכבר</li>
          </ul>
        )}
        <p className="hint">אפשר לחזור להוראות בכל רגע דרך כפתור "הוראות".</p>
        <button type="button" className="ui-btn primary" onClick={() => setShowHelp(false)}>הבנתי, בואו נסייר</button>
      </div>
    </div>
  );
}
