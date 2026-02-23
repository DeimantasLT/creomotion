import { Loading } from '@/components/Loading';

export default function LoadingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <Loading text="Loading..." size="lg" />
    </div>
  );
}
