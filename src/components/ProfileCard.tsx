import type { Profile } from '../types'
import { PROFILE_PROMPT } from '../data/prompts'
import { CopyPromptButton } from './CopyPromptButton'

/** Ficha del perfil leído de LinkedIn: el contexto contra el que se puntúa el encaje. */
export function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <div className="profile">
      <div className="profile__head">
        <div>
          <h2 className="profile__name">{profile.nombre}</h2>
          <p className="profile__titular">{profile.titular}</p>
          <p className="muted">{profile.ubicacion}</p>
        </div>
        <div className="profile__actions">
          <span className="muted profile__fecha">Leído de LinkedIn · {profile.fecha_lectura}</span>
          <CopyPromptButton text={PROFILE_PROMPT} label="Copiar prompt para actualizar perfil" />
        </div>
      </div>

      <p className="profile__resumen">{profile.resumen}</p>

      {/* Stack: tokens cortos -> chips */}
      <section className="profile__block">
        <h3>Stack principal</h3>
        <div className="profile__tags">
          {profile.stack_principal.map((it) => (
            <span key={it} className="tag" style={{ '--tag-color': 'var(--brand)' } as React.CSSProperties}>
              {it}
            </span>
          ))}
        </div>
      </section>

      {/* Descripciones largas -> listas */}
      <div className="profile__grid">
        <BulletSection title="Accesibilidad" items={profile.accesibilidad} accent="#c2185b" />
        <BulletSection title="IA / Herramientas" items={profile.ia_herramientas} accent="#7b1fa2" />
        <BulletSection title="Carencias declaradas" items={profile.carencias} accent="#c0392b" muted />
      </div>

      <section className="profile__block">
        <h3>Experiencia</h3>
        <ul className="profile__exp">
          {profile.experiencia.map((e) => (
            <li key={`${e.empresa}-${e.periodo}`}>
              <div className="profile__exp-head">
                <strong>{e.rol}</strong> · {e.empresa}
                <span className="muted">
                  {' '}
                  — {e.periodo}
                  {e.modalidad ? ` · ${e.modalidad}` : ''}
                </span>
              </div>
              {e.detalle && <div className="muted">{e.detalle}</div>}
            </li>
          ))}
        </ul>
      </section>

      <section className="profile__block">
        <h3>Formación</h3>
        <ul className="profile__list">
          {profile.formacion.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function BulletSection({
  title,
  items,
  accent,
  muted = false,
}: {
  title: string
  items: string[]
  accent: string
  muted?: boolean
}) {
  if (items.length === 0) return null
  return (
    <section className="profile__block">
      <h3 style={{ color: accent }}>{title}</h3>
      <ul className={`profile__list${muted ? ' profile__list--muted' : ''}`}>
        {items.map((it) => (
          <li key={it}>{it}</li>
        ))}
      </ul>
    </section>
  )
}
