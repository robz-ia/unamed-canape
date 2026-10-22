"use client";

import { useEffect } from "react";
import { logProductView } from "@/app/actions";

export default function ViewTracker({ productId }: { productId: string }) {
  useEffect(() => {
    logProductView(productId).catch(() => {});
  }, [productId]);
  return null;
}
