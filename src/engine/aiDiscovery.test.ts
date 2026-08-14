import test from 'node:test';
import assert from 'node:assert/strict';

import { extractDiscoverySignals } from './aiDiscovery';

test('extractDiscoverySignals understands fully-funded research abroad without a major requirement', () => {
  const result = extractDiscoverySignals(
    "I want a fully funded opportunity abroad where I can build research experience, but I don't want something that requires a specific major."
  );

  assert.equal(result.fundingTypes.includes('fully_funded'), true);
  assert.equal(result.worldwideOnly, true);
  assert.equal(result.categories.includes('Research'), true);
  assert.equal(result.noMajorRestriction, true);
  assert.equal(result.hardEligibilityGuard, true);
  assert.match(result.summary, /fully funded/i);
  assert.match(result.summary, /research/i);
});

test('extractDiscoverySignals keeps a user request as soft preference without hard eligibility override', () => {
  const result = extractDiscoverySignals(
    "I'm 20, from Pakistan, studying BS Psychology, but I'm open to opportunities outside psychology. I want to travel abroad for free."
  );

  assert.equal(result.fundingTypes.includes('fully_funded'), true);
  assert.equal(result.worldwideOnly, true);
  assert.equal(result.noMajorRestriction, true);
  assert.equal(result.hardEligibilityGuard, true);
  assert.match(result.summary, /no major restriction|international|travel/i);
});
