import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { ContactPreview } from "@/modules/dashboard/types";

import styles from "./ListCard.module.css";

export function ContactsPreview({ contacts, total }: { contacts: ContactPreview[]; total: number }) {
  const ready = contacts.filter((c) => c.status === "active").length;
  return (
    <section aria-labelledby="contacts-heading">
      <SectionHeading
        id="contacts-heading"
        title="Trusted contacts"
        action={
          <ButtonLink href="/contacts" variant="quiet">
            Manage
          </ButtonLink>
        }
      />
      <Card flush>
        {contacts.length === 0 ? (
          <p className={styles.footer}>Add the people you trust. They&apos;ll be asked to accept before they receive alerts.</p>
        ) : (
          <>
            <ul className={styles.list} role="list">
              {contacts.map((contact) => (
                <li key={contact.id} className={styles.row}>
                  <Avatar name={contact.name} />
                  <div className={styles.body}>
                    <p className={styles.primary}>{contact.name}</p>
                    <p className={styles.secondary}>{contact.relationship}</p>
                  </div>
                  <Badge tone={contact.status === "active" ? "sage" : "wheat"} className={styles.trailing}>
                    {contact.status === "active" ? "Active" : "Invite pending"}
                  </Badge>
                </li>
              ))}
            </ul>
            <p className={styles.footer}>
              {ready} of {total} {total === 1 ? "contact has" : "contacts have"} accepted and can receive alerts.
            </p>
          </>
        )}
      </Card>
    </section>
  );
}
