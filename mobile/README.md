# אפליקציית מובייל — התחדשות עירונית

React Native + Expo אפליקציה לסימולטור התחדשות עירונית ישראלי.

## דרישות

- Node.js 18+
- Expo CLI: `npm install -g expo-cli eas-cli`
- Android Studio / Xcode (לסימולטור)

## התקנה

```bash
cd mobile
npm install
```

## הרצה

```bash
# אמולטור אנדרואיד
npm run android

# סימולטור iOS
npm run ios

# דפדפן (Expo Go)
npm start
# סרוק את ה-QR בטלפון עם Expo Go
```

## חיבור לשרת

ערוך `src/utils/api.js`:
- **אמולטור אנדרואיד**: `http://10.0.2.2:3001` (ברירת מחדל)
- **מכשיר פיזי**: `http://IP_של_המחשב_שלך:3001`

## בנייה (APK / IPA)

```bash
# התחבר ל-Expo
eas login

# APK לאנדרואיד (לבדיקה)
eas build --platform android --profile preview

# IPA ל-iOS
eas build --platform ios --profile preview
```

## מבנה הפרויקט

```
mobile/
├── app/
│   ├── _layout.jsx          # Root layout
│   ├── (tabs)/
│   │   ├── index.jsx        # 🏠 לוח בקרה
│   │   ├── projects.jsx     # 🏗️ פרויקטים
│   │   ├── roi.jsx          # 📊 מחשבון ROI
│   │   ├── map.jsx          # 🗺️ מפה
│   │   └── import.jsx       # 📂 יבוא נתונים
│   └── project/[id].jsx     # פרטי פרויקט
└── src/
    ├── screens/             # מסכים
    ├── components/          # קומפוננטות
    ├── store/               # Zustand state
    └── utils/               # API + theme
```
