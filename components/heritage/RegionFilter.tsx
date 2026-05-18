'use client';

import { Region, REGION_MAP } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface RegionFilterProps {
  selected: Region;
  onChange: (region: Region) => void;
}

const regions: Region[] = [
  'all',
  'seoul',
  'gyeonggi',
  'gangwon',
  'chungcheong',
  'jeolla',
  'gyeongsang',
  'jeju'
];

export default function RegionFilter({ selected, onChange }: RegionFilterProps) {
  const { t } = useTranslation();
  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex gap-2 min-w-max">
        {regions.map((region) => (
          <button
            key={region}
            onClick={() => onChange(region)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
              selected === region
                ? "bg-slate-900 text-white shadow-md"
                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-400 hover:bg-slate-50"
            )}
          >
            {t(`regions.${region}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
