import type { Route } from 'next';
import type { WorkspaceSurface } from '@/lib/domain/types';

export const skossCoreRoutes = {
  admin: '/admin',
  adminSetup: '/admin/setup',
  adminSetupImports: '/admin/setup#imports',
  adminModules: '/admin/modules',
} as const satisfies Record<string, Route>;

export const skossBootstrapRoutes = {
  entry: '/entry',
  bootstrap: '/bootstrap',
  bootstrapStart: '/bootstrap?step=1',
  login: '/login',
} as const satisfies Record<string, Route>;

export const skossinaRoutes = {
  home: '/',
  timeline: '/timeline',
  orders: '/orders',
  customers: '/customers',
  production: '/production',
  handoff: '/handoff',
  preferences: '/preferences',
} as const satisfies Record<string, Route>;

export type SkossCoreRoute = (typeof skossCoreRoutes)[keyof typeof skossCoreRoutes];
export type SkossBootstrapRoute = (typeof skossBootstrapRoutes)[keyof typeof skossBootstrapRoutes];
export type SkossinaRoute = (typeof skossinaRoutes)[keyof typeof skossinaRoutes];
export type AppPlaneRoute = SkossCoreRoute | SkossBootstrapRoute | SkossinaRoute;

export type OperatorWorkspaceSurface = Exclude<WorkspaceSurface, 'admin' | 'preferences'>;

export const operatorWorkspaceRoutes = {
  home: skossinaRoutes.home,
  timeline: skossinaRoutes.timeline,
  orders: skossinaRoutes.orders,
  customers: skossinaRoutes.customers,
  production: skossinaRoutes.production,
  handoff: skossinaRoutes.handoff,
} as const satisfies Record<OperatorWorkspaceSurface, SkossinaRoute>;

export const adminPlaneNavItems = [
  {
    href: skossCoreRoutes.admin,
    labelKey: 'nav.setup',
    active: (pathname: string) => pathname === skossCoreRoutes.admin,
  },
  {
    href: skossCoreRoutes.adminSetup,
    labelKey: 'setup.sections.businessSetup',
    active: (pathname: string) => pathname.startsWith(skossCoreRoutes.adminSetup),
  },
  {
    href: skossCoreRoutes.adminModules,
    labelKey: 'setup.sections.preferencesSystem',
    active: (pathname: string) => pathname.startsWith(skossCoreRoutes.adminModules),
  },
] as const;

export type ApplicationPlane = 'bootstrap' | 'admin' | 'operator';

export function getApplicationPlane(pathname: string): ApplicationPlane {
  if (pathname.startsWith(skossBootstrapRoutes.entry) || pathname.startsWith(skossBootstrapRoutes.bootstrap)) {
    return 'bootstrap';
  }

  if (pathname === skossCoreRoutes.admin || pathname.startsWith(`${skossCoreRoutes.admin}/`)) {
    return 'admin';
  }

  return 'operator';
}
