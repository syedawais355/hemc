"use client";

import { useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { key: "popular", label: "Most popular" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "name", label: "Name A–Z" },
];

export function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const params = useSearchParams();

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = new URLSearchParams(params.toString());
    next.set("sort", e.target.value);
    router.push(`/shop?${next.toString()}`);
  };

  return (
    <select className="select" value={value} onChange={onChange} aria-label="Sort products">
      {OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
    </select>
  );
}
