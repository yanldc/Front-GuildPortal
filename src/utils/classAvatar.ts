const CLASS_AVATARS: Record<string, string> = {
  'Assassin': '/avatars/assassin.png',
  'Night Ranger': '/avatars/night-ranger.png',
  'Berserker': '/avatars/berserker.png',
  'Deathbringer': '/avatars/deathbringer.png',
  'Divine Caster': '/avatars/divine-caster.png',
  'Elementalist': '/avatars/elementalist.png',
  'Destroyer': '/avatars/destroyer.png',
  'Gunslinger': '/avatars/gunslinger.png',
  'Vanguard': '/avatars/vanguard.png',
  'Warlord': '/avatars/warlord.png',
};

const DEFAULT_AVATAR = '/avatars/default.png';

export function getClassAvatar(className: string): string {
  return CLASS_AVATARS[className] || DEFAULT_AVATAR;
}
