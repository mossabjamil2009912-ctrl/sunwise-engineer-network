# ACTES – سياق المشروع الكامل (Project handoff)

Read this file first when the project is imported from GitHub. It holds every owner decision so work continues from the same point. Technical rules live in `/AGENTS.md`.

## Product
Arabic RTL, mobile-first PWA "ACTES – منصة أكتس لأنظمة الطاقة وحلولها" for customers and engineers (Yemen). No bottom nav bar; a «الرئيسية» button sits in each page header.
Home "/" shows exactly three cards (fit on one phone screen, no scroll): خدمة العملاء → /quote, بوابة المهندسين → /engineers, إستقطاب كفاءات المهندسين → /join. Plus a ⚙️ settings button (service URL + manual app update).

## Visual identity
- Deep navy background, silver neutrals, white, ACTES red primary (oklch ~0.6 0.235 27), bright/royal blue accent. Fonts: Alexandria (headings) + IBM Plex Sans Arabic (body).
- Official white ACTES logo `src/assets/actes-logo-white.png`. Platform name is ACTES (never ACTS) in all UI/titles.
- Glass card styles (glass-red/blue/silver), glow on selected choice, ready-system cards small with silver background, price badge royal-blue gradient with white numbers. Hidden scrollbars everywhere. Next/Back buttons at bottom.

## Quote flow (خدمة العملاء)
- Step 1 title «ما نوع النظام؟»: السكني، التجاري، الصناعي، الزراعي (agricultural uses commercial presets; tags مزارع، آبار، منظومات ري; no «مضخات زراعية»).
- Residential estimate title «تقدير الاستهلاك شهريا؟»: by bill amount, by kWh, or pick a ready-made system. Numeric keyboard opens only on tap; Arabic digits auto-converted.
- Industrial: load kW (quick picks/manual), diesel, bill/kWh. Agricultural: pump HP quick picks 5.5–25, bill, kWh, diesel. Results always from CRM commercial presets; «نهار فقط» removes batteries and their accessories.
- Three suggested tiers in order: أقل استقلالية → موصى به → أكثر استقلالية (small text). No «الخيار المتوازن» labels.
- Tapping a system opens a quote-table popup identical to the CRM Quote Template (header banner, ACTES-Q number, red table on white, wide «الصنف والمواصفات» column, red footer with QR, www.actesgroup.com).
- Below the table three buttons: دراسة PVsyst (name, phone, governorate), مخطط SLD (name, phone), متابعة الشراء. Confirmation text: «فريق أكتس الهندسي يعمل حالياً على دراسة منظومتك وسيرسل لك تقرير المحاكاة عبر الواتساب خلال الساعات القادمة.»
- Purchase flow (from n8n bot "ACTES WhatsApp Bot v35"): step 5 «بيانات الشراء وموقع التسليم» (name, phone, governorate, optional city); step 6 payment: cash on delivery, local transfer (النجم، الامتياز، الكريمي), e-wallets (جيب، جوالي، ون كاش), account name «أكتس لاستيراد أنظمة الطاقة», number 773903901. Never mention العمقي or 773590979. Sales 770229994.

## Engineers portal
- CRM-approved engineers + 12 sample profiles (`src/lib/sample-engineers.ts`) with photos `src/assets/eng/`. Cards half-size, 3 per row.
- Profile: 5–7 services in silver (no red), no academic/skills sections, varied average ratings (3–5), review totals 32–324, projects total 8–26 but only 3 works shown with role-matched unique images (`src/assets/work/`), «الأعمال والمشاريع السابقة», «نطاق العمل:». 6 engineers do installation (HV: وليد، فيصل، عمر — up to 3MWh storage; LV: سامي، عبدالكريم، مروان).
- Visitors can rate (stored on device). Service request: service (from profile's services), name, phone, governorate, project location only.

## Join flow (إستقطاب كفاءات المهندسين)
Order: personal → studies/qualifications → specialty → services (per specialty, + custom) → skills (per service, + custom) → … No category field, no «أنشئ حسابك». Photo text «أضف صورة شخصية مهنية (اختياري)». Programming skills solar-only. Telecom services: برمجة، صيانة، استشارات (monitoring, IoT, diagnostics — no installation/supervision).

## Integrations
- ACTES CRM bridge https://actes-crm.lovable.app/api/public/acts-bridge (GET catalog, POST {action,data}); CRM Arabic errors shown unchanged. Rating links /rate/<token>.
- Secrets (set in Lovable, not in repo): N8N_API_KEY, N8N_BASE_URL, optional ACTES_CRM_BRIDGE.
- Offline PWA for PWABuilder APK at https://sunwise-engineer-network.lovable.app; Capacitor manual updater + `scripts/package-update.mjs`.

## Later decisions (latest state)
- Home cards sit lower: `mt-[clamp(20px,14vh,144px)]`, spaced apart. Screens/data prefetched from home for instant navigation.
- Settings gear opens only after a 5-second long press. Holds: service URL, manual app update, day/night theme toggle, welcome-voice on/off.
- Day (light) theme: `src/lib/theme.ts`; in light mode the logo uses `actes-logo-black.png` (CTES and «لأنظمة الطاقة وحلولها» black), also on the animated splash.
- Welcome voice: `public/acts/audio/welcome.mp3`, calm warm male Arabic broadcaster, text «مَرْحَبًا بِكُمْ فِي مَنَصَّةِ أَكْتِسْ، بَوَّابَتِكُمُ الرَّائِدَةِ لِأَنْظِمَةِ الطَّاقَةِ وَحُلُولِهَا». Plays once per session on open (`src/lib/welcome-voice.ts`), stops on any tap, navigation, leaving the app, calls (visibilitychange/blur/pagehide). Capacitor `mediaPlaybackRequiresUserGesture:false`.
- Quote: commercial/industrial/agricultural first question = 4 small buttons in one row: المبلغ، الاستهلاك kWh، استهلاك الديزل، طلب قياس أحمال (name, phone, location → CRM; message «استلمت إدارة أكتس طلبك وسيتواصل معك فريقنا الفني خلال لحظات»). Second: pump HP (agri) or load kW (industrial), then operating hours with «نهار فقط». Small back arrow beside «متابعة الشراء» closes the quote popup.
- Engineers directory two columns with colors; no «لا تعرف من تختار» button; ratings show average number (never «جديد»); small rating badge. Join screen: colors/identity only; «مهندس خبرة» label (stored value "engineer"); category starts unselected; draft saved `acts-join-draft`.
- Windows EXE: Electron wrapper (portrait window sized to workArea, ACTES icon), packaged with `@electron/packager --electron-version=33.2.1`; download link asset `src/assets/actes-windows-v2.asset.json`.
- PWABuilder package id `com.actes.app`; `public/.well-known/assetlinks.json` present.

## Open items
- n8n is not wired into app code (only used as reference).
