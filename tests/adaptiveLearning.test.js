import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  QUESTION_BANK,
  INTERVIEW_ROLES,
  getDurationQuestionCount,
  getQuestionsForRole
} from '../src/data/questionBank.js';

describe('InterviewIQ — Adaptive Learning & Repository Calibration Test Suite', () => {
  it('1. Duration Question Scaling: maps presets and arbitrary durations strictly', () => {
    assert.equal(getDurationQuestionCount(5), 3, '5 mins must map to 3 questions');
    assert.equal(getDurationQuestionCount(15), 5, '15 mins must map to 5 questions');
    assert.equal(getDurationQuestionCount(30), 9, '30 mins must map to 9 questions');
    assert.equal(getDurationQuestionCount(45), 13, '45 mins must map to 13 questions');
    assert.equal(getDurationQuestionCount(10), 5, '10 mins falls in 15 min bracket (5 questions)');
  });

  it('2. Complete 13-Role Repository Coverage: every role has questions with tags and rubrics', () => {
    assert.equal(INTERVIEW_ROLES.length, 13, 'Must define exactly 13 interview roles');

    const standardRoles = INTERVIEW_ROLES.filter(r => r.id !== 'custom_role');
    standardRoles.forEach(role => {
      const questions = QUESTION_BANK[role.categoryKey];
      assert.ok(questions && questions.length >= 12, `${role.title} must have at least 12 questions in bank`);
      
      questions.forEach((q, idx) => {
        assert.ok(q.id, `${role.title} Q${idx} missing id`);
        assert.ok(q.question && q.question.length > 10, `${role.title} Q${idx} missing text`);
        assert.ok(q.topic, `${role.title} Q${idx} missing topic`);
        assert.ok(q.questionType, `${role.title} Q${idx} missing questionType`);
        assert.ok(q.level, `${role.title} Q${idx} missing level`);
        assert.ok(Array.isArray(q.idealKeywords) && q.idealKeywords.length > 0, `${role.title} Q${idx} missing keywords`);
      });
    });
  });

  it('3. Custom Role Dynamic Fallback: generates tailored questions for arbitrary roles', () => {
    const questions = getQuestionsForRole('custom_role', 'Cloud Security Architect', 'Senior Level', 5);
    assert.equal(questions.length, 3, 'Must return duration-calibrated count (3 for 5m)');
    assert.ok(questions[0].question.includes('Cloud Security Architect'), 'Must personalize question text with custom role name');
  });

  it('4. Deduplication & History Filtering: never re-serves previously answered question IDs', () => {
    const roleKey = 'Software Developer';
    const firstDraw = getQuestionsForRole(roleKey, '', 'Mid Level', 15, []);
    assert.equal(firstDraw.length, 5);

    const historyIds = firstDraw.map(q => q.id);
    const secondDraw = getQuestionsForRole(roleKey, '', 'Mid Level', 15, historyIds);
    assert.equal(secondDraw.length, 5);

    // Verify zero overlap between first and second draw
    const secondIds = new Set(secondDraw.map(q => q.id));
    for (const id of historyIds) {
      assert.equal(secondIds.has(id), false, `Question ${id} should have been deduplicated`);
    }
  });

  it('5. Topic Band Categorization: verifies 4 score band criteria', () => {
    const categorize = (score) => {
      if (score < 50) return 'Priority Improvement';
      if (score < 70) return 'Focused Practice';
      if (score < 85) return 'Skill Refinement';
      return 'Advanced Mastery';
    };

    assert.equal(categorize(42), 'Priority Improvement');
    assert.equal(categorize(49.9), 'Priority Improvement');
    assert.equal(categorize(50), 'Focused Practice');
    assert.equal(categorize(69), 'Focused Practice');
    assert.equal(categorize(70), 'Skill Refinement');
    assert.equal(categorize(84.9), 'Skill Refinement');
    assert.equal(categorize(85), 'Advanced Mastery');
    assert.equal(categorize(95), 'Advanced Mastery');
  });
});
