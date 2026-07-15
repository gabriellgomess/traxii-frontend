import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faRightLeft,
  faReceipt,
  faUser,
  faCircleQuestion,
  faRightFromBracket,
  faMagnifyingGlass,
  faBell,
  faCheck,
  faComment,
  type IconDefinition
} from '@fortawesome/free-solid-svg-icons';
import { faPix } from '@fortawesome/free-brands-svg-icons';

/** Nomes de domínio da aplicação → ícones do Font Awesome 6 */
const ICONS: Record<string, IconDefinition> = {
  home: faHome,
  pix: faPix,
  ted: faRightLeft,
  extrato: faReceipt,
  dados: faUser,
  ajuda: faCircleQuestion,
  logout: faRightFromBracket,
  search: faMagnifyingGlass,
  bell: faBell,
  check: faCheck,
  chat: faComment,
} as const;

export type IconName = keyof typeof ICONS;

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 22, className }: IconProps) {
  const icon = ICONS[name];
  if (!icon) return null;
  return (
    <FontAwesomeIcon
      icon={icon}
      style={{ width: size, height: size }}
      className={className}
      aria-hidden="true"
    />
  );
}
