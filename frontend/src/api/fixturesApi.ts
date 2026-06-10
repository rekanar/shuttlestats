import axios from 'axios';
import type {
  Fixture, CreateFixturePayload, MatchResult, StatsResponse, SearchResult, PointsScheme
} from '../types';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

const api = axios.create({ baseURL: BASE });

export const fixturesApi = {
  create: (payload: CreateFixturePayload): Promise<Fixture> =>
    api.post('/fixtures', payload).then(r => r.data),

  get: (id: string): Promise<Fixture> =>
    api.get(`/fixtures/${id}`).then(r => r.data),

  getByShare: (token: string): Promise<Fixture> =>
    api.get(`/fixtures/share/${token}`).then(r => r.data),

  updateMatch: (
    fixtureId: string, matchId: string,
    result: MatchResult, scoreA?: string, scoreB?: string
  ) => api.put(`/fixtures/${fixtureId}/matches/${matchId}`, { result, scoreA, scoreB }).then(r => r.data),

  getStats: (id: string): Promise<StatsResponse> =>
    api.get(`/fixtures/${id}/stats`).then(r => r.data),

  search: (id: string, q: string): Promise<SearchResult> =>
    api.get(`/fixtures/${id}/search`, { params: { q } }).then(r => r.data),

  finish: (id: string): Promise<Fixture> =>
    api.post(`/fixtures/${id}/finish`).then(r => r.data),

  updatePointsScheme: (id: string, scheme: PointsScheme) =>
    api.put(`/fixtures/${id}/points-scheme`, scheme).then(r => r.data),
};
