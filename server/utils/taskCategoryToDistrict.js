// TASK CATEGORY -> DISTRICT mapping
// This is the single source of truth for how task categories contribute to district points.

const categoryToDistrict = (category) => {
  switch (category) {
    case 'health':
      return 'health';
    case 'learning':
      return 'learning';
    case 'career':
      return 'career';
    case 'finance':
      return 'finance';
    case 'social':
      return 'social';
    case 'mindfulness':
      return 'mindfulness';

    // If legacy categories exist (from current Task model), map gracefully.
    // NOTE: Current Task model categories are: workout|coding|reading|work|other
    case 'workout':
      return 'health';
    case 'coding':
      return 'learning';
    case 'reading':
      return 'learning';
    case 'work':
      return 'career';
    case 'other':
    default:
      return 'mindfulness';
  }
};


module.exports = {
  categoryToDistrict,
};

