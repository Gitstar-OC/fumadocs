import type { HTMLAttributes } from 'react';
import { replaceOrDefault } from '@/layouts/shared';
import { cn } from '@/utils/cn';
import { getLinks, type BaseLayoutProps } from './shared';
import { NavProvider, Title } from '@/components/layout/nav';
import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  Navbar,
  NavbarLink,
  NavbarMenu,
  NavbarMenuContent,
  NavbarMenuItem,
  NavbarMenuTrigger,
} from '@/layouts/home/navbar';
import { BaseLinkItem, type LinkItemType } from '@/layouts/links';
import {
  LargeSearchToggle,
  SearchToggle,
} from '@/components/layout/search-toggle';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import {
  LanguageToggle,
  LanguageToggleText,
} from '@/components/layout/language-toggle';
import { ChevronDown, Languages } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { SearchOnly } from '@/contexts/search';
import Link from 'fumadocs-core/link';
import { cva } from 'class-variance-authority';

export type HomeLayoutProps = BaseLayoutProps & HTMLAttributes<HTMLElement>;

export function HomeLayout({
  nav: { transparentMode, enableSearch = true, ...nav } = {},
  links = [],
  githubUrl,
  i18n = false,
  disableThemeSwitch,
  ...props
}: HomeLayoutProps): React.ReactElement {
  const finalLinks = getLinks(links, githubUrl);
  const navItems = finalLinks.filter((item) =>
    ['nav', 'all'].includes(item.on ?? 'all'),
  );
  const menuItems = finalLinks.filter((item) =>
    ['menu', 'all'].includes(item.on ?? 'all'),
  );

  return (
    <NavProvider transparentMode={transparentMode}>
      <main
        id="nd-home-layout"
        {...props}
        className={cn(
          'flex flex-1 flex-col pt-[var(--fd-nav-height)] [--fd-nav-height:48px] lg:[--fd-nav-height:56px]',
          props.className,
        )}
      >
        {replaceOrDefault(
          nav,
          <>
            <div
              aria-hidden="true"
              className="fixed inset-x-0 top-[var(--fd-banner-height)] z-40 h-6 bg-fd-background"
              style={{
                maskImage: 'linear-gradient(to bottom,white,transparent)',
              }}
            />
            <Navbar>
              <Title title={nav.title} url={nav.url} />
              {nav.children}
              <NavigationMenuList className="flex flex-row items-center gap-2 max-sm:hidden">
                {navItems
                  .filter((item) => !isSecondary(item))
                  .map((item, i) => (
                    <NavbarLinkItem key={i} item={item} className="text-sm" />
                  ))}
              </NavigationMenuList>
              <div className="flex flex-1 flex-row items-center justify-end lg:gap-1.5">
                {enableSearch ? (
                  <SearchOnly>
                    <SearchToggle className="lg:hidden" />
                    <LargeSearchToggle className="w-full max-w-[240px] max-lg:hidden" />
                  </SearchOnly>
                ) : null}
                {!disableThemeSwitch ? (
                  <ThemeToggle className="max-lg:hidden" />
                ) : null}
                {i18n ? (
                  <LanguageToggle className="-me-1.5 max-lg:hidden">
                    <Languages className="size-5" />
                  </LanguageToggle>
                ) : null}
                {navItems.filter(isSecondary).map((item, i) => (
                  <NavbarLinkItem
                    key={i}
                    item={item}
                    className="-me-1.5 list-none max-lg:hidden"
                  />
                ))}
                <NavigationMenuItem className="list-none lg:hidden">
                  <NavigationMenuTrigger
                    className={cn(
                      buttonVariants({
                        size: 'icon',
                        color: 'ghost',
                      }),
                      'group -me-2',
                    )}
                  >
                    <ChevronDown className="size-3 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="flex flex-col p-4 sm:flex-row sm:items-center sm:justify-end">
                    {menuItems
                      .filter((item) => !isSecondary(item))
                      .map((item, i) => (
                        <MenuLinkItem
                          key={i}
                          item={item}
                          className="sm:hidden"
                        />
                      ))}
                    <div className="-ms-1.5 flex flex-row items-center gap-1.5 max-sm:mt-2">
                      {i18n ? (
                        <LanguageToggle className="me-auto">
                          <Languages className="size-5" />
                          <LanguageToggleText />
                          <ChevronDown className="size-3 text-fd-muted-foreground" />
                        </LanguageToggle>
                      ) : null}
                      <div className="flex flex-row items-center empty:hidden">
                        {menuItems.filter(isSecondary).map((item, i) => (
                          <MenuLinkItem key={i} item={item} />
                        ))}
                      </div>
                      {!disableThemeSwitch ? (
                        <ThemeToggle className={cn(!i18n && 'ms-auto')} />
                      ) : null}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </div>
            </Navbar>
          </>,
          {
            items: finalLinks,
            i18n,
            enableSearch,
            disableThemeSwitch,
            ...nav,
          },
        )}
        {props.children}
      </main>
    </NavProvider>
  );
}

