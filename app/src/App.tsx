export default function App() {
  const user = window.Telegram?.WebApp.initDataUnsafe.user;

  return (
    <main className="page">
      <h1>Essential Words</h1>
      <p>{user ? `Salom, ${user.first_name}! 👋` : 'Ilova ishlayapti ✅'}</p>
    </main>
  );
}
