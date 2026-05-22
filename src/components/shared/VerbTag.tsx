const VERB_LABELS: Record<string, string> = {
  plan_my_day:      'plan',
  book_reservation: 'book',
  schedule_meeting: 'schedule',
  errand_request:   'errand',
  remind_me:        'remind',
}

interface Props { verb: string }

export function VerbTag({ verb }: Props) {
  return (
    <span className="text-[10px] font-mono text-accent uppercase tracking-widest opacity-70">
      {VERB_LABELS[verb] ?? verb}
    </span>
  )
}
