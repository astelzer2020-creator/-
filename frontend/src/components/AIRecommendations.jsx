import { useMemo } from 'react'
import { Lightbulb, AlertTriangle, TrendingDown, Clock, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

const PRIORITY_STYLES = {
  high: { border: 'border-danger/40 bg-danger/10', icon: 'text-danger', badge: 'bg-danger/20 text-danger' },
  medium: { border: 'border-warning/40 bg-warning/10', icon: 'text-warning', badge: 'bg-warning/20 text-warning' },
  low: { border: 'border-brand-primary/40 bg-brand-primary/10', icon: 'text-brand-primary', badge: 'bg-brand-primary/20 text-brand-primary' },
}

const MARKET_BUILD_COST_TLV = 12000

function generateRecommendations({ roi, buildCost, tenantCompensation, projectYears, existingUnits, addedUnits, city }) {
  const recs = []

  if (roi < 15) {
    recs.push({
      id: 'low-roi',
      priority: 'high',
      icon: TrendingDown,
      title: 'תשואה נמוכה — נדרשת התאמה',
      body: `תשואה של ${roi.toFixed(1)}% נמוכה מסף המינימום המומלץ של 15%. שקלו להגדיל את מספר הדירות ב-${Math.ceil((0.15 - roi / 100) * existingUnits * 2)} יחידות נוספות.`,
    })
  }

  if (buildCost > MARKET_BUILD_COST_TLV * 1.1) {
    recs.push({
      id: 'high-build-cost',
      priority: 'high',
      icon: AlertTriangle,
      title: 'עלות בנייה גבוהה מהממוצע',
      body: `עלות הבנייה גבוהה ב-${Math.round(((buildCost - MARKET_BUILD_COST_TLV) / MARKET_BUILD_COST_TLV) * 100)}% מממוצע תל אביב. בחנו קבלנים חלופיים או שיטות בנייה יבשה.`,
    })
  }

  if (tenantCompensation > 3500) {
    recs.push({
      id: 'high-tenant',
      priority: 'medium',
      icon: Users,
      title: 'פיצוי דיירים גבוה',
      body: 'שקלו תוכנית פינוי מואצת עם קצר לוחות זמנים, שיכולה להפחית את עלויות הפיצוי ב-25-30%.',
    })
  }

  if (projectYears > 4) {
    recs.push({
      id: 'long-project',
      priority: 'medium',
      icon: Clock,
      title: 'פרויקט ארוך טווח',
      body: `כל שנה נוספת בפרויקט מקטינה את ה-ROI בכ-3%. שקלו פיצול לשלבים לצמצום תקופת הבנייה הפעילה.`,
    })
  }

  if (addedUnits < existingUnits) {
    recs.push({
      id: 'low-density',
      priority: 'low',
      icon: Lightbulb,
      title: 'צפיפות נמוכה — ניצול חלקי של הזכויות',
      body: 'מספר הדירות החדשות נמוך ממספר הקיימות. בדקו אפשרות להגדיל את הצפיפות בהתאם לתכנית החלה.',
    })
  }

  if (roi >= 25) {
    recs.push({
      id: 'great-roi',
      priority: 'low',
      icon: Lightbulb,
      title: 'פרויקט בעל כדאיות כלכלית טובה',
      body: `תשואה של ${roi.toFixed(1)}% נמצאת מעל הממוצע בשוק. ניתן לשקול כניסה לשלב הביצוע.`,
    })
  }

  return recs
}

export default function AIRecommendations({ roi, buildCost, tenantCompensation, projectYears, existingUnits, addedUnits, city }) {
  const recs = useMemo(
    () => generateRecommendations({ roi, buildCost, tenantCompensation, projectYears, existingUnits, addedUnits, city }),
    [roi, buildCost, tenantCompensation, projectYears, existingUnits, addedUnits, city]
  )

  if (recs.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
        <Lightbulb size={16} className="text-warning" /> המלצות AI
      </h3>
      {recs.map((rec, i) => {
        const style = PRIORITY_STYLES[rec.priority]
        const Icon = rec.icon
        return (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={clsx('rounded-xl border p-3.5', style.border)}
          >
            <div className="flex items-start gap-2.5">
              <Icon size={16} className={clsx('mt-0.5 shrink-0', style.icon)} />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-text-primary">{rec.title}</p>
                  <span className={clsx('text-xs px-1.5 py-0.5 rounded-full font-medium', style.badge)}>
                    {rec.priority === 'high' ? 'גבוהה' : rec.priority === 'medium' ? 'בינונית' : 'נמוכה'}
                  </span>
                </div>
                <p className="text-xs text-text-muted">{rec.body}</p>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
