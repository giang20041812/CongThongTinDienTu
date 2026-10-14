/** Secret-ish base path of the admin app (kept out of /admin on purpose so the page is not trivially guessable). */
export const ADMIN_PATH = '/admindangtranduc';
export const ADMIN_LOGIN_PATH = `${ADMIN_PATH}/login`;
export const isAdminPath = (pathname: string) => pathname === ADMIN_PATH || pathname.startsWith(`${ADMIN_PATH}/`);
