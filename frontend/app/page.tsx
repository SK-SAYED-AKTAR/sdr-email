async function getHello() {
  const res = await fetch(`${process.env.BACKEND_URL}/api/hello`, { cache: "no-store" });
  return res.json();
}

export default async function Home() {
  const data = await getHello();
  return (
    <main>
      <h1>{data.message}</h1>
    </main>
  );
}
