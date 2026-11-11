import type { RoleplayScript } from './types';
import { ARRIVAL_HOUSING } from './rp-arrival-housing';
import { MONEY_FOOD_SHOPPING } from './rp-money-food-shopping';
import { SOCIAL, JOBS } from './rp-social';
import { WORK, TRADES } from './rp-work';
import { TRANSPORT, HEALTH, FORMAL, HARD } from './rp-life';
import { DEEP_1 } from './rp-deep-1';

/** Guiones escritos con la forma corta, por número del catálogo. Los profundos (DEEP_*) van al final y reemplazan a los cortos. */
const LISTS: (RoleplayScript & { n: string })[][] = [ARRIVAL_HOUSING, MONEY_FOOD_SHOPPING, SOCIAL, JOBS, WORK, TRADES, TRANSPORT, HEALTH, FORMAL, HARD, DEEP_1];
/** Números de los guiones ya reescritos en versión profunda. */
export const DEEP_NS = new Set([DEEP_1].flat().map((s) => s.n));

export const SCRIPTS_BY_N: Record<string, RoleplayScript> = Object.fromEntries(LISTS.flat().map((s) => [s.n, s]));
