export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterGroup {
  title: string;
  controlName: 'level' | 'mode' | 'category' | 'eventType';
  options: readonly FilterOption[];
}

export const LEVEL_OPTIONS: readonly FilterOption[] = [
  { label: 'Beginner', value: 'Beginner' },
  { label: 'Intermediate', value: 'Intermediate' },
  { label: 'Advanced', value: 'Advanced' },
];

export const MODE_OPTIONS: readonly FilterOption[] = [
  { label: 'Online', value: 'Online' },
  { label: 'Offline', value: 'Offline' },
  { label: 'Hybrid', value: 'Hybrid' },
];

export const CATEGORY_OPTIONS: readonly FilterOption[] = [
  { label: 'Artificial Intelligence', value: 'Artificial Intelligence' },
  { label: 'Machine Learning', value: 'Machine Learning' },
  { label: 'Data Science', value: 'Data Science' },
  { label: 'Cloud Computing', value: 'Cloud Computing' },
  { label: 'DevOps', value: 'DevOps' },
  { label: 'Cybersecurity', value: 'Cybersecurity' },
  { label: 'Web Development', value: 'Web Development' },
  { label: 'Backend Development', value: 'Backend Development' },
  { label: 'Frontend Development', value: 'Frontend Development' },
];

export const EVENT_TYPE_OPTIONS: readonly FilterOption[] = [
  { label: 'Workshop', value: 'Workshop' },
  { label: 'Conference', value: 'Conference' },
  { label: 'Networking Event', value: 'Networking Event' },
  { label: 'Webinar', value: 'Webinar' },
  { label: 'Bootcamp', value: 'Bootcamp' },
];

export const TECHNOLOGY_OPTIONS: readonly FilterOption[] = [
  { label: '.NET', value: '.NET' },
  { label: 'Java', value: 'Java' },
  { label: 'Python', value: 'Python' },
  { label: 'React', value: 'React' },
  { label: 'Angular', value: 'Angular' },
  { label: 'Node.js', value: 'Node.js' },
];

export const FILTER_GROUPS: readonly FilterGroup[] = [
  { title: 'Level', controlName: 'level', options: LEVEL_OPTIONS },
  { title: 'Mode', controlName: 'mode', options: MODE_OPTIONS },
  { title: 'Category', controlName: 'category', options: CATEGORY_OPTIONS },
  { title: 'Event Type', controlName: 'eventType', options: EVENT_TYPE_OPTIONS },
];