function NavbarLinkItem({
  item,
  ...props
}: {
  item: LinkItemType;
  className?: string;
}) {
  if (item.type === 'custom') return <div {...props}>{item.children}</div>;

  if (item.type === 'menu') {
    return (
      <NavbarMenu>
        <NavbarMenuTrigger {...props}>
          {item.url ? <Link href={item.url}>{item.text}</Link> : item.text}
        </NavbarMenuTrigger>
        <NavbarMenuContent>
          {item.items.map((child, j) => {
            if (child.type === 'custom')
              return <div key={j}>{child.children}</div>;

            const { banner, footer, ...rest } = child.menu ?? {};

            return (
              <NavbarMenuItem key={j} href={child.url} {...rest}>
                {banner ??
                  (child.icon ? (
                    <div className="w-fit rounded-md border bg-fd-muted p-1 [&_svg]:size-4">
                      {child.icon}
                    </div>
                  ) : null)}
                <p className="-mb-1 text-sm font-medium">{child.text}</p>
                {child.description ? (
                  <p className="text-[13px] text-fd-muted-foreground">
                    {child.description}
                  </p>
                ) : null}
                {footer}
              </NavbarMenuItem>
            );
          })}
        </NavbarMenuContent>
      </NavbarMenu>
    );
  }

  return (
    <NavbarLink
      {...props}
      item={item}
      variant={item.type}
      aria-label={item.type === 'icon' ? item.label : undefined}
    >
      {item.type === 'icon' ? item.icon : item.text}
    </NavbarLink>
  );
}

const menuItemVariants = cva(undefined, {
  variants: {
    variant: {
      main: 'inline-flex items-center gap-2 py-1.5 transition-colors hover:text-fd-popover-foreground/50 data-[active=true]:font-medium data-[active=true]:text-fd-primary [&_svg]:size-4',
      icon: buttonVariants({
        size: 'icon',
        color: 'ghost',
      }),
      button: buttonVariants({
        color: 'secondary',
        className: 'gap-1.5 [&_svg]:size-4',
      }),
    },
  },
  defaultVariants: {
    variant: 'main',
  },
});

function MenuLinkItem({
  item,
  ...props
}: {
  item: LinkItemType;
  className?: string;
}) {
  if (item.type === 'custom')
    return <div className={cn('grid', props.className)}>{item.children}</div>;

  if (item.type === 'menu')
    return (
      <div className={cn('mb-4 flex flex-col', props.className)}>
        <p className="mb-1 text-sm text-fd-muted-foreground">
          {item.url ? (
            <NavigationMenuLink asChild>
              <Link href={item.url}>
                {item.icon}
                {item.text}
              </Link>
            </NavigationMenuLink>
          ) : (
            <>
              {item.icon}
              {item.text}
            </>
          )}
        </p>
        {item.items.map((child, i) => (
          <MenuLinkItem key={i} item={child} />
        ))}
      </div>
    );

  return (
    <NavigationMenuLink asChild>
      <BaseLinkItem
        item={item}
        className={cn(
          menuItemVariants({ variant: item.type }),
          props.className,
        )}
        aria-label={item.type === 'icon' ? item.label : undefined}
      >
        {item.icon}
        {item.type === 'icon' ? undefined : item.text}
      </BaseLinkItem>
    </NavigationMenuLink>
  );
}

function isSecondary(item: LinkItemType): boolean {
  return (
    ('secondary' in item && item.secondary === true) || item.type === 'icon'
  );
}
