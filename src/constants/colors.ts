import { QuestCategory } from '../types';

export const Colors = {
  background: '#0D1B2A',
  card: '#1A2E45',
  cardLight: '#223650',
  primary: '#00D4AA',
  primaryDark: '#00A882',
  secondary: '#4A9EFF',
  gold: '#FFD700',
  textPrimary: '#FFFFFF',
  textSecondary: '#8899AA',
  textMuted: '#4A6080',
  border: '#2A4060',
  danger: '#FF6B6B',
  success: '#00D4AA',
  warning: '#FFB347',
  overlay: 'rgba(0,0,0,0.6)',

  gradientPrimary: ['#00D4AA', '#4A9EFF'] as [string, string],
  gradientDark: ['#0D1B2A', '#1A2E45'] as [string, string],
  gradientCard: ['#1A2E45', '#223650'] as [string, string],

  categoryColors: {
    health: '#FF6B9D',
    career: '#4A9EFF',
    education: '#FFD700',
    personal: '#00D4AA',
    finance: '#A78BFA',
    relationships: '#FF8C42',
  } as Record<QuestCategory, string>,

  categoryGlow: {
    health: 'rgba(255,107,157,0.3)',
    career: 'rgba(74,158,255,0.3)',
    education: 'rgba(255,215,0,0.3)',
    personal: 'rgba(0,212,170,0.3)',
    finance: 'rgba(167,139,250,0.3)',
    relationships: 'rgba(255,140,66,0.3)',
  } as Record<QuestCategory, string>,
};
