/**
 * מסך טעינה — נעלם ברגע שהסצנה מוכנה (כל הנכסים פרוצדורליים, כך שהטעינה קצרה).
 */
export default function LoadingScreen({ done }) {
  return (
    <div className={`loading ${done ? 'done' : ''}`} aria-hidden={done}>
      <div className="loading-inner">
        <div className="loading-mark" />
        <h1>וילה ברוש</h1>
        <p>מכינים את הסיור…</p>
      </div>
    </div>
  );
}
