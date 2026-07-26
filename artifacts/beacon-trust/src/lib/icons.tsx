/**
 * Centralised icon exports — Font Awesome Free replaces lucide-react.
 * All components import from here so swapping the library only touches this file.
 */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { HTMLAttributes, CSSProperties } from 'react';

// ─── solid icons ─────────────────────────────────────────────────────────────
import {
  faEnvelopeCircleCheck,
  faTrashCan,
  faArrowLeft,
  faArrowRight,
  faArrowTrendUp,
  faArrowTrendDown,
  faRightLeft,
  faBell,
  faBolt,
  faBriefcase,
  faBuilding,
  faCalculator,
  faCalendar,
  faCamera,
  faChartColumn,
  faChartLine,
  faChartPie,
  faCheck,
  faCircleCheck,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faChevronUp,
  faCircle,
  faCircleExclamation,
  faCircleInfo,
  faCircleQuestion,
  faCircleUser,
  faCircleXmark,
  faClock,
  faClockRotateLeft,
  faCommentDots,
  faCreditCard,
  faDollarSign,
  faDownload,
  faEllipsis,
  faEnvelope,
  faEye,
  faEyeSlash,
  faFileLines,
  faFilter,
  faGauge,
  faGear,
  faGlobe,
  faGripVertical,
  faHeartPulse,
  faKey,
  faLandmark,
  faLocationDot,
  faLock,
  faLockOpen,
  faMagnifyingGlass,
  faMinus,
  faPaperPlane,
  faPhone,
  faPlay,
  faPlus,
  faRepeat,
  faRightFromBracket,
  faRightToBracket,
  faRotate,
  faShield,
  faShieldHalved,
  faSnowflake,
  faSpinner,
  faStar,
  faTableColumns,
  faTicket,
  faTrash,
  faTriangleExclamation,
  faTrophy,
  faUpload,
  faUser,
  faUserPlus,
  faUsers,
  faWallet,
  faWandMagicSparkles,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

// ─── wrapper ─────────────────────────────────────────────────────────────────

interface IconProps extends HTMLAttributes<SVGElement> {
  size?: number;
  strokeWidth?: number | string; // lucide compat — ignored in FA
  color?: string;
}

function icon(def: IconDefinition) {
  const Icon = ({ size, strokeWidth: _sw, color, style, className, ...rest }: IconProps) => {
    const computedStyle: CSSProperties = size
      ? { width: size, height: size, ...(style as CSSProperties) }
      : (style as CSSProperties) ?? {};
    return (
      <FontAwesomeIcon
        icon={def}
        color={color}
        className={className}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        style={computedStyle as any}
        {...(rest as object)}
      />
    );
  };
  Icon.displayName = def.iconName;
  return Icon;
}

// ─── named exports (drop-in for lucide-react) ─────────────────────────────────

export const Activity        = icon(faHeartPulse);
export const AlertCircle     = icon(faCircleExclamation);
export const AlertTriangle   = icon(faTriangleExclamation);
export const ArrowDownRight  = icon(faArrowTrendDown);
export const ArrowLeft       = icon(faArrowLeft);
export const ArrowRight      = icon(faArrowRight);
export const ArrowRightLeft  = icon(faRightLeft);
export const ArrowUpRight    = icon(faArrowTrendUp);
export const Award           = icon(faTrophy);
export const BarChart3       = icon(faChartColumn);
export const Bell            = icon(faBell);
export const Briefcase       = icon(faBriefcase);
export const Building        = icon(faBuilding);
export const Building2       = icon(faBuilding);
export const Calculator      = icon(faCalculator);
export const Calendar        = icon(faCalendar);
export const Camera          = icon(faCamera);
export const Check           = icon(faCheck);
export const CheckCircle     = icon(faCircleCheck);
export const CheckCircle2    = icon(faCircleCheck);
export const ChevronDown     = icon(faChevronDown);
export const ChevronLeft     = icon(faChevronLeft);
export const ChevronRight    = icon(faChevronRight);
export const ChevronUp       = icon(faChevronUp);
// Aliases used by shadcn calendar component
export const ChevronDownIcon  = icon(faChevronDown);
export const ChevronLeftIcon  = icon(faChevronLeft);
export const ChevronRightIcon = icon(faChevronRight);
export const Circle          = icon(faCircle);
export const Clock           = icon(faClock);
export const CreditCard      = icon(faCreditCard);
export const DollarSign      = icon(faDollarSign);
export const Download        = icon(faDownload);
export const Eye             = icon(faEye);
export const EyeOff          = icon(faEyeSlash);
export const FileText        = icon(faFileLines);
export const Filter          = icon(faFilter);
export const Globe           = icon(faGlobe);
export const GripVertical    = icon(faGripVertical);
export const HelpCircle      = icon(faCircleQuestion);
export const History         = icon(faClockRotateLeft);
export const Info            = icon(faCircleInfo);
export const KeyRound        = icon(faKey);
export const Landmark        = icon(faLandmark);
export const LayoutDashboard = icon(faGauge);
export const LineChart       = icon(faChartLine);
export const Loader2         = icon(faSpinner);
export const Loader2Icon     = icon(faSpinner);
export const Lock            = icon(faLock);
export const LockOpen        = icon(faLockOpen);
export const LogIn           = icon(faRightToBracket);
export const LogOut          = icon(faRightFromBracket);
export const Mail            = icon(faEnvelope);
export const MapPin          = icon(faLocationDot);
export const MessageCircle   = icon(faCommentDots);
export const MessageSquare   = icon(faCommentDots);
export const Minus           = icon(faMinus);
export const MoreHorizontal  = icon(faEllipsis);
export const PanelLeftIcon   = icon(faTableColumns);
export const Phone           = icon(faPhone);
export const PieChart        = icon(faChartPie);
export const Play            = icon(faPlay);
export const Plus            = icon(faPlus);
export const RefreshCw       = icon(faRotate);
export const Repeat          = icon(faRepeat);
export const Search          = icon(faMagnifyingGlass);
export const Send            = icon(faPaperPlane);
export const Settings        = icon(faGear);
export const Shield          = icon(faShield);
export const ShieldAlert     = icon(faShieldHalved);
export const ShieldCheck     = icon(faShieldHalved);
export const Snowflake       = icon(faSnowflake);
export const Sparkles        = icon(faWandMagicSparkles);
export const ShieldPlus      = icon(faShieldHalved); // closest free-solid equivalent
export const MailCheck       = icon(faEnvelopeCircleCheck);
export const Star            = icon(faStar);
export const Trash2          = icon(faTrashCan);
export const Ticket          = icon(faTicket);
export const TrendingUp      = icon(faArrowTrendUp);
export const Upload          = icon(faUpload);
export const User            = icon(faUser);
export const UserCircle      = icon(faCircleUser);
export const UserPlus        = icon(faUserPlus);
export const Users           = icon(faUsers);
export const Wallet          = icon(faWallet);
export const X               = icon(faXmark);
export const XCircle         = icon(faCircleXmark);
export const Zap             = icon(faBolt);
