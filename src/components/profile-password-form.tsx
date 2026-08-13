"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { KeyRound, Lock, CheckCircle } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { FormField } from "@/components/ui/form-field";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .regex(/(?=.*[A-Za-z])(?=.*\d)/, "Must contain at least one letter and one digit"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function ProfilePasswordForm() {
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  async function onSubmit(data: PasswordFormValues) {
    setFormError("");
    setLoading(true);
    try {
      await apiClient("/api/profile/password", {
        auth: true,
        method: "PATCH",
        body: {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
      });
      toast.success("Password changed successfully!");
      reset();
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : err.message || "Failed to update password";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      <div className="flex items-center gap-2 text-base font-semibold text-ink border-b border-line pb-3">
        <KeyRound className="h-5 w-5 text-blaze" />
        <span>Change Password</span>
      </div>

      <FormField
        id="currentPassword"
        label="Current Password"
        error={errors.currentPassword?.message}
        required
      >
        <Input
          type="password"
          placeholder="••••••••"
          className="rounded-xl"
          {...register("currentPassword")}
        />
      </FormField>

      <FormField
        id="newPassword"
        label="New Password"
        description="At least 8 characters with letters and numbers"
        error={errors.newPassword?.message}
        required
      >
        <Input
          type="password"
          placeholder="••••••••"
          className="rounded-xl"
          {...register("newPassword")}
        />
      </FormField>

      <FormField
        id="confirmPassword"
        label="Confirm New Password"
        error={errors.confirmPassword?.message}
        required
      >
        <Input
          type="password"
          placeholder="••••••••"
          className="rounded-xl"
          {...register("confirmPassword")}
        />
      </FormField>

      {formError && (
        <p className="text-xs text-red-600 dark:text-red-400 font-medium">{formError}</p>
      )}

      <Button
        type="submit"
        loading={loading}
        className="rounded-xl px-5 py-2.5 bg-blaze text-white hover:bg-blaze/90"
      >
        Update Password
      </Button>
    </form>
  );
}
