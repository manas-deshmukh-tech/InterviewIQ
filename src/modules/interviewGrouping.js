/**
 * InterviewIQ — Interview Grouping & Historical Attempt Resolution Engine
 * 
 * Grouping Rules:
 * 1. Strict User Isolation: Records belonging to different users never share a group.
 * 2. Persistent & Verified Relationship: An interview belongs to a series if and only if
 *    it has a verified relationship (explicit parent_attempt_id OR verified sequential attempt
 *    progression matching predecessor configuration).
 * 3. Fresh Session Separation: Starting a fresh interview (no parent link and attempt_number = 1)
 *    always initiates a new series, even when every configuration parameter matches an existing series.
 * 4. Backward Compatibility: Older records without verified relationships remain individual
 *    standalone entries, preventing accidental grouping.
 * 5. Configuration Matching: Retakes in a series must strictly match:
 *    - Role (normalized title/ID)
 *    - Custom role name (when applicable)
 *    - Difficulty / experience level
 *    - Interview duration (timerMinutes / durationMinutes)
 *    - Interview mode (e.g., practice vs simulation)
 *    - Question source (standard vs resume-based)
 *    - Resume context / project identifier (when applicable)
 * 6. Chronological Numbering: Attempts are ordered chronologically (oldest = Attempt 1,
 *    Attempt 2, ...), with the most recent designated as 'Latest'.
 */

export function getSessionUserId(inv) {
  if (!inv) return '';
  return String(inv.userId || inv.user_id || inv.report?.userId || inv.report?.user_id || '').trim();
}

export function getSessionRole(inv) {
  if (!inv) return '';
  return String(inv.role || inv.report?.role || inv.targetRole || inv.report?.targetRole || '').trim().toLowerCase();
}

export function getSessionCustomRole(inv) {
  if (!inv) return '';
  return String(
    inv.customRoleTitle || inv.report?.customRoleTitle ||
    inv.customRoleName || inv.report?.customRoleName ||
    inv.custom_role_title || inv.report?.custom_role_title || ''
  ).trim().toLowerCase();
}

export function getSessionLevel(inv) {
  if (!inv) return 'mid level';
  return String(inv.level || inv.report?.level || 'Mid Level').trim().toLowerCase();
}

export function getSessionDuration(inv) {
  if (!inv) return 15;
  const raw = inv.timerMinutes ?? inv.durationMinutes ?? inv.report?.timerMinutes ?? inv.report?.durationMinutes;
  const num = Number(raw);
  return Number.isFinite(num) && num > 0 ? num : 15;
}

export function getSessionMode(inv) {
  if (!inv) return 'practice';
  return String(inv.mode || inv.report?.mode || 'practice').trim().toLowerCase();
}

export function isSessionResumeBased(inv) {
  if (!inv) return false;
  if (inv.questionSource === 'resume' || inv.report?.questionSource === 'resume') return true;
  if (Array.isArray(inv.resumeSkills) && inv.resumeSkills.length > 0) return true;
  if (Array.isArray(inv.report?.resumeSkills) && inv.report.resumeSkills.length > 0) return true;
  if (Array.isArray(inv.resumeProjects) && inv.resumeProjects.length > 0) return true;
  if (Array.isArray(inv.report?.resumeProjects) && inv.report.resumeProjects.length > 0) return true;
  return false;
}

export function getSessionResumeContext(inv) {
  if (!inv) return '';
  return String(inv.projectName || inv.report?.projectName || '').trim().toLowerCase();
}

export function getSessionParentAttemptId(inv) {
  if (!inv) return null;
  const val = inv.parent_attempt_id || inv.parentAttemptId || inv.report?.parent_attempt_id || inv.report?.parentAttemptId;
  return val ? String(val).trim() : null;
}

export function getSessionAttemptNumber(inv) {
  if (!inv) return 1;
  const num = Number(
    inv.attempt_number ?? inv.attemptNumber ??
    inv.report?.attempt_number ?? inv.report?.attemptNumber ??
    inv.report?.attemptProgression?.attemptNumber
  );
  return Number.isFinite(num) && num > 0 ? num : 1;
}

