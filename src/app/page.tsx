import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6">
        <Image
          src="/pinnacle-logo.svg"
          alt="Pinnacle Power Corp"
          width={520}
          height={300}
          priority
          className="object-contain"
        />
        <p className="text-gray-600 text-lg">Field Operations Management Platform</p>
      </div>
    </main>
  );
}
