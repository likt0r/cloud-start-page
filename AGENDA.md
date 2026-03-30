# Cloud Start Page — Projektbeschreibung

## Übersicht

Private Cloud Start Page — ein zentrales Portal für Nutzer einer selbst gehosteten Cloud-Infrastruktur. Nutzer sehen nach dem Login eine persönlich gefilterte Übersicht aller Dienste, auf die sie Zugriff haben, geordnet in visuellen Kategorien.

---

## Kernfunktionen

### 1. Dienste-Übersicht

Dienste sind in **Kategorien** organisiert, die als Abschnitte auf der Start-Seite dargestellt werden.

**Kategorie:**
- Titel
- Icon (Iconify)
- Sortierreihenfolge

**Dienst (innerhalb einer Kategorie):**
- Name
- Logo/Bild (hochladbar)
- Beschreibung
- URL (Link zum Dienst)
- Verknüpfte Companion-Apps (z. B. Mobile-Apps mit Platform, Store-Link, Icon)
- Sortierreihenfolge

### 2. Zugriffskontrolle

- Nutzer sehen **nur Dienste**, für die sie in einer zugehörigen Keycloak-Gruppe sind
- Zugriffsgruppen werden aus dem OIDC-Token (Keycloak) nach dem Login extrahiert
- Jeder Dienst kann einer oder mehreren Keycloak-Gruppen zugeordnet werden
- Eine Kategorie wird ausgeblendet, wenn nach dem Filtern keine Dienste übrig bleiben

> **Wichtig:** Kategorien (visuelle Gruppierung) und Zugriffsgruppen (Keycloak) sind unabhängig voneinander.

### 3. Authentifizierung

- OAuth2/OIDC via **Keycloak**
- Modul: [`nuxt-oidc-auth`](https://nuxt.com/modules/nuxt-oidc-auth)
- Nach dem Login: Gruppen-Claims aus dem JWT-Token extrahieren und für die Filterung nutzen

### 4. Admin-Bereich

Geschützt — nur für Nutzer in der konfigurierten Admin-Gruppe.

- Kategorien anlegen / bearbeiten / löschen (Titel, Icon, Reihenfolge)
- Dienste anlegen / bearbeiten / löschen
- Bilder hochladen (lokaler Speicher)
- Keycloak-Zugriffsgruppen pro Dienst konfigurieren
- Companion-Apps verwalten

---

## Tech-Stack

| Bereich | Technologie |
|---|---|
| Frontend-Framework | Nuxt 4 |
| UI | Nuxt UI (v4) + Tailwind CSS 4 |
| Auth | `nuxt-oidc-auth` + Keycloak |
| Datenbank | SQLite via `better-sqlite3` + Drizzle ORM (`drizzle-orm/better-sqlite3`) |
| Icons | Iconify (Lucide + Simple Icons) |
| Package Manager | npm |

### Begründung der Tech-Entscheidungen

- **npm + Node.js**: Standardmäßig, breite Kompatibilität
- **`better-sqlite3` + Drizzle ORM** (kein `bun:sqlite`): Synchrones SQLite für Node.js, volle Typsicherheit via Drizzle
- **`nuxt-oidc-auth`** statt `@sidebase/nuxt-auth`: Nativ OIDC-fokussiert, direkter Zugriff auf Keycloak JWT-Claims inkl. Gruppen-Claims; `@sidebase/nuxt-auth` (Auth.js) hat bekannte Probleme mit Keycloak-JWT-Extraktion

---

## Datenbankschema

```
categories
  id            INTEGER PRIMARY KEY
  title         TEXT NOT NULL
  icon          TEXT NOT NULL        -- Iconify icon name
  sort_order    INTEGER DEFAULT 0

services
  id            INTEGER PRIMARY KEY
  category_id   INTEGER REFERENCES categories(id)
  name          TEXT NOT NULL
  description   TEXT
  image_path    TEXT                 -- relativer Pfad in public/uploads/
  url           TEXT NOT NULL
  sort_order    INTEGER DEFAULT 0
  created_at    TEXT DEFAULT (datetime('now'))

service_access_groups
  service_id         INTEGER REFERENCES services(id)
  keycloak_group     TEXT NOT NULL
  PRIMARY KEY (service_id, keycloak_group)

companion_apps
  id            INTEGER PRIMARY KEY
  service_id    INTEGER REFERENCES services(id)
  name          TEXT NOT NULL
  platform      TEXT                 -- 'ios', 'android'
  store_url     TEXT
```

**Begriffe:**
- **Kategorie** = visuelle Gruppe auf der Start-Seite (Titel + Icon, z. B. "Medien", "Dateien")
- **Zugriffsgruppe** = Keycloak-Gruppe, die bestimmt, ob ein Nutzer einen Dienst sieht

---

## Seiten-Struktur

```
/                           Start-Seite (Login erforderlich, gefilterte Dienst-Übersicht)
/admin                      Admin-Bereich (Admin-Gruppe erforderlich) — Kategorien, Dienste und Companion-Apps verwalten
```

---

## Konfiguration (Umgebungsvariablen)

```env
# Keycloak OIDC
NUXT_OIDC_PROVIDERS_KEYCLOAK_CLIENT_ID=...
NUXT_OIDC_PROVIDERS_KEYCLOAK_CLIENT_SECRET=...
NUXT_OIDC_PROVIDERS_KEYCLOAK_ISSUER=https://keycloak.example.com/realms/myrealm

# Admin-Gruppe (Keycloak-Gruppenname der Admin-Nutzer)
ADMIN_GROUP=cloud-admins
```

---

## Beispieldienste

| Dienst | Kategorie | Companion Apps |
|---|---|---|
| OpenCloud | Dateien | Android, iOS, Desktop |
| Immich | Fotos | Android, iOS |
| Jellyfin | Medien | Android, iOS, Kodi |
