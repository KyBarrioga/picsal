import { useEffect, useState, SubmitEvent, ChangeEvent } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_PROFILE_IMAGE } from "@/lib/profileImage";
import { api } from "lib/apiClient";
import { useUserStore } from "store/useUserStore";
import type { UserProfile } from "@/types/user";
import { toast } from "sonner";

type PresignResponse = {
    upload_url: string;
    public_url?: string;
    object_key?: string;
};

export default function EditProfileDialog() {
    const user = useUserStore((state) => state.user);
    const setUser = useUserStore((state) => state.setUser);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [displayName, setDisplayName] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState(DEFAULT_PROFILE_IMAGE);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!isEditDialogOpen) {
            return;
        }

        resetFormState();
    }, [isEditDialogOpen, user]);

    function resetFormState() {
        setDisplayName(user?.profile.display_name?.trim() || user?.profile.username?.trim() || "");
        setDescription(user?.profile.description || "");
        setImage(null);
        setPreview(user?.profile.profile_picture || DEFAULT_PROFILE_IMAGE);
    }

    function handleDialogOpenChange(isOpen: boolean) {
        if (isSaving) {
            return;
        }

        setIsEditDialogOpen(isOpen);

        if (!isOpen) {
            resetFormState();
        }
    }

    async function handleSaveProfile(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        const normalizedDisplayName = displayName.trim();
        const normalizedDescription = description.trim();

        if (!normalizedDisplayName) {
            toast.error("Display name is required.");
            return;
        }

        setIsSaving(true);

        try {
            const profilePictureUrl = image
                ? await uploadProfileImage(image)
                : user?.profile.profile_picture || "";

            const response = await api.patch("/api/user/me", {
                display_name: normalizedDisplayName,
                description: normalizedDescription,
                profile_picture: profilePictureUrl,
            });

            const currentUser = useUserStore.getState().user;

            if (currentUser) {
                setUser(mergeUpdatedUser(currentUser, response.data));
            }

            setImage(null);
            setIsEditDialogOpen(false);
            toast.success("Profile updated.");
        } catch (error) {
            console.error("Profile update failed", error);
            toast.error(getErrorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
        const selectedImage = event.target.files?.[0];

        if (!selectedImage) {
            return;
        }

        setImage(selectedImage);
        setPreview(URL.createObjectURL(selectedImage));
    }

    return (
        <Dialog open={isEditDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
                <Button variant="secondary">
                    Edit Profile
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <form onSubmit={handleSaveProfile}>
                    <DialogHeader className="mb-3">
                        <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>

                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="profile-picture">Display Image</FieldLabel>
                            <div className="flex items-center gap-3">
                                <img
                                    src={preview}
                                    alt="Profile preview"
                                    className="h-20 w-20 shrink-0 rounded-full border border-line object-cover"
                                />
                                <Input
                                    id="profile-picture"
                                    type="file"
                                    accept="image/png, image/jpeg"
                                    onChange={handleImageChange}
                                    disabled={isSaving}
                                />
                            </div>
                        </Field>
                        <Field>
                            <div className="flex flex-row gap-1">
                                <Label htmlFor="display-name">Display Name</Label>
                                <Label className="text-muted-foreground italic">
                                    (Required)
                                </Label>
                            </div>
                            <Input
                                id="display-name"
                                name="display_name"
                                value={displayName}
                                onChange={(event) => setDisplayName(event.target.value)}
                                disabled={isSaving}
                                required
                            />
                        </Field>
                        <Field>
                            <div className="flex flex-row gap-1">
                                <Label htmlFor="profile-description">Description</Label>
                                <Label className="text-muted-foreground italic">
                                    (Optional)
                                </Label>
                            </div>
                            <Textarea
                                id="profile-description"
                                name="description"
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                disabled={isSaving}
                            />
                        </Field>
                    </FieldGroup>

                    <DialogFooter className="mt-3">
                        <DialogClose asChild>
                            <Button variant="ghost" disabled={isSaving}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button variant="submit" type="submit" disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

async function uploadProfileImage(image: File) {
    const uploadFormImage = new FormData();
    uploadFormImage.append("image", image);

    const presignRes = await api.post<PresignResponse>(
        "/api/upload/image",
        uploadFormImage
    );

    const { upload_url, public_url } = presignRes.data;

    if (!upload_url || !public_url) {
        throw new Error("Upload service did not return the required upload details.");
    }

    await axios.put(upload_url, image, {
        headers: {
            "Content-Type": image.type || "application/octet-stream",
        },
    });

    return public_url;
}

function mergeUpdatedUser(currentUser: UserProfile, data: unknown): UserProfile {
    if (!data || typeof data !== "object") {
        return currentUser;
    }

    if ("auth_user" in data && "profile" in data) {
        return data as UserProfile;
    }

    if ("profile" in data && data.profile && typeof data.profile === "object") {
        return {
            ...currentUser,
            profile: {
                ...currentUser.profile,
                ...data.profile,
            },
        };
    }

    return currentUser;
}

function getErrorMessage(error: unknown) {
    if (axios.isAxiosError(error)) {
        const apiError = error.response?.data;

        if (typeof apiError?.detail === "string") {
            return apiError.detail;
        }

        if (typeof apiError?.error === "string") {
            return apiError.error;
        }
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "Profile update failed.";
}