export function getSessionScore(inv) {
  if (!inv) return 0;
  // 1. Direct overallScore
  if (typeof inv.overallScore === 'number' && Number.isFinite(inv.overallScore)) {
    return Math.round(inv.overallScore);
  }
  // 2. Report object overallScore (authentic report payload)
  if (typeof inv.report?.overallScore === 'number' && Number.isFinite(inv.report.overallScore)) {
    return Math.round(inv.report.overallScore);
  }
  // 3. Database column overall_score
  if (typeof inv.overall_score === 'number' && Number.isFinite(inv.overall_score)) {
    return Math.round(inv.overall_score);
  }
  // 4. Report snake_case overall_score
  if (typeof inv.report?.overall_score === 'number' && Number.isFinite(inv.report.overall_score)) {
    return Math.round(inv.report.overall_score);
  }
  // 5. Parsed report_json
  if (typeof inv.report_json === 'string') {
    try {
      const parsed = JSON.parse(inv.report_json);
      if (typeof parsed?.overallScore === 'number' && Number.isFinite(parsed.overallScore)) {
        return Math.round(parsed.overallScore);
      }
      if (typeof parsed?.overall_score === 'number' && Number.isFinite(parsed.overall_score)) {
        return Math.round(parsed.overall_score);
      }
    } catch (e) {}
  }
  return 0;
}

export const resolveInterviewScore = getSessionScore;

export function getSessionTimestamp(inv) {
  if (!inv) return 0;
  const dateStr = inv.date || inv.created_at || inv.report?.date || inv.report?.created_at;
  if (!dateStr) return 0;
  const time = new Date(dateStr).getTime();
  return Number.isNaN(time) ? 0 : time;
}

/**
 * Validates whether two session attempts possess identical configurations.
 */
export function isConfigurationMatch(a, b) {
  if (!a || !b) return false;

  // 1. Role must match
  if (getSessionRole(a) !== getSessionRole(b)) return false;

  // 2. Custom role name must match (when applicable)
  if (getSessionCustomRole(a) !== getSessionCustomRole(b)) return false;

  // 3. Difficulty / level must match
  if (getSessionLevel(a) !== getSessionLevel(b)) return false;

  // 4. Duration must match
  if (getSessionDuration(a) !== getSessionDuration(b)) return false;

  // 5. Interview mode must match
  if (getSessionMode(a) !== getSessionMode(b)) return false;

  // 6. Standard vs Resume-based interview must match
  if (isSessionResumeBased(a) !== isSessionResumeBased(b)) return false;

  // 7. Resume context / project identifier must match (when applicable)
  if (isSessionResumeBased(a) && getSessionResumeContext(a) !== getSessionResumeContext(b)) {
    return false;
  }

  return true;
}

/**
 * Resolves the parent session ID for an interview attempt.
 * 
 * Supports both:
 * 1. Explicit verified parent pointer (parent_attempt_id / parentAttemptId).
 * 2. Reliable historical attempt relationship resolution:
 *    When parent_attempt_id is missing, an attempt N (N > 1) is matched to the verified
 *    predecessor attempt N - 1 of identical configuration, user, and earlier completion.
 */
export function resolveParentId(inv, allUserInterviews, idMap) {
  if (!inv) return null;

  // 1. Explicit verified parent pointer
  const explicitParent = getSessionParentAttemptId(inv);
  if (explicitParent && idMap.has(explicitParent)) {
    const parent = idMap.get(explicitParent);
    if (isConfigurationMatch(inv, parent) && getSessionUserId(inv) === getSessionUserId(parent)) {
      return explicitParent;
    }
  }

  // 2. Verified historical attempt progression relationship
  // Only applicable if session has a verified attempt progression index > 1
  const attemptNum = getSessionAttemptNumber(inv);
  if (attemptNum > 1) {
    const invTime = getSessionTimestamp(inv);

    // Filter candidate predecessors belonging to the same user with matching configuration
    const predecessors = allUserInterviews.filter(cand => {
      if (!cand || String(cand.id) === String(inv.id)) return false;
      if (getSessionUserId(cand) !== getSessionUserId(inv)) return false;
      if (!isConfigurationMatch(inv, cand)) return false;
      const candTime = getSessionTimestamp(cand);
      // Predecessor must have been completed prior to this attempt
      if (invTime > 0 && candTime > 0 && candTime >= invTime) return false;
      return true;
    });

    if (predecessors.length > 0) {
      // Find candidate with attempt_number === attemptNum - 1
      const exactCandidate = predecessors.find(c => getSessionAttemptNumber(c) === attemptNum - 1);
      if (exactCandidate) {
        return String(exactCandidate.id);
      }

      // Check if attemptProgression trajectory records a1Score matching a predecessor
      const progression = inv.report?.attemptProgression;
      if (progression && typeof progression.a1Score === 'number') {
        const matchedByScore = predecessors.find(c => Math.abs(getSessionScore(c) - progression.a1Score) < 0.1);
        if (matchedByScore) return String(matchedByScore.id);
      }

      // Fallback to immediately preceding chronological attempt of identical configuration
      predecessors.sort((a, b) => getSessionTimestamp(b) - getSessionTimestamp(a));
      return String(predecessors[0].id);
    }
  }

  return null;
}

/**
 * Groups an array of raw interview sessions into verified interview series.
 * 
 * @param {Array} rawInterviews - All available session records
 * @param {string|null} targetUserId - Active authenticated user ID
 * @returns {Array} List of grouped interview series
 */
