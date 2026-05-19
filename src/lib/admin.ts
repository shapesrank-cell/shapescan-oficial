/**
 * Lista de emails que sempre têm acesso de super admin,
 * independente da coluna `role` na tabela profiles.
 *
 * Use isso como bypass de segurança caso o setup do banco falhe
 * ou para garantir acesso em ambientes novos sem precisar rodar SQL.
 */
export const SUPER_ADMIN_EMAILS = [
  "shapesrank@gmail.com",
  "goldenf0408@gmail.com",
];

/**
 * Retorna true se o usuário tem permissão de super admin.
 * Aceita se o email está no allowlist OU se o role no banco é 'super_admin'.
 */
export function isSuperAdmin(
  email: string | null | undefined,
  role: string | null | undefined
): boolean {
  if (email && SUPER_ADMIN_EMAILS.includes(email.toLowerCase())) return true;
  if (role === "super_admin") return true;
  return false;
}
