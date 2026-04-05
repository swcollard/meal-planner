import { notFound } from 'next/navigation';
import { getPlan, getJournal } from '@/lib/storage';
import { PlanDetail } from '@/components/PlanDetail';
import { JournalSection } from '@/components/JournalSection';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PlanPage({ params }: Props) {
  const { id } = await params;
  const plan = await getPlan(id);
  if (!plan) notFound();

  const journal = await getJournal(id);

  return (
    <div className="space-y-8">
      <PlanDetail plan={plan} />
      <JournalSection
        planId={plan.id}
        weekOf={plan.weekOf}
        initialEntries={journal?.entries ?? []}
      />
    </div>
  );
}
