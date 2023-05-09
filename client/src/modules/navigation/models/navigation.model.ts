export interface SBRouteData {
    title?: string;
    activeTopNav?: string;
    breadcrumbs: Breadcrumb[];
}

export interface Breadcrumb {
    text: string;
    link?: string;
    active?: boolean;
}

export interface SideNavItems {
    [index: string]: SideNavItem;
}

export interface SideNavItem {
    id?: number;
    parentId?: number | null;
    icon?: string;
    text: string;
    link?: string;
    outlet?: string;
    submenu?: SideNavItem[];
}

export interface SideNavSection {
    text?: string;
    items: string[];
}
