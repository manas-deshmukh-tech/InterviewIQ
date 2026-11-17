import test from 'node:test';
import assert from 'node:assert/strict';
import { groupInterviewSessions, getSessionScore, resolveInterviewScore } from '../src/modules/interviewGrouping.js';

test('▶ InterviewIQ — Historical Attempt Score Consistency & Report Alignment Test Suite', async (t) => {

  // Test dataset with mixed representations:
  // - Attempt 1: backend format with overall_score (snake_case) & nested report
  // - Attempt 2: camelCase overallScore
  // - Attempt 3 (Latest): raw database session where top-level overall_score was saved alongside report_json
  const multiAttemptSeries = [
    {
      id: 'inv_hist_att_1',
      userId: 'usr_consistency_tester',
      title: 'Senior Python Engineer Practice',
      role: 'Python Developer',
      level: 'Senior Level',
      timerMinutes: 30,
      mode: 'practice',
      overall_score: 45, // snake_case from DB
      created_at: '2026-11-10T10:00:00Z',
      parent_attempt_id: null,
      attempt_number: 1,
      report: {
        id: 'inv_hist_att_1',
        overallScore: 45,
        answers: [
          { questionId: 'q1', question: 'GIL mechanics', answerText: 'GIL prevents multi-core CPU threads', evaluation: { overallScore: 45 } }
        ],
        metrics: { avgPaceWpm: 125, fillerWordsCount: 4 }
      }
    },
    {
      id: 'inv_hist_att_2',
      userId: 'usr_consistency_tester',
      title: 'Senior Python Engineer Practice',
      role: 'Python Developer',
      level: 'Senior Level',
      timerMinutes: 30,
      mode: 'practice',
      overallScore: 68, // camelCase
      created_at: '2026-11-12T10:00:00Z',
      parent_attempt_id: 'inv_hist_att_1',
      attempt_number: 2,
      report: {
        id: 'inv_hist_att_2',
        overallScore: 68,
        answers: [
          { questionId: 'q1', question: 'GIL mechanics', answerText: 'GIL explanation with multiprocessing & nogil', evaluation: { overallScore: 68 } }
        ],
        metrics: { avgPaceWpm: 132, fillerWordsCount: 2 }
      }
    },
    {
      id: 'inv_hist_att_3',
      userId: 'usr_consistency_tester',
      title: 'Senior Python Engineer Practice',
      role: 'Python Developer',
      level: 'Senior Level',
      timerMinutes: 30,
      mode: 'practice',
      overall_score: 92,
      overallScore: 92,
      created_at: '2026-11-14T10:00:00Z',
      parent_attempt_id: 'inv_hist_att_2',
      attempt_number: 3,
      report: {
        id: 'inv_hist_att_3',
        overallScore: 92,
        answers: [
          { questionId: 'q1', question: 'GIL mechanics', answerText: 'Comprehensive CPython internals and subinterpreters PEP 684', evaluation: { overallScore: 92 } }
        ],
        metrics: { avgPaceWpm: 145, fillerWordsCount: 0 }
      }
    }
  ];

  await t.test('1. Attempt 1 selector score matches Attempt 1 report score', () => {
    const grouped = groupInterviewSessions(multiAttemptSeries, 'usr_consistency_tester');
    assert.equal(grouped.length, 1);
    const series = grouped[0];
    const att1 = series.attempts[0];

    const selectorScore = getSessionScore(att1);
    const reportScore = resolveInterviewScore(att1.report || att1);

    assert.equal(selectorScore, 45, 'Selector score must equal saved 45%');
    assert.equal(reportScore, 45, 'Report score must equal saved 45%');
    assert.equal(selectorScore, reportScore, 'Selector and report score must match exactly');
  });

  await t.test('2. Attempt 2 selector score matches Attempt 2 report score', () => {
    const grouped = groupInterviewSessions(multiAttemptSeries, 'usr_consistency_tester');
    const series = grouped[0];
    const att2 = series.attempts[1];

    const selectorScore = getSessionScore(att2);
    const reportScore = resolveInterviewScore(att2.report || att2);

    assert.equal(selectorScore, 68, 'Selector score must equal saved 68%');
    assert.equal(reportScore, 68, 'Report score must equal saved 68%');
    assert.equal(selectorScore, reportScore, 'Selector and report score must match exactly');
  });

  await t.test('3. Latest attempt (Attempt 3) selector score matches its report score', () => {
    const grouped = groupInterviewSessions(multiAttemptSeries, 'usr_consistency_tester');
    const series = grouped[0];
    const att3 = series.attempts[2];

    const selectorScore = getSessionScore(att3);
    const reportScore = resolveInterviewScore(att3.report || att3);

    assert.equal(selectorScore, 92);
    assert.equal(reportScore, 92);
    assert.equal(series.latestScore, 92);
    assert.equal(selectorScore, series.latestScore);
  });

  await t.test('4. Switching between attempts never displays another attempt score', () => {
    const grouped = groupInterviewSessions(multiAttemptSeries, 'usr_consistency_tester');
    const series = grouped[0];

    const attempt1 = series.attempts.find(a => a.id === 'inv_hist_att_1');
    const attempt2 = series.attempts.find(a => a.id === 'inv_hist_att_2');
    const attempt3 = series.attempts.find(a => a.id === 'inv_hist_att_3');

    assert.equal(getSessionScore(attempt1), 45);
    assert.equal(getSessionScore(attempt2), 68);
    assert.equal(getSessionScore(attempt3), 92);

    // Ensure Attempt 1 never bleeds Attempt 2 or 3 score
    assert.notEqual(getSessionScore(attempt1), getSessionScore(attempt2));
    assert.notEqual(getSessionScore(attempt1), getSessionScore(attempt3));
  });

  await t.test('5. Snake_case (overall_score) and camelCase (overallScore) are handled consistently', () => {
    const snakeOnly = { id: 's1', overall_score: 77 };
    const camelOnly = { id: 's2', overallScore: 83 };
    const mixedEqual = { id: 's3', overall_score: 90, overallScore: 90 };

    assert.equal(getSessionScore(snakeOnly), 77);
    assert.equal(getSessionScore(camelOnly), 83);
    assert.equal(getSessionScore(mixedEqual), 90);
  });

  await t.test('6. Cached data and backend responses do not create conflicting scores', () => {
    // Backend session record (from MySQL table without top-level overallScore)
    const backendRecord = {
      id: 'inv_be_1',
      overall_score: 58,
      report: { id: 'inv_be_1', overallScore: 58 }
    };
    // Cached record (from local client save)
    const cachedRecord = {
      id: 'inv_be_1',
      overallScore: 58,
      overall_score: 58
    };

    assert.equal(getSessionScore(backendRecord), 58);
    assert.equal(getSessionScore(cachedRecord), 58);
    assert.equal(getSessionScore(backendRecord), getSessionScore(cachedRecord));
  });

  await t.test('7. Missing scores are not silently represented as genuine zero scores when valid saved data exists elsewhere', () => {
    // Record where top-level overallScore is undefined, but nested report has 65
    const sessionWithNestedOnly = {
      id: 'inv_nested_only',
      report: { overallScore: 65 }
    };
    assert.equal(getSessionScore(sessionWithNestedOnly), 65);

    // Record where top-level overall_score is undefined, but report_json string has 82
    const sessionWithReportJson = {
      id: 'inv_json_str',
      report_json: JSON.stringify({ overallScore: 82 })
    };
    assert.equal(getSessionScore(sessionWithReportJson), 82);
  });

  await t.test('8. Genuine zero-score interviews still display 0%', () => {
    const genuineZeroSession = {
      id: 'inv_zero',
      overallScore: 0,
      overall_score: 0,
      report: { overallScore: 0, answers: [] }
    };
    assert.equal(getSessionScore(genuineZeroSession), 0);
  });

  await t.test('9. Existing grouping and historical report navigation remain fully functional', () => {
    const grouped = groupInterviewSessions(multiAttemptSeries, 'usr_consistency_tester');
    assert.equal(grouped.length, 1);
    const series = grouped[0];
    assert.equal(series.totalAttempts, 3);
    assert.equal(series.attempts[0].displayLabel, 'Attempt 1');
    assert.equal(series.attempts[1].displayLabel, 'Attempt 2');
    assert.equal(series.attempts[2].displayLabel, 'Attempt 3');
    assert.equal(series.attempts[2].isLatest, true);
  });

});

