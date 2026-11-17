import test from 'node:test';
import assert from 'node:assert/strict';
import { groupInterviewSessions } from '../src/modules/interviewGrouping.js';

test('▶ InterviewIQ — Historical Report Integrity & Attempt Navigation Test Suite', async (t) => {

  const testSeries = [
    {
      id: 'inv_attempt_1',
      userId: 'usr_cand_target',
      title: 'HR Behavioral Round',
      role: 'HR Interview',
      level: 'Fresher / Entry',
      timerMinutes: 15,
      mode: 'practice',
      overallScore: 18,
      date: '2026-11-16T09:00:00Z',
      parentAttemptId: null,
      answers: [
        { questionId: 'q1', question: 'Tell me about yourself', answerText: 'Brief answer', evaluation: { overallScore: 20 } },
        { questionId: 'q2', question: 'Why this company?', answerText: 'Not sure', evaluation: { overallScore: 16 } }
      ],
      metrics: { avgPaceWpm: 120, fillerWordsCount: 7 }
    },
    {
      id: 'inv_attempt_2',
      userId: 'usr_cand_target',
      title: 'HR Behavioral Round',
      role: 'HR Interview',
      level: 'Fresher / Entry',
      timerMinutes: 15,
      mode: 'practice',
      overallScore: 2,
      date: '2026-11-17T09:00:00Z',
      parentAttemptId: 'inv_attempt_1',
      answers: [
        { questionId: 'q1', question: 'Tell me about yourself', answerText: 'Silent', evaluation: { overallScore: 0 } },
        { questionId: 'q2', question: 'Why this company?', answerText: 'Blanked out', evaluation: { overallScore: 4 } }
      ],
      metrics: { avgPaceWpm: 80, fillerWordsCount: 2 }
    },
    {
      id: 'inv_attempt_3',
      userId: 'usr_cand_target',
      title: 'HR Behavioral Round',
      role: 'HR Interview',
      level: 'Fresher / Entry',
      timerMinutes: 15,
      mode: 'practice',
      overallScore: 65,
      date: '2026-11-18T09:00:00Z',
      parentAttemptId: 'inv_attempt_2',
      answers: [
        { questionId: 'q1', question: 'Tell me about yourself', answerText: 'Structured STAR response with concrete metrics', evaluation: { overallScore: 70 } },
        { questionId: 'q2', question: 'Why this company?', answerText: 'Researched company mission and product architecture', evaluation: { overallScore: 60 } }
      ],
      metrics: { avgPaceWpm: 140, fillerWordsCount: 1 }
    }
  ];

  await t.test('20. Attempt 1 resolves to its own original report data', () => {
    const grouped = groupInterviewSessions(testSeries, 'usr_cand_target');
    assert.equal(grouped.length, 1);
    const series = grouped[0];

    const att1 = series.attempts[0];
    assert.equal(att1.id, 'inv_attempt_1');
    assert.equal(att1.displayLabel, 'Attempt 1');
    assert.equal(att1.overallScore, 18);
    assert.equal(att1.isLatest, false);
    assert.equal(att1.answers.length, 2);
    assert.equal(att1.answers[0].answerText, 'Brief answer');
    assert.equal(att1.metrics.avgPaceWpm, 120);
    assert.equal(att1.metrics.fillerWordsCount, 7);
  });

  await t.test('21. Attempt 2 resolves to its own original report data', () => {
    const grouped = groupInterviewSessions(testSeries, 'usr_cand_target');
    const series = grouped[0];

    const att2 = series.attempts[1];
    assert.equal(att2.id, 'inv_attempt_2');
    assert.equal(att2.displayLabel, 'Attempt 2');
    assert.equal(att2.overallScore, 2);
    assert.equal(att2.isLatest, false);
    assert.equal(att2.answers[0].answerText, 'Silent');
    assert.equal(att2.metrics.avgPaceWpm, 80);
    assert.equal(att2.metrics.fillerWordsCount, 2);
  });

  await t.test('22. Latest attempt (Attempt 3) resolves to its own original report data', () => {
    const grouped = groupInterviewSessions(testSeries, 'usr_cand_target');
    const series = grouped[0];

    const att3 = series.attempts[2];
    assert.equal(att3.id, 'inv_attempt_3');
    assert.equal(att3.displayLabel, 'Attempt 3');
    assert.equal(att3.overallScore, 65);
    assert.equal(att3.isLatest, true);
    assert.equal(att3.answers[0].answerText, 'Structured STAR response with concrete metrics');
    assert.equal(att3.metrics.avgPaceWpm, 140);
    assert.equal(att3.metrics.fillerWordsCount, 1);

    // Main series entry reflects latest attempt
    assert.equal(series.latestScore, 65);
    assert.equal(series.latestAttempt.id, 'inv_attempt_3');
    assert.equal(series.totalAttempts, 3);
  });

  await t.test('23. Historical reports are never merged, overwritten, or recalculated', () => {
    const grouped = groupInterviewSessions(testSeries, 'usr_cand_target');
    const series = grouped[0];

    // Verify all 3 attempts maintain distinct individual scores without averaging
    const scores = series.attempts.map(a => a.overallScore);
    assert.deepEqual(scores, [18, 2, 65]);

    // Average would be (18 + 2 + 65) / 3 = 28.33; ensure main score is strictly latest 65%
    assert.notEqual(series.latestScore, 28);
    assert.equal(series.latestScore, 65);
  });

});

