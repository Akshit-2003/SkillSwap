const pendingSkillPattern = /\s*\[Pending Approval.*\]\s*$/i;

const normalizeSkillName = (skill = '') => skill.replace(pendingSkillPattern, '').trim();

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = {
  pendingSkillPattern,
  normalizeSkillName,
  escapeRegex,
};
