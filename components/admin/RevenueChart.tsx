import { price, shortDate } from "@/lib/format";

type Point = { day: string; revenue: number; orders: number };

// Une seule série (CA/jour) : pas de légende, le titre la nomme. Survol = tooltip par barre.
export default function RevenueChart({ data }: { data: Point[] }) {
  const max = Math.max(...data.map((d) => Number(d.revenue)), 1);
  const ticks = [max, max / 2, 0];
  return (
    <figure>
      <div className="grid grid-cols-[auto_1fr] gap-3">
        <div className="flex flex-col justify-between h-56 text-[0.65rem] text-stone text-right -mt-1.5">
          {ticks.map((t, i) => (
            <span key={i}>{price(Math.round(t))}</span>
          ))}
        </div>
        <div className="relative h-56">
          {[0, 50, 100].map((p) => (
            <div key={p} className="absolute inset-x-0 border-t border-line" style={{ top: `${p}%` }} />
          ))}
          <div className="absolute inset-0 flex items-end gap-[2px]">
            {data.map((d) => {
              const h = (Number(d.revenue) / max) * 100;
              return (
                <div key={d.day} className="group relative flex-1 h-full flex items-end">
                  <div
                    className="w-full bg-ink rounded-t-[4px] group-hover:bg-stone transition-colors"
                    style={{ height: `${Math.max(h, Number(d.revenue) > 0 ? 1.5 : 0)}%` }}
                  />
                  <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 whitespace-nowrap bg-paper border border-line shadow-sm px-3 py-2 text-xs">
                    <p className="text-stone">{shortDate(d.day)}</p>
                    <p className="font-medium">{price(d.revenue)}</p>
                    <p className="text-stone">{d.orders} commande{d.orders > 1 ? "s" : ""}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex justify-between text-[0.65rem] text-stone mt-2 pl-14">
        <span>{data[0] && shortDate(data[0].day)}</span>
        <span>{data.at(-1) && shortDate(data.at(-1)!.day)}</span>
      </div>
      <figcaption className="sr-only">
        Chiffre d&apos;affaires quotidien : {data.map((d) => `${shortDate(d.day)} ${price(d.revenue)}`).join(", ")}
      </figcaption>
    </figure>
  );
}
