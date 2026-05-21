import { useEffect, useState, SubmitEvent, ChangeEvent } from "react";
import { Button } from "@/components/ui/button"
import {
    ButtonGroup,
    ButtonGroupSeparator,
} from "@/components/ui/button-group"
import { Skeleton } from "@/components/ui/skeleton";
import { useUserStore } from "@/store/useUserStore"
import { toast } from "sonner"
import UploadDialog from "../dialogs/upload-dialog";
import EditProfileDialog from "../dialogs/edit-profile-dialog";
import { api } from "@/lib/apiClient";
import { DEFAULT_PROFILE_IMAGE } from "@/lib/profileImage";

export default function ProfileHeader() {
    const user = useUserStore((state) => state.user);
    const profileImage = user?.profile.profile_picture || DEFAULT_PROFILE_IMAGE;
    const displayName =
        user?.profile.display_name?.trim() ||
        user?.profile.username?.trim() ||
        "";
    const email = user?.auth_user.email || "";
    const username = user?.profile.username?.trim() || "";
    const description = user?.profile.description?.trim() || "";
    const joinedLabel = user?.profile.created_at
        ? new Date(user.profile.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
        : "";
    const [isProfileLoading, setIsProfileLoading] = useState(true);
    const hasHydrated = useUserStore((state) => state.hasHydrated);
    const setUser = useUserStore((state) => state.setUser);

    function showToastWarning(feature: string) {
        return toast.warning(`Unavailable, ${feature} feature still in progress.`)
    }

    useEffect(() => {
        if (!hasHydrated) {
            return;
        }

        if (user) {
            setIsProfileLoading(false);
            return;
        }

        let isMounted = true;

        async function hydrateProfileState() {
            try {
                const response = await api.get("/api/user/me");

                if (!isMounted) {
                    return;
                }

                setUser(response.data);
            } catch {
                if (!isMounted) {
                    return;
                }

                setIsProfileLoading(false);
            }
        }

        void hydrateProfileState();

        return () => {
            isMounted = false;
        };
    }, [hasHydrated, setUser, user]);

    return (
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
                <div className="mx-auto flex h-28 w-28 shrink-0 items-center justify-center
            overflow-hidden rounded-full bg-[#111111] text-5xl font-semibold uppercase
            tracking-[0.16em] text-stone-100 sm:mx-0 sm:h-32 sm:w-32">
                    <img
                        src={profileImage}
                        alt={`${displayName} profile`}
                        className="h-full w-full object-cover"
                    />
                </div>

                <div className="min-w-0 pt-1 text-center sm:text-left">
                    <h1 className="text-[15px] font-semibold leading-tight text-stone-50 sm:text-[24px]">
                        {displayName || (isProfileLoading ? <Skeleton className="mt-[10px] h-[30px] w-[150px] rounded-full mx-auto sm:mx-0" /> : "")}
                    </h1>
                    {username ? (
                        <p className="mt-1 text-sm text-stone-500 sm:text-base">{'@' + username}</p>
                    ) : null}

                    {(description || email || joinedLabel) ? (
                        <div className="mt-4 space-y-1.5 text-sm leading-6 text-stone-100 sm:text-[15px]">
                            {description ? <p>{description}</p> : null}
                            {email ? <p>contact: {email}</p> : null}
                            {joinedLabel ? <p className="text-stone-400">joined {joinedLabel}</p> : null}
                        </div>
                    ) : null}
                    {!description && !email && !joinedLabel && isProfileLoading ? (
                        (
                            <div>
                                <Skeleton className="mt-[12px] h-[20px] w-[200px] rounded-full mx-auto sm:mx-0" />
                                <Skeleton className="mt-[12px] h-[20px] w-[180px] rounded-full mx-auto sm:mx-0" />
                            </div>
                        )
                    ) : null}

                </div>
            </div>

            <div className="flex justify-center sm:justify-end items-center mt-2">
                <ButtonGroup>
                    <EditProfileDialog />
                    <ButtonGroupSeparator />
                    <UploadDialog />
                </ButtonGroup>

            </div>
        </div>
    )
}
