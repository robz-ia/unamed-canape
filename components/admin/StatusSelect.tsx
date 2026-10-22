"use client";

import { useTransition } from "react";
import { adminUpdateOrderStatus } from "@/app/actions";
import { STATUS_LABEL, type OrderStatus } from "@/lib/types";

export default function StatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [pending, start] = useTransition();
  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => start(async () => void (await adminUpdateOrderStatus(orderId, e.target.value as OrderStatus)))}
      className="bg-transparent border border-line px-2 py-1 text-sm disabled:opacity-40"
      aria-label="Statut"
    >
      {(Object.keys(STATUS_LABEL) as OrderStatus[]).map((s) => (
        <option key={s} value={s}>{STATUS_LABEL[s]}</option>
      ))}
    </select>
  );
}
