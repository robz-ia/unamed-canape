export default function Loading() {
  return (
    <div className="fixed top-0 inset-x-0 z-[60] h-px overflow-hidden">
      <div className="h-full w-1/3 bg-ink animate-[loading_1.2s_cubic-bezier(0.65,0,0.35,1)_infinite]" />
    </div>
  );
}
