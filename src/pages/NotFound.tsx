import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="bg-panel rounded-2xl p-12 text-center border border-border/50">
      <div className="text-6xl font-extrabold text-brand mb-3">404</div>
      <div className="text-lg font-semibold mb-2">Страница не найдена</div>
      <p className="text-sm text-muted-foreground mb-5">Похоже, эта дорожка не существует.</p>
      <Link to="/my-music" className="inline-block px-5 py-2 rounded-full bg-brand hover:bg-brand/90 text-white text-sm font-semibold">
        Вернуться в Мою музыку
      </Link>
    </div>
  );
}
