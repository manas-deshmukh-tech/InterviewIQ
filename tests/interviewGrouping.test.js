import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isConfigurationMatch,
  groupInterviewSessions,
  getSessionUserId,
  getSessionRole,
  getSessionLevel,
  getSessionDuration
} from '../src/modules/interviewGrouping.js';

test('▶ InterviewIQ — Interview Grouping & Historical Attempt Resolution Test Suite', async (t) => {

  await t.test('1. Single completed interview displays as a single-attempt series', () => {
    const interviews = [
      {
        id: 'inv_101',
        userId: 'usr_cand_1',
        title: 'Full Stack Simulation',
        category: 'Software & Engineering',
        role: 'Full Stack Engineer',
        level: 'Mid Level',
        overallScore: 84,
        date: '2026-11-15T10:00:00Z',
        parentAttemptId: null
      }
    ];

    const grouped = groupInterviewSessions(interviews, 'usr_cand_1');
    assert.equal(grouped.length, 1);
    assert.equal(grouped[0].totalAttempts, 1);
    assert.equal(grouped[0].isMultiAttempt, false);
    assert.equal(grouped[0].latestScore, 84);
    assert.equal(grouped[0].attempts[0].displayLabel, 'Attempt 1');
    assert.equal(grouped[0].attempts[0].isLatest, true);
  });

  await t.test('2. Two verified matching retakes appear in one group', () => {
    const interviews = [
      {
        id: 'inv_1',
        userId: 'usr_cand_1',
        role: 'Data Analyst',
        level: 'Mid Level',
        timerMinutes: 15,
        mode: 'practice',
        overallScore: 45,
        date: '2026-11-16T10:00:00Z',
        parentAttemptId: null
      },
      {
        id: 'inv_2',
        userId: 'usr_cand_1',
        role: 'Data Analyst',
        level: 'Mid Level',
        timerMinutes: 15,
        mode: 'practice',
        overallScore: 78,
        date: '2026-11-17T10:00:00Z',
        parentAttemptId: 'inv_1'
      }
    ];

    const grouped = groupInterviewSessions(interviews, 'usr_cand_1');
    assert.equal(grouped.length, 1);
    assert.equal(grouped[0].totalAttempts, 2);
    assert.equal(grouped[0].isMultiAttempt, true);
    assert.equal(grouped[0].latestScore, 78);
    assert.equal(grouped[0].attempts[0].id, 'inv_1');
    assert.equal(grouped[0].attempts[0].displayLabel, 'Attempt 1');
    assert.equal(grouped[0].attempts[0].isLatest, false);
    assert.equal(grouped[0].attempts[1].id, 'inv_2');
    assert.equal(grouped[0].attempts[1].displayLabel, 'Attempt 2');
    assert.equal(grouped[0].attempts[1].isLatest, true);
  });

  await t.test('3. Three verified matching retakes appear in one group', () => {
    const interviews = [
      {
        id: 'inv_a',
        userId: 'usr_cand_1',
        role: 'HR Interview',
        level: 'Fresher / Entry',
        timerMinutes: 15,
        mode: 'practice',
        overallScore: 18,
        date: '2026-11-16T10:00:00Z',
        parentAttemptId: null
      },
      {
        id: 'inv_b',
        userId: 'usr_cand_1',
        role: 'HR Interview',
        level: 'Fresher / Entry',
        timerMinutes: 15,
        mode: 'practice',
        overallScore: 2,
        date: '2026-11-17T10:00:00Z',
        parentAttemptId: 'inv_a'
      },
      {
        id: 'inv_c',
        userId: 'usr_cand_1',
        role: 'HR Interview',
        level: 'Fresher / Entry',
        timerMinutes: 15,
        mode: 'practice',
        overallScore: 65,
        date: '2026-11-18T10:00:00Z',
        parentAttemptId: 'inv_b'
      }
    ];

    const grouped = groupInterviewSessions(interviews, 'usr_cand_1');
    assert.equal(grouped.length, 1);
    assert.equal(grouped[0].totalAttempts, 3);
    assert.equal(grouped[0].latestScore, 65);
    assert.equal(grouped[0].attempts[0].displayLabel, 'Attempt 1');
    assert.equal(grouped[0].attempts[0].overallScore, 18);
    assert.equal(grouped[0].attempts[1].displayLabel, 'Attempt 2');
    assert.equal(grouped[0].attempts[1].overallScore, 2);
    assert.equal(grouped[0].attempts[2].displayLabel, 'Attempt 3');
    assert.equal(grouped[0].attempts[2].overallScore, 65);
    assert.equal(grouped[0].attempts[2].isLatest, true);
  });

  await t.test('4. Different roles remain separate', () => {
    const interviews = [
      {
        id: 'inv_py',
        userId: 'usr_cand_1',
        role: 'Python Developer',
        level: 'Mid Level',
        parentAttemptId: null
      },
      {
        id: 'inv_data',
        userId: 'usr_cand_1',
        role: 'Data Scientist',
        level: 'Mid Level',
        parentAttemptId: 'inv_py' // Deliberately mismatched parent
      }
    ];

    const grouped = groupInterviewSessions(interviews, 'usr_cand_1');
    assert.equal(grouped.length, 2, 'Role mismatch must prevent grouping');
  });

  await t.test('5. Different custom role names remain separate', () => {
    const interviews = [
      {
        id: 'inv_cust_1',
        userId: 'usr_cand_1',
        role: 'Custom Role',
        customRoleTitle: 'Cloud Solutions Architect',
        level: 'Senior',
        parentAttemptId: null
      },
      {
        id: 'inv_cust_2',
        userId: 'usr_cand_1',
        role: 'Custom Role',
        customRoleTitle: 'Site Reliability Engineer',
        level: 'Senior',
        parentAttemptId: 'inv_cust_1' // Mismatched custom title
      }
    ];

    const grouped = groupInterviewSessions(interviews, 'usr_cand_1');
    assert.equal(grouped.length, 2, 'Custom role title mismatch must prevent grouping');
  });

  await t.test('6. Different difficulty levels remain separate', () => {
    const interviews = [
      {
        id: 'inv_lvl_1',
        userId: 'usr_cand_1',
        role: 'Software Developer',
        level: 'Fresher / Entry',
        parentAttemptId: null
      },
      {
        id: 'inv_lvl_2',
        userId: 'usr_cand_1',
        role: 'Software Developer',
        level: 'Staff / Architect',
        parentAttemptId: 'inv_lvl_1'
      }
    ];

    const grouped = groupInterviewSessions(interviews, 'usr_cand_1');
    assert.equal(grouped.length, 2, 'Seniority level mismatch must prevent grouping');
  });

  await t.test('7. Different durations remain separate', () => {
    const interviews = [
      {
        id: 'inv_dur_1',
        userId: 'usr_cand_1',
        role: 'Software Developer',
        level: 'Mid Level',
        timerMinutes: 15,
        parentAttemptId: null
      },
      {
        id: 'inv_dur_2',
        userId: 'usr_cand_1',
        role: 'Software Developer',
        level: 'Mid Level',
        timerMinutes: 45,
        parentAttemptId: 'inv_dur_1'
      }
    ];

    const grouped = groupInterviewSessions(interviews, 'usr_cand_1');
    assert.equal(grouped.length, 2, 'Duration mismatch must prevent grouping');
  });

  await t.test('8. Different interview modes remain separate', () => {
    const interviews = [
      {
        id: 'inv_mode_1',
        userId: 'usr_cand_1',
        role: 'Software Developer',
        level: 'Mid Level',
        mode: 'practice',
        parentAttemptId: null
      },
      {
        id: 'inv_mode_2',
        userId: 'usr_cand_1',
        role: 'Software Developer',
        level: 'Mid Level',
        mode: 'simulation',
        parentAttemptId: 'inv_mode_1'
      }
    ];

    const grouped = groupInterviewSessions(interviews, 'usr_cand_1');
    assert.equal(grouped.length, 2, 'Mode mismatch must prevent grouping');
  });

  await t.test('9. Standard and resume-based interviews remain separate', () => {
    const interviews = [
      {
        id: 'inv_std',
        userId: 'usr_cand_1',
        role: 'Software Developer',
        level: 'Mid Level',
        questionSource: 'builtin',
        parentAttemptId: null
      },
      {
        id: 'inv_res',
        userId: 'usr_cand_1',
        role: 'Software Developer',
        level: 'Mid Level',
        questionSource: 'resume',
        resumeSkills: ['React', 'FastAPI'],
        parentAttemptId: 'inv_std'
      }
    ];

    const grouped = groupInterviewSessions(interviews, 'usr_cand_1');
    assert.equal(grouped.length, 2, 'Question source mismatch must prevent grouping');
  });

  await t.test('10. Different resume contexts remain separate', () => {
    const interviews = [
      {
        id: 'inv_proj_1',
        userId: 'usr_cand_1',
        role: 'Software Developer',
        level: 'Mid Level',
        questionSource: 'resume',
        projectName: 'Banking Ledger Platform',
        parentAttemptId: null
      },
      {
        id: 'inv_proj_2',
        userId: 'usr_cand_1',
        role: 'Software Developer',
        level: 'Mid Level',
        questionSource: 'resume',
        projectName: 'Healthcare Telemetry Device',
        parentAttemptId: 'inv_proj_1'
      }
    ];

    const grouped = groupInterviewSessions(interviews, 'usr_cand_1');
    assert.equal(grouped.length, 2, 'Resume project context mismatch must prevent grouping');
  });

  await t.test('11. Fresh interviews with identical configurations remain separate', () => {
    // Both interviews were created freshly from setup without retake link
    const interviews = [
      {
        id: 'inv_fresh_1',
        userId: 'usr_cand_1',
        role: 'Software Developer',
        level: 'Mid Level',
        timerMinutes: 15,
        mode: 'practice',
        overallScore: 70,
        date: '2026-11-10T10:00:00Z',
        parentAttemptId: null
      },
      {
        id: 'inv_fresh_2',
        userId: 'usr_cand_1',
        role: 'Software Developer',
        level: 'Mid Level',
        timerMinutes: 15,
        mode: 'practice',
        overallScore: 85,
        date: '2026-11-12T10:00:00Z',
        parentAttemptId: null
      }
    ];

    const grouped = groupInterviewSessions(interviews, 'usr_cand_1');
    assert.equal(grouped.length, 2, 'Independent fresh interviews must not be lumped together');
  });

  await t.test('12. Older records without verified relationships are not incorrectly grouped', () => {
    const interviews = [
      {
        id: 'inv_legacy_1',
        userId: 'usr_cand_1',
        title: 'Legacy Python Round',
        role: 'Python Developer',
        level: 'Mid Level',
        overallScore: 60,
        date: '2026-10-01T10:00:00Z'
      },
      {
        id: 'inv_legacy_2',
        userId: 'usr_cand_1',
        title: 'Legacy Python Round',
        role: 'Python Developer',
        level: 'Mid Level',
        overallScore: 75,
        date: '2026-10-15T10:00:00Z'
      }
    ];

    const grouped = groupInterviewSessions(interviews, 'usr_cand_1');
    assert.equal(grouped.length, 2, 'Older records lacking verified links must stay separate');
  });

  await t.test('13. Different users records are never grouped together', () => {
    const interviews = [
      {
        id: 'inv_user_a',
        userId: 'usr_cand_1',
        role: 'HR Interview',
        overallScore: 80,
        parentAttemptId: null
      },
      {
        id: 'inv_user_b',
        userId: 'usr_cand_2',
        role: 'HR Interview',
        overallScore: 90,
        parentAttemptId: 'inv_user_a' // Malicious cross-tenant link attempt
      }
    ];

    const groupedUser1 = groupInterviewSessions(interviews, 'usr_cand_1');
    assert.equal(groupedUser1.length, 1);
    assert.equal(groupedUser1[0].attempts.length, 1);
    assert.equal(groupedUser1[0].attempts[0].id, 'inv_user_a');

    const groupedUser2 = groupInterviewSessions(interviews, 'usr_cand_2');
    assert.equal(groupedUser2.length, 1);
    assert.equal(groupedUser2[0].attempts.length, 1);
    assert.equal(groupedUser2[0].attempts[0].id, 'inv_user_b');
  });

  await t.test('14. Attempts are numbered chronologically and labeled Attempt 1, Attempt 2, etc.', () => {
    const interviews = [
      {
        id: 'inv_late',
        userId: 'usr_cand_1',
        role: 'Software Developer',
        date: '2026-11-17T12:00:00Z',
        overallScore: 90,
        parentAttemptId: 'inv_early'
      },
      {
        id: 'inv_early',
        userId: 'usr_cand_1',
        role: 'Software Developer',
        date: '2026-11-15T12:00:00Z',
        overallScore: 50,
        parentAttemptId: null
      }
    ];

    const grouped = groupInterviewSessions(interviews, 'usr_cand_1');
    assert.equal(grouped.length, 1);
    assert.equal(grouped[0].attempts[0].id, 'inv_early');
    assert.equal(grouped[0].attempts[0].displayLabel, 'Attempt 1');
    assert.equal(grouped[0].attempts[1].id, 'inv_late');
    assert.equal(grouped[0].attempts[1].displayLabel, 'Attempt 2');
    assert.equal(grouped[0].attempts[1].isLatest, true);
  });

});

