import type { RoleplayScript } from './types';
import { ARRIVAL_HOUSING } from './rp-arrival-housing';
import { MONEY_FOOD_SHOPPING } from './rp-money-food-shopping';
import { SOCIAL, JOBS } from './rp-social';
import { WORK, TRADES } from './rp-work';
import { TRANSPORT, HEALTH, FORMAL, HARD } from './rp-life';

/** Guiones escritos con la forma corta, por número del catálogo. */
const LISTS: (RoleplayScript & { n: string })[][] = [ARRIVAL_HOUSING, MONEY_FOOD_SHOPPING, SOCIAL, JOBS, WORK, TRADES, TRANSPORT, HEALTH, FORMAL, HARD];

export const SCRIPTS_BY_N: Record<string, RoleplayScript> = Object.fromEntries(LISTS.flat().map((s) => [s.n, s]));
