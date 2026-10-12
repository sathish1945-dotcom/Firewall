import { ProtectedApp, UserGoal, RuleConfiguration } from '../../types';

export const AVAILABLE_APPS: ProtectedApp[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    packageName: 'com.instagram.android',
    category: 'social',
    iconColor: '#E1306C',
    iconBg: '#FDF2F8',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    packageName: 'com.google.android.youtube',
    category: 'video',
    iconColor: '#FF0000',
    iconBg: '#FEF2F2',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    packageName: 'com.zhiliaoapp.musically',
    category: 'video',
    iconColor: '#000000',
    iconBg: '#F1F5F9',
  },
  {
    id: 'reddit',
    name: 'Reddit',
    packageName: 'com.reddit.frontpage',
    category: 'social',
    iconColor: '#FF4500',
    iconBg: '#FFF7ED',
  },
  {
    id: 'x',
    name: 'X (Twitter)',
    packageName: 'com.twitter.android',
    category: 'social',
    iconColor: '#0F172A',
    iconBg: '#F8FAFC',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    packageName: 'com.facebook.katana',
    category: 'social',
    iconColor: '#1877F2',
    iconBg: '#EFF6FF',
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    packageName: 'com.snapchat.android',
    category: 'social',
    iconColor: '#EAB308',
    iconBg: '#FEFCE8',
  },
  {
    id: 'amazon',
    name: 'Amazon Shopping',
    packageName: 'com.amazon.mShop.android.shopping',
    category: 'shopping',
    iconColor: '#D97706',
    iconBg: '#FFFBEB',
  },
  {
    id: 'mobile_game',
    name: 'Royal Clash / Games',
    packageName: 'com.supercell.clashroyale',
    category: 'gaming',
    iconColor: '#7C3AED',
    iconBg: '#F5F3FF',
  },
];

export const PRESET_GOALS: UserGoal[] = [
  {
    id: 'social_scroll',
    title: 'Stop automatic social scrolling',
    description: 'Notice when you tap into feeds without an intended purpose.',
  },
  {
    id: 'short_video',
    title: 'Reduce short-video checking',
    description: 'Catch rapid loops before losing 30+ minutes in autoplay.',
  },
  {
    id: 'gaming_impulse',
    title: 'Reduce gaming impulses',
    description: 'Pause before reopening games right after closing them.',
  },
  {
    id: 'shopping_browsing',
    title: 'Reduce shopping/browsing habits',
    description: 'Intervene on bored late-night or reflexive checkout searches.',
  },
  {
    id: 'improve_focus',
    title: 'Improve daytime focus',
    description: 'Protect designated work and study blocks from quick distractions.',
  },
];

export const DEFAULT_RULES: RuleConfiguration = {
  repeatedOpens: {
    enabled: true,
    maxOpens: 3,
    windowMinutes: 15,
  },
  quickReopen: {
    enabled: true,
    windowMinutes: 2,
  },
  focusPeriod: {
    enabled: true,
    startTime: '09:00',
    endTime: '17:00',
    daysOfWeek: [1, 2, 3, 4, 5],
  },
  lateNight: {
    enabled: true,
    startTime: '23:00',
    endTime: '05:00',
  },
  cooldownMinutes: 15,
};
