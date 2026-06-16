// ─── Championships Firestore API ──────────────────────────────────────────────
// Stored in its own `championships` collection — one document per championship,
// with all its events and brackets embedded. Completely separate from the
// `fixtures` / `matches` collections used by the Team-vs-Team feature.

import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { v4 as uuid } from 'uuid';
import type {
  Championship, ChampionshipSummary, ChampionshipEvent, EventCategory,
} from '../types/championship';
import { EVENT_CATEGORIES } from '../types/championship';
import { generateBracketRounds } from '../services/bracketAlgorithm';

const col = () => collection(db, 'championships');

export interface NewEventConfig {
  category: EventCategory;
  drawSize: number;
}

export const championshipsApi = {
  async list(): Promise<ChampionshipSummary[]> {
    const snap = await getDocs(query(col(), orderBy('created_at', 'desc')));
    return snap.docs.map(d => {
      const c = d.data();
      return {
        id: c.id,
        name: c.name,
        createdAt: c.created_at,
        eventCount: (c.events ?? []).length,
      };
    });
  },

  async get(id: string): Promise<Championship> {
    const s = await getDoc(doc(col(), id));
    if (!s.exists()) throw new Error('Championship not found');
    const d = s.data();
    return { id: d.id, name: d.name, createdAt: d.created_at, events: d.events ?? [] };
  },

  // Build a championship object locally (empty brackets) — NOT yet saved.
  build(name: string, configs: NewEventConfig[]): Championship {
    const events: ChampionshipEvent[] = configs.map(cfg => {
      const meta = EVENT_CATEGORIES.find(x => x.key === cfg.category)!;
      return {
        id: uuid(),
        category: cfg.category,
        drawSize: cfg.drawSize,
        sideSize: meta.sideSize,
        rounds: generateBracketRounds(cfg.drawSize, meta.sideSize),
      };
    });
    return {
      id: uuid(),
      name: name.trim() || 'Championship',
      createdAt: new Date().toISOString(),
      events,
    };
  },

  async save(c: Championship): Promise<void> {
    await setDoc(doc(col(), c.id), {
      id: c.id,
      name: c.name,
      created_at: c.createdAt,
      events: c.events,
    });
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(col(), id));
  },
};
