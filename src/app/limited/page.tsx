export default function LimitedPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const ip = searchParams.ip;

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      ip: {ip}
    </main>
  );
}
