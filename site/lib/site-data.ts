import site from '@/generated/site.json';
import type { CliSamples } from './data/cli-samples';
import type { Codes } from './data/codes';
import type { Receipt, RepairRound } from './data/receipt';

export const SITE: { version: string; install: { skill: string; cli: string }; receipt: Receipt; repair: RepairRound; cli: CliSamples; codes: Codes } = site;
