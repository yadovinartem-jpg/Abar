export default function Footer() {
  const team = [
    { name: "force", role: "архитектура" },
    { name: "химблок", role: "интерфейс" },
    { name: "мой верова", role: "звук" },
    { name: "тёма", role: "продукт" },
  ];

  return (
    <footer className="pt-12 pb-4 border-t border-border/40 mt-12">
      <div className="text-xs text-muted-foreground space-y-3">
        <div className="font-semibold text-foreground/70">Разработано на React + Vite + TailwindCSS</div>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {team.map((t) => (
            <span key={t.name} className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-brand/60 inline-block" />
              <span className="text-foreground/70 font-medium">{t.name}</span>
              <span>·</span>
              <span>{t.role}</span>
            </span>
          ))}
        </div>
        <div className="opacity-60">© {new Date().getFullYear()} абар. Личный проект.</div>
      </div>
    </footer>
  );
}
