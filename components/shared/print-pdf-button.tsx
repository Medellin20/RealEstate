'use client';

import { Download } from 'lucide-react';

export function PrintPdfButton() {
  return (
    <button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-canal-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-canal-800">
      <Download className="h-4 w-4" /> Download / print als PDF
    </button>
  );
}
