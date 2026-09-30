import site from '@/generated/site.json';
import type { Receipt, RepairRound } from './data/receipt';

export const SITE: { version: string; install: { skill: string; cli: string }; receipt: Receipt; repair: RepairRound } = site;
