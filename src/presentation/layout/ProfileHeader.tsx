import { Spinner } from "@heroui/react";
import { useTexts } from "@/presentation/texts/useTexts";
import type { ProfileState } from "@/presentation/layout/profileState";

export function ProfileAvatar({ profile }: { readonly profile: ProfileState }) {
  const { common } = useTexts();

  if (profile.status === "loading") {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
        <Spinner size="sm" aria-label={common.loading} />
      </div>
    );
  }

  if (profile.status === "unavailable") {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-default-100 text-default-500 font-bold text-base leading-none">
        ?
      </div>
    );
  }

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white dark:text-zinc-950 font-bold text-base leading-none tracking-wider shadow-sm transition-colors duration-200">
      <span className="select-none">{profile.initials}</span>
    </div>
  );
}

export function ProfileSummary({ profile }: { readonly profile: ProfileState }) {
  const { layout: texts } = useTexts();

  if (profile.status === "loading") {
    return null;
  }

  if (profile.status === "unavailable") {
    return <p className="text-sm text-default-500">{texts.profileUnavailable}</p>;
  }

  return (
    <div className="min-w-0">
      <p className="break-all font-bold text-base">{profile.name}</p>
      {profile.email && profile.email !== profile.name ? (
        <p className="break-all text-xs text-default-500">{profile.email}</p>
      ) : null}
    </div>
  );
}