export function groupInterviewSessions(rawInterviews = [], targetUserId = null) {
  if (!Array.isArray(rawInterviews) || rawInterviews.length === 0) {
    return [];
  }

  // 1. Strict User Isolation: Filter sessions to authenticated user
  const userInterviews = targetUserId
    ? rawInterviews.filter(inv => {
        const uId = getSessionUserId(inv);
        return !uId || uId === targetUserId;
      })
    : [...rawInterviews];

  if (userInterviews.length === 0) return [];

  // Index sessions by ID for parent lookups
  const idMap = new Map();
  userInterviews.forEach(inv => {
    if (inv && inv.id) {
      idMap.set(String(inv.id), inv);
    }
  });

  // 2. Resolve Series Root for Each Session
  // Traces up parent links ensuring strict configuration and user continuity.
  function findSeriesRoot(inv) {
    const visited = new Set([String(inv.id)]);
    let curr = inv;

    while (curr) {
      const parentId = resolveParentId(curr, userInterviews, idMap);
      if (!parentId || !idMap.has(parentId)) {
        break;
      }

      const parent = idMap.get(parentId);

      // Cycle prevention
      if (visited.has(String(parent.id))) {
        break;
      }

      // User boundary verification
      const currUser = getSessionUserId(curr);
      const parentUser = getSessionUserId(parent);
      if (currUser && parentUser && currUser !== parentUser) {
        break;
      }

      // Configuration matching verification
      if (!isConfigurationMatch(curr, parent) || !isConfigurationMatch(inv, parent)) {
        break;
      }

      visited.add(String(parent.id));
      curr = parent;
    }

    return String(curr.id);
  }

  // Group attempts into series buckets
  const seriesBuckets = new Map();
  userInterviews.forEach(inv => {
    const rootId = findSeriesRoot(inv);
    if (!seriesBuckets.has(rootId)) {
      seriesBuckets.set(rootId, []);
    }
    seriesBuckets.get(rootId).push(inv);
  });

  // 3. Process Each Series Bucket
  const formattedSeries = [];

  seriesBuckets.forEach((attempts, rootId) => {
    // Sort attempts strictly chronologically: Oldest = Attempt 1, Next = Attempt 2...
    attempts.sort((a, b) => {
      const timeDiff = getSessionTimestamp(a) - getSessionTimestamp(b);
      if (timeDiff !== 0) return timeDiff;
      const numA = Number(a.attempt_number || a.attemptNumber || 1);
      const numB = Number(b.attempt_number || b.attemptNumber || 1);
      return numA - numB;
    });

    // Decorate each attempt with clean full labels: Attempt 1, Attempt 2, etc. (never A1/A2/A3)
    const decoratedAttempts = attempts.map((att, idx) => {
      const attemptIndex = idx + 1;
      const isLatest = idx === attempts.length - 1;
      return {
        ...att,
        attemptIndex,
        displayLabel: `Attempt ${attemptIndex}`,
        isLatest
      };
    });

    const latestAttempt = decoratedAttempts[decoratedAttempts.length - 1];
    const rootAttempt = idMap.get(rootId) || decoratedAttempts[0];

    const seriesTitle = latestAttempt.title || rootAttempt.title || 'Technical Interview Session';
    const seriesCategory = latestAttempt.category || rootAttempt.category || 'General';
    const seriesRole = latestAttempt.role || rootAttempt.role || 'Software Engineer';
    const seriesLevel = latestAttempt.level || rootAttempt.level || 'Mid Level';
    const seriesDuration = getSessionDuration(latestAttempt);
    const seriesScore = getSessionScore(latestAttempt);
    const seriesDate = latestAttempt.date || latestAttempt.created_at || latestAttempt.report?.date || latestAttempt.report?.created_at || new Date().toISOString();
    const seriesMetrics = latestAttempt.metrics || latestAttempt.report?.metrics || {};

    formattedSeries.push({
      id: rootId,
      seriesId: rootId,
      title: seriesTitle,
      category: seriesCategory,
      role: seriesRole,
      level: seriesLevel,
      duration: seriesDuration,
      mode: latestAttempt.mode || rootAttempt.mode || 'Technical Practice',
      totalAttempts: decoratedAttempts.length,
      attempts: decoratedAttempts,
      latestAttempt: latestAttempt,
      latestScore: seriesScore,
      latestDate: seriesDate,
      latestMetrics: seriesMetrics,
      isMultiAttempt: decoratedAttempts.length > 1
    });
  });

  // 4. Sort Series by latest activity descending (newest series first)
  formattedSeries.sort((a, b) => {
    return getSessionTimestamp(b.latestAttempt) - getSessionTimestamp(a.latestAttempt);
  });

  return formattedSeries;
}
