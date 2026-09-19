import { useState } from 'react';
import { Instagram, MessageCircle } from 'lucide-react';
import { SectionHead } from './SectionHead';
import { BARBERS, type TeamMember } from '@/data';

export default function Barbers() {
  const [activeId, setActiveId] = useState<string | null>(null);

  const col1 = BARBERS.filter((_, i) => i % 3 === 0);
  const col2 = BARBERS.filter((_, i) => i % 3 === 1);
  const col3 = BARBERS.filter((_, i) => i % 3 === 2);

  return (
    <section id="barbery" className="sec border-t border-[var(--border)]">
      <div className="wrap">
        <SectionHead
          eyebrow="Команда"
          title={
            <>
              Кто вас
              <br />
              <span className="gold-text">подстрижёт</span>
            </>
          }
          lead="Наведите на строку — увидите мастера. Напишите в WhatsApp филиала, чтобы записаться к нужному."
        />

        <div className="rv mx-auto flex w-full max-w-5xl select-none flex-col items-start gap-8 md:flex-row md:gap-10 lg:gap-14">
          <div className="flex w-full min-w-0 gap-2 overflow-x-auto pb-1 md:w-auto md:flex-shrink-0 md:gap-3 md:pb-0">
            <div className="flex flex-col gap-2 md:gap-3">
              {col1.map((m) => (
                <PhotoCard key={m.id} member={m} activeId={activeId} onActivate={setActiveId}
                  className="h-[155px] w-[145px] sm:h-[180px] sm:w-[170px] md:h-[215px] md:w-[205px]" />
              ))}
            </div>
            <div className="mt-[58px] flex flex-col gap-2 sm:mt-[68px] md:mt-[84px] md:gap-3">
              {col2.map((m) => (
                <PhotoCard key={m.id} member={m} activeId={activeId} onActivate={setActiveId}
                  className="h-[168px] w-[158px] sm:h-[195px] sm:w-[185px] md:h-[235px] md:w-[225px]" />
              ))}
            </div>
            <div className="mt-[28px] flex flex-col gap-2 sm:mt-[34px] md:mt-[42px] md:gap-3">
              {col3.map((m) => (
                <PhotoCard key={m.id} member={m} activeId={activeId} onActivate={setActiveId}
                  className="h-[160px] w-[150px] sm:h-[186px] sm:w-[176px] md:h-[225px] md:w-[215px]" />
              ))}
            </div>
          </div>

          <div className="flex w-full flex-1 flex-col gap-4 sm:grid sm:grid-cols-2 md:flex md:flex-col md:gap-5 md:pt-2">
            {BARBERS.map((m) => (
              <MemberRow key={m.id} member={m} activeId={activeId} onActivate={setActiveId} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PhotoCard({
  member,
  className,
  activeId,
  onActivate,
}: {
  member: TeamMember;
  className: string;
  activeId: string | null;
  onActivate: (id: string | null) => void;
}) {
  const isActive = activeId === member.id;
  const isDimmed = activeId !== null && !isActive;

  return (
    <div
      className={`relative flex-shrink-0 overflow-hidden rounded-xl ring-1 transition-all duration-300 ${className} ${
        isActive ? 'ring-[var(--gold)]' : 'ring-white/10'
      } ${isDimmed ? 'opacity-60' : 'opacity-100'}`}
      onMouseEnter={() => onActivate(member.id)}
      onMouseLeave={() => onActivate(null)}
    >
      {member.image && (
        <img
          src={member.image}
          alt=""
          className="h-full w-full object-cover object-[center_18%] transition-[filter] duration-500"
          style={{ filter: isActive ? 'grayscale(0) brightness(1)' : 'grayscale(1) brightness(0.77)' }}
        />
      )}
    </div>
  );
}

function MemberRow({
  member,
  activeId,
  onActivate,
}: {
  member: TeamMember;
  activeId: string | null;
  onActivate: (id: string | null) => void;
}) {
  const isActive = activeId === member.id;
  const isDimmed = activeId !== null && !isActive;
  const hasSocial = Boolean(member.social?.instagram ?? member.social?.whatsapp);

  return (
    <div
      className={`transition-opacity duration-300 ${isDimmed ? 'opacity-50' : 'opacity-100'}`}
      onMouseEnter={() => onActivate(member.id)}
      onMouseLeave={() => onActivate(null)}
      onFocus={() => onActivate(member.id)}
      onBlur={() => onActivate(null)}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={`h-3 flex-shrink-0 rounded-[5px] transition-all duration-300 ${
            isActive ? 'w-5 bg-[var(--gold)]' : 'w-4 bg-white/25'
          }`}
        />
        <span
          className={`font-display text-base leading-none tracking-wide uppercase transition-colors duration-300 md:text-[19px] ${
            isActive ? 'text-white' : 'text-white/80'
          }`}
        >
          {member.name}
        </span>

        {hasSocial && (
          <div
            className={`ml-0.5 flex items-center gap-1.5 transition-all duration-200 ${
              isActive ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'
            }`}
          >
            {member.social?.instagram && (
              <SocialLink href={member.social.instagram} label={`Instagram — ${member.name}`}>
                <Instagram size={12} />
              </SocialLink>
            )}
            {member.social?.whatsapp && (
              <SocialLink href={member.social.whatsapp} label={`WhatsApp — ${member.name}`}>
                <MessageCircle size={12} />
              </SocialLink>
            )}
          </div>
        )}
      </div>

      <p className="mt-1.5 pl-[27px] text-[11px] font-medium tracking-[0.2em] text-[var(--muted)] uppercase md:text-[12px]">
        {member.role}
      </p>
    </div>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="rounded p-1 text-[var(--muted)] transition-all duration-150 hover:scale-110 hover:bg-white/10 hover:text-white"
    >
      {children}
    </a>
  );
}
