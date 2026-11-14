# New home screen with three sections

## What you will see
A new first screen (after the logo launch screen) with the ACTS logo at the top and three large cards. Each card has an icon, a title, and a short description in small text:

1. **خدمة العملاء**
   تمكين العملاء من طلب عروض أسعار لمنظومات الطاقة، وطلب الحسابات والتصاميم الهندسية المناسبة لاحتياجاتهم.
   -> opens the quote page.

2. **بوابة المهندسين**
   دليل للمهندسين المعتمدين، يتيح للعملاء استعراض ملفات المهندسين والتعرف على تخصصاتهم ومهاراتهم وخبراتهم وخدماتهم، ثم طلب المهندس المناسب لتنفيذ خدمة هندسية.
   -> opens the engineers directory.

3. **إستقطاب كفاءات المهندسين**
   لطلاب الهندسة والمهندسين الراغبين في تسجيل قدراتهم ومهاراتهم والتقديم للانضمام إلى قاعدة كفاءات ACTS
   -> opens the Join ACTS form.

Same dark style with ACTES red touches. The install-app button stays on this screen.

## Bottom bar
A "الرئيسية" (Home) button is added to the bottom bar next to the other three, so you can always get back to this screen.

## Technical details
- `src/routes/index.tsx` becomes the home screen; the quote wizard moves to a new `src/routes/quote.tsx` (with its own head metadata and hero image).
- `BottomNav.tsx`: add Home tab (`/`), point the quote tab to `/quote`.
- Update any links that pointed to `/` for the quote.
