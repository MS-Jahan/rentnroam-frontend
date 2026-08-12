"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/field";
import { FormField } from "@/components/ui/form-field";
import { Badge } from "@/components/ui/badge";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  async function onSubmit(data: ContactFormValues) {
    setFormError("");
    setLoading(true);
    try {
      // First try proxy route, fallback to direct API
      let res = await fetch("/api/proxy?path=/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/contact`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }

      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json.message || "Failed to send contact message");
      }

      setSubmitted(true);
      toast.success("Message sent! Our support team will get back to you shortly.");
      reset();
    } catch (err: any) {
      const msg = err.message || "Failed to send message";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <Badge variant="default" className="mx-auto">Get In Touch</Badge>
        <h1 className="font-display text-4xl sm:text-5xl uppercase text-ink">
          Contact RentNRoam Support
        </h1>
        <p className="text-sm text-muted leading-relaxed">
          Have a question about a rental order, payment inquiry, or provider partnership? Drop us a message.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-12 items-start max-w-6xl mx-auto">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-line bg-panel p-6 space-y-5 shadow-xs">
            <h3 className="font-semibold text-lg text-ink border-b border-line pb-3">Contact Information</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-blaze/10 flex items-center justify-center text-blaze shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-ink">Head Office</p>
                  <p className="text-xs text-muted">Banani & Gulshan Avenue, Dhaka, Bangladesh</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-moss/10 flex items-center justify-center text-moss dark:text-fern shrink-0 mt-0.5">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-ink">Email Support</p>
                  <p className="text-xs text-muted">support@rentnroam.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 shrink-0 mt-0.5">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-ink">Phone Helpline</p>
                  <p className="text-xs text-muted">+880 1700-000001 (Sun–Thu, 9am–6pm)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-ink">Response Time</p>
                  <p className="text-xs text-muted">Within 24 business hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-line bg-panel p-6 sm:p-8 space-y-6 shadow-sm">
            <h3 className="font-semibold text-xl text-ink">Send Us a Message</h3>

            {submitted ? (
              <div className="p-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <h4 className="font-semibold text-lg text-emerald-800 dark:text-emerald-300">Message Delivered!</h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 max-w-sm mx-auto">
                  Thank you for reaching out. We have logged your support request and will reply via email shortly.
                </p>
                <Button type="button" variant="ghost" onClick={() => setSubmitted(false)} className="text-xs mt-2">
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    id="name"
                    label="Your Name"
                    error={errors.name?.message}
                    required
                  >
                    <Input
                      placeholder="e.g. Rahim Khan"
                      className="rounded-xl text-xs"
                      {...register("name")}
                    />
                  </FormField>

                  <FormField
                    id="email"
                    label="Email Address"
                    error={errors.email?.message}
                    required
                  >
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      className="rounded-xl text-xs"
                      {...register("email")}
                    />
                  </FormField>
                </div>

                <FormField
                  id="subject"
                  label="Subject"
                  error={errors.subject?.message}
                  required
                >
                  <Input
                    placeholder="e.g. Rental pickup inquiry for order #123"
                    className="rounded-xl text-xs"
                    {...register("subject")}
                  />
                </FormField>

                <FormField
                  id="message"
                  label="Message"
                  error={errors.message?.message}
                  required
                >
                  <Textarea
                    rows={4}
                    placeholder="Provide relevant details about your question or inquiry..."
                    className="rounded-xl text-xs"
                    {...register("message")}
                  />
                </FormField>

                {formError && (
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">{formError}</p>
                )}

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full rounded-xl py-3 font-semibold bg-blaze text-white hover:bg-blaze/90 shadow-xs"
                >
                  <Send className="h-4 w-4" />
                  <span>Submit Support Request</span>
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
