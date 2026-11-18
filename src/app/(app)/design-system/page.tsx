import type { Metadata } from "next";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ICON_NAMES, Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TextField } from "@/components/ui/TextField";

import styles from "./design-system.module.css";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

const PALETTE = [
  { name: "Forest green", token: "--brand-forest", hex: "#244C3B", text: "var(--brand-ivory)", use: "Primary actions, headlines" },
  { name: "Warm ivory", token: "--brand-ivory", hex: "#F5F0E5", text: "var(--brand-charcoal)", use: "Background" },
  { name: "Muted sage", token: "--brand-sage", hex: "#A9BBA5", text: "var(--brand-charcoal)", use: "Calm fills; not for text" },
  { name: "Earthy terracotta", token: "--brand-terracotta", hex: "#D68A68", text: "var(--brand-charcoal)", use: "Urgent fills; not for text" },
  { name: "Charcoal", token: "--brand-charcoal", hex: "#292D28", text: "var(--brand-ivory)", use: "Body text" },
  { name: "Soft wheat", token: "--brand-wheat", hex: "#D7C995", text: "var(--brand-charcoal)", use: "Notices, highlights" },
];

const TYPE_SCALE = [
  { label: "Display XL · Cormorant Garamond 600", token: "--text-display-xl", font: "display", sample: "Good evening, Ada." },
  { label: "Display L · Cormorant Garamond 600", token: "--text-display-lg", font: "display", sample: "Heading out?" },
  { label: "Display M · Cormorant Garamond 600", token: "--text-display-md", font: "display", sample: "Trusted contacts" },
  { label: "Body L · DM Sans 400", token: "--text-lg", font: "sans", sample: "Tell us where you're going and when you expect to arrive." },
  { label: "Body · DM Sans 400", token: "--text-md", font: "sans", sample: "We check in with you when you should have arrived." },
  { label: "Small · DM Sans 400", token: "--text-sm", font: "sans", sample: "2 of 3 contacts have accepted and can receive alerts." },
];

const SPACES = ["--space-1", "--space-2", "--space-3", "--space-4", "--space-5", "--space-6", "--space-7", "--space-8", "--space-9", "--space-10"];

/**
 * Living reference for the SafeReturn design system: tokens and components
 * as they really render. Not linked from the navigation; open /design-system.
 */
export default function DesignSystemPage() {
  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>Reference</p>
        <h1 className={styles.h1}>Design system</h1>
        <p className={styles.muted}>
          Colours, type, components and spacing as they render in the app. Values live in{" "}
          <code>src/styles/tokens.css</code>.
        </p>
      </header>

      <section className={styles.section} aria-labelledby="ds-colour">
        <SectionHeading id="ds-colour" title="Colour" />
        <div className={styles.swatches}>
          {PALETTE.map((c) => (
            <div key={c.token} className={styles.swatch}>
              <div className={styles.chip} style={{ background: `var(${c.token})` }} />
              <div className={styles.swatchText}>
                <p className={styles.swatchName}>{c.name}</p>
                <p>
                  {c.hex} · <code>{c.token}</code>
                </p>
                <p className={styles.muted}>{c.use}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="ds-type">
        <SectionHeading id="ds-type" title="Typography" />
        <div>
          {TYPE_SCALE.map((t) => (
            <div key={t.token} className={styles.typeRow}>
              <p className={styles.typeMeta}>
                {t.label} · <code>{t.token}</code>
              </p>
              <p
                style={{
                  fontFamily: t.font === "display" ? "var(--font-family-display)" : "var(--font-family-sans)",
                  fontSize: `var(${t.token})`,
                  fontWeight: t.font === "display" ? 600 : 400,
                  lineHeight: t.font === "display" ? 1.1 : 1.5,
                }}
              >
                {t.sample}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="ds-buttons">
        <SectionHeading id="ds-buttons" title="Buttons" />
        <div className={styles.stack}>
          <Button iconEnd="arrowRight">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="urgent" iconStart="help">
            Need help
          </Button>
          <Button variant="quiet">Quiet action</Button>
          <Button size="lg" fullWidth>
            Large, full width
          </Button>
          <Button disabled>Disabled</Button>
          <div className={styles.forestPanel}>
            <Button variant="inverse" fullWidth iconEnd="arrowRight">
              Inverse, on forest green
            </Button>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="ds-inputs">
        <SectionHeading id="ds-inputs" title="Input fields" />
        <div className={styles.stack}>
          <TextField label="Where are you going?" placeholder="e.g. Home, Yaba" icon="pin" />
          <TextField label="Note for your contacts" hint="Only shown if they are alerted." optional />
          <TextField label="Phone number" type="tel" inputMode="tel" defaultValue="0803 123 45" error="Enter a full Nigerian mobile number, e.g. 0803 123 4567." />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="ds-cards">
        <SectionHeading id="ds-cards" title="Cards" />
        <div className={styles.cards}>
          <Card>
            <p className={styles.swatchName}>Plain</p>
            <p className={styles.muted}>Default surface with a hairline border.</p>
          </Card>
          <Card tone="sage">
            <p className={styles.swatchName}>Sage</p>
            <p>Calm, reassuring information.</p>
          </Card>
          <Card tone="wheat">
            <p className={styles.swatchName}>Wheat</p>
            <p>Notices and highlights.</p>
          </Card>
          <Card tone="forest">
            <p className={styles.swatchName}>Forest</p>
            <p>The main call to action.</p>
          </Card>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="ds-badges">
        <SectionHeading id="ds-badges" title="Status badges and avatars" />
        <div className={styles.row}>
          <Badge tone="sage" dot>
            On the way
          </Badge>
          <Badge tone="wheat" dot>
            Check-in due
          </Badge>
          <Badge tone="terracotta" dot>
            Contacts notified
          </Badge>
          <Badge tone="forest">Active</Badge>
          <Badge>Outline</Badge>
        </div>
        <div className={styles.row}>
          <Avatar name="Tunde Bakare" />
          <Avatar name="Chioma Okafor" />
          <Avatar name="Mrs Adeyemi" />
          <Avatar name="Ada" size="sm" />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="ds-icons">
        <SectionHeading id="ds-icons" title="Icons" />
        <div className={styles.icons}>
          {ICON_NAMES.map((name) => (
            <div key={name} className={styles.iconCell}>
              <Icon name={name} />
              <span className={styles.iconName}>{name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="ds-space">
        <SectionHeading id="ds-space" title="Spacing" />
        <div className={styles.stack}>
          {SPACES.map((s) => (
            <div key={s} className={styles.spaceRow}>
              <div className={styles.spaceBar} style={{ width: `var(${s})` }} />
              <code>{s}</code>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
