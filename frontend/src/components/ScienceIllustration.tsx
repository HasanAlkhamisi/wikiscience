// رسم SVG مضمَّن (ذرّة بمدارات تدور ببطء) بدل ملف صورة خارجي:
// يتلوّن بلون --primary فيعمل في الوضعين النهاري والليلي دون أي ملفات إضافية.
export function ScienceIllustration({ title }: { title?: string }) {
  return (
    <figure className="m-3 mb-2 overflow-hidden rounded-xl border bg-card">
      <svg
        viewBox="0 0 280 150"
        className="block h-auto w-full text-primary"
        role="img"
        aria-label="رسم توضيحي لذرّة"
      >
        <rect width="280" height="150" fill="currentColor" opacity="0.07" />

        {/* نجوم/جسيمات خلفية */}
        <g fill="currentColor" opacity="0.25">
          <circle cx="24" cy="26" r="1.8" />
          <circle cx="58" cy="118" r="1.4" />
          <circle cx="246" cy="34" r="1.8" />
          <circle cx="226" cy="122" r="1.4" />
          <circle cx="86" cy="20" r="1.2" />
          <circle cx="262" cy="84" r="1.2" />
        </g>

        {/* المدارات تدور ببطء (تتوقف لمن يفضّل تقليل الحركة) */}
        <g className="origin-center [transform-box:fill-box] motion-safe:animate-[spin_40s_linear_infinite]">
          {[0, 60, 120].map((angle) => (
            <g key={angle} transform={`rotate(${angle} 140 75)`}>
              <ellipse
                cx="140"
                cy="75"
                rx="62"
                ry="21"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                opacity="0.55"
              />
              <circle cx="202" cy="75" r="4.5" fill="currentColor" />
            </g>
          ))}
        </g>

        {/* النواة */}
        <circle cx="140" cy="75" r="11" fill="currentColor" />
        <circle cx="137" cy="72" r="3.5" fill="white" opacity="0.35" />
      </svg>

      {title && (
        <figcaption className="truncate border-t px-3 py-2 text-center font-serif text-sm font-semibold text-foreground">
          {title}
        </figcaption>
      )}
    </figure>
  )
}
