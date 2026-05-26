import { APP_SECTIONS } from '../components/chat_response/chatUtils';

export const USER_ROLES = {
  USER: 'user',
  AGENT: 'agent',
  ADMIN: 'admin',
};

const DEFAULT_ROLES_CLAIM = 'https://udemedellin.edu.co/roles';
const ROLES_CLAIM_KEY = import.meta.env.VITE_AUTH0_ROLES_CLAIM || DEFAULT_ROLES_CLAIM;

function parseEnvEmailList(value) {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

const DEFAULT_AGENT_EMAILS = 'agente@udemedellin.edu.co,agente@ejemplo.com,soporte@udemedellin.edu.co';
const DEFAULT_ADMIN_EMAILS = 'admin@udemedellin.edu.co,admin@ejemplo.com,coordinador@udemedellin.edu.co';

const AGENT_EMAILS = parseEnvEmailList(import.meta.env.VITE_SUPPORT_AGENT_EMAILS || DEFAULT_AGENT_EMAILS);
const ADMIN_EMAILS = parseEnvEmailList(import.meta.env.VITE_ADMIN_EMAILS || DEFAULT_ADMIN_EMAILS);

export function getUserRoles(user) {
  const userEmail = user?.email?.toLowerCase() || '';
  const claimedRoles = Array.isArray(user?.[ROLES_CLAIM_KEY])
    ? user[ROLES_CLAIM_KEY]
    : Array.isArray(user?.roles)
      ? user.roles
      : [];

  const roles = new Set([
    USER_ROLES.USER,
    ...claimedRoles
      .filter((role) => typeof role === 'string')
      .map((role) => role.trim().toLowerCase()),
  ]);

  if (userEmail && AGENT_EMAILS.includes(userEmail)) {
    roles.add(USER_ROLES.AGENT);
  }

  if (userEmail && ADMIN_EMAILS.includes(userEmail)) {
    roles.add(USER_ROLES.ADMIN);
    roles.add(USER_ROLES.AGENT);
  }

  if (roles.has(USER_ROLES.ADMIN)) {
    roles.add(USER_ROLES.AGENT);
  }

  return Array.from(roles);
}

export function getAvailableSections(roles = []) {
  const normalizedRoles = new Set(roles);
  const sections = [
    APP_SECTIONS.CHAT,
    APP_SECTIONS.TICKETS,
    APP_SECTIONS.CONFIG,
  ];

  if (normalizedRoles.has(USER_ROLES.AGENT) || normalizedRoles.has(USER_ROLES.ADMIN)) {
    sections.splice(2, 0, APP_SECTIONS.AGENT);
  }

  if (normalizedRoles.has(USER_ROLES.ADMIN)) {
    sections.splice(sections.length - 1, 0, APP_SECTIONS.ANALYTICS);
  }

  return sections;
}

export function isSectionAvailable(section, roles = []) {
  return getAvailableSections(roles).includes(section);
}

export function getPrimaryRoleLabel(roles = []) {
  if (roles.includes(USER_ROLES.ADMIN)) {
    return 'Administrador';
  }

  if (roles.includes(USER_ROLES.AGENT)) {
    return 'Agente de soporte';
  }

  return 'Usuario';
}
